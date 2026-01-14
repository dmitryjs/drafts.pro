import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth as useSupabaseAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import authBgImage from "@assets/Авторизация баннер.png";
import taglineImage from "@assets/tagline_text.png";
import draftsLogoWhite from "@assets/draftslogo_1767278269094.png";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { user, isLoading, signInWithOtp, verifyOtp, isConfigured } = useSupabaseAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Введите email");
      return;
    }

    if (!isConfigured || !supabase) {
      setError("Supabase не настроен. Проверьте переменные окружения.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!otpSent) {
        // Отправляем OTP код на email
        const { error } = await signInWithOtp(email);
        if (error) {
          setError(error.message || "Ошибка отправки кода");
          setIsSubmitting(false);
          return;
        }
        setOtpSent(true);
        setError("");
      } else {
        // Проверяем OTP код
        const { error } = await verifyOtp(email, otpCode);
        if (error) {
          setError(error.message || "Неверный код");
          setIsSubmitting(false);
          return;
        }
        // Успешная авторизация - редирект произойдет автоматически через useEffect
      }
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-5">
      <div className="h-[calc(100vh-32px)] sm:h-[calc(100vh-40px)] flex">
        {/* Left Side - Gradient Hero */}
        <div 
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl"
          style={{
            backgroundImage: `url(${authBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="relative z-10 flex flex-col justify-between p-10 w-full">
            {/* Logo */}
            <div>
              <img 
                src={draftsLogoWhite} 
                alt="Drafts" 
                style={{ width: '160px', height: '16px', display: 'block' }}
                className="block"
              />
            </div>
            
            {/* Tagline Image */}
            <div className="mb-10">
              <img 
                src={taglineImage} 
                alt="Место где дизайнеры развиваются" 
                className="max-w-full h-auto"
                style={{ maxWidth: '80%', display: 'block', position: 'relative', zIndex: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center bg-white px-2 sm:px-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            {/* Back Button */}
            <Button
              variant="secondary"
              className="mb-4 sm:mb-6 gap-2 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#1D1D1F] rounded-xl text-sm"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6 sm:mb-8">
              <div className="w-8 h-8 bg-[#1D1D1F] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">/</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">DRAFTS</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] mb-2">
              {isLoginMode ? "Добро пожаловать" : "Создать аккаунт"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {isLoginMode 
                ? "Войдите чтобы получить доступ ко всем возможностям платформы"
                : "Зарегистрируйтесь чтобы начать развиваться как дизайнер"
              }
            </p>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
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
                    disabled={otpSent}
                    className="pl-10 rounded-xl h-11 sm:h-12 text-sm"
                    data-testid="input-email"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <Label htmlFor="otp" className="text-xs sm:text-sm font-medium">
                    Код подтверждения
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Введите код из email"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="rounded-xl h-11 sm:h-12 text-sm"
                      data-testid="input-otp"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Код отправлен на {email}
                  </p>
                </div>
              )}

              {error && (
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              )}

              <Button 
                type="submit"
                disabled={isSubmitting || (otpSent && !otpCode)}
                className="w-full h-11 sm:h-12 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white font-medium rounded-xl text-sm sm:text-base"
                data-testid="button-submit"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : otpSent ? (
                  "Подтвердить"
                ) : (
                  "Отправить код"
                )}
              </Button>
            </form>

            {otpSent && (
              <Button
                variant="ghost"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                  setError("");
                }}
                className="w-full mt-2 text-sm"
              >
                Изменить email
              </Button>
            )}


          </motion.div>
        </div>
      </div>
    </div>
  );
}
