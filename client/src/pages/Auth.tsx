import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import authBgImage from "@assets/BGauth_1767278053848.png";
import taglineImage from "@assets/tagline_text.png";
import draftsLogoWhite from "@assets/draftslogo_1767278269094.png";

type AuthMode = "login" | "register";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithOtp, isConfigured, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    
    if (!isConfigured) {
      toast({
        title: "Авторизация не настроена",
        description: "Необходимо настроить Supabase для работы авторизации.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signInWithOtp(email);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Проверьте почту",
      description: "Мы отправили вам код для входа.",
    });
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Google авторизация",
      description: "Эта функция будет доступна позже.",
    });
  };

  return (
    <div className="min-h-screen bg-white p-5">
      <div className="h-[calc(100vh-40px)] flex">
        {/* Left Side - Gradient Hero */}
        <div 
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl"
          style={{
            backgroundImage: `url(${authBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 flex flex-col justify-between p-10 w-full">
            {/* Logo */}
            <img 
              src={draftsLogoWhite} 
              alt="Drafts" 
              style={{ width: '160px', height: '16px' }}
            />
            
            {/* Tagline Image */}
            <div className="mb-10">
              <img 
                src={taglineImage} 
                alt="Место где дизайнеры развиваются" 
                className="max-w-full h-auto"
                style={{ maxWidth: '80%' }}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Back Button */}
          <Button
            variant="secondary"
            className="mb-6 gap-2 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#1D1D1F] rounded-xl"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#1D1D1F] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">/</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">DRAFTS</span>
          </div>

          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-8">
            {mode === "login" ? "Вход" : "Регистрация"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="Почта" 
                required 
                className="h-12 pl-12 bg-[#F4F4F5] border-0 rounded-xl text-[#1D1D1F] placeholder:text-muted-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Пароль" 
                required 
                className="h-12 pl-12 bg-[#F4F4F5] border-0 rounded-xl text-[#1D1D1F] placeholder:text-muted-foreground"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full h-12 bg-[#FF6030] hover:bg-[#E55528] text-white font-medium rounded-xl"
              disabled={isLoading || !email || !password}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "login" ? "Входим..." : "Регистрируем..."}
                </>
              ) : (
                mode === "login" ? "Войти" : "Зарегистрироваться"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-foreground">Или</span>
            </div>
          </div>

          {/* Google Button */}
          <Button 
            type="button"
            variant="outline"
            className="w-full h-12 border-border rounded-xl font-medium"
            onClick={handleGoogleLogin}
            data-testid="button-google"
          >
            <SiGoogle className="mr-2 h-4 w-4" />
            {mode === "login" ? "Войти через Google" : "Регистрация через Google"}
          </Button>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === "login" && (
              <button 
                type="button"
                className="text-sm text-muted-foreground hover:text-[#1D1D1F] transition-colors"
                data-testid="link-forgot-password"
              >
                Забыли пароль?
              </button>
            )}
            
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Нет аккаунта? " : "Есть аккаунт? "}
              <button
                type="button"
                className="text-[#FF6030] hover:underline font-medium"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                data-testid="link-switch-mode"
              >
                {mode === "login" ? "Зарегистрируйтесь" : "Войдите"}
              </button>
            </p>
          </div>

          {!isConfigured && (
            <p className="text-center text-xs text-muted-foreground mt-6">
              Авторизация не настроена. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.
            </p>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  );
}
