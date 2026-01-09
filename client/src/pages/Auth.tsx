import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import authBgImage from "@assets/BGauth_1767278053848.png";
import taglineImage from "@assets/tagline_text.png";
import draftsLogoWhite from "@assets/draftslogo_1767278269094.png";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsSubmitting(true);
    
    // For now, redirect to Replit Auth as fallback
    // In future, implement custom email/password auth
    window.location.href = "/api/login";
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

        {/* Right Side - Auth Form */}
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

            <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">
              {isLoginMode ? "Добро пожаловать" : "Создать аккаунт"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isLoginMode 
                ? "Войдите чтобы получить доступ ко всем возможностям платформы"
                : "Зарегистрируйтесь чтобы начать развиваться как дизайнер"
              }
            </p>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 rounded-xl"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLoginMode && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Подтвердите пароль
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 rounded-xl"
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white font-medium rounded-xl"
                data-testid="button-submit"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  isLoginMode ? "Войти" : "Создать аккаунт"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-muted-foreground">или</span>
              </div>
            </div>

            {/* Google Auth Button */}
            <Button 
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 rounded-xl gap-3"
              data-testid="button-google-login"
            >
              <SiGoogle className="h-5 w-5" />
              Войти через Google
            </Button>

            {/* Toggle Login/Register */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError("");
                }}
                className="text-[#FF6030] hover:underline font-medium"
                data-testid="button-toggle-mode"
              >
                {isLoginMode ? "Зарегистрироваться" : "Войти"}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
