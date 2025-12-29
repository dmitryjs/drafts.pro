import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthStep = "email" | "otp";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithOtp, verifyOtp, isConfigured, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    
    if (!isConfigured) {
      toast({
        title: "Auth not configured",
        description: "Supabase credentials are not set up. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signInWithOtp(email);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error sending code",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Check your email",
      description: "We sent you a 6-digit code to verify your email.",
    });
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setIsLoading(true);
    const { error } = await verifyOtp(email, otp);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Invalid code",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome!",
      description: "You have successfully signed in.",
    });
    setLocation("/");
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("email");
      setOtp("");
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-black/90">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Button 
          variant="ghost" 
          className="mb-4 pl-0 hover:bg-transparent"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          {step === "otp" ? "Change email" : "Back to home"}
        </Button>
        
        <Card className="border-border/50 shadow-xl">
          {step === "email" ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Sign in with Email
                </CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a one-time code to sign in.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSendOtp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      required 
                      className="h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full h-11 text-base font-semibold" 
                    disabled={isLoading || !email}
                    data-testid="button-send-code"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      "Send verification code"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Enter verification code
                </CardTitle>
                <CardDescription>
                  We sent a 6-digit code to <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleVerifyOtp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input 
                      id="otp" 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456" 
                      required 
                      className="h-11 text-center text-2xl tracking-widest font-mono"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      data-testid="input-otp"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button 
                    className="w-full h-11 text-base font-semibold" 
                    disabled={isLoading || otp.length !== 6}
                    data-testid="button-verify"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify and sign in"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={isLoading}
                  >
                    Resend code
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
        </Card>

        {!isConfigured && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable.
          </p>
        )}
      </motion.div>
    </div>
  );
}
