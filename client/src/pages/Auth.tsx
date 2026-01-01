import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import authBgImage from "@assets/BGauth_1767278053848.png";
import taglineImage from "@assets/tagline_text.png";
import draftsLogoWhite from "@assets/draftslogo_1767278269094.png";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
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

        {/* Right Side - Auth Options */}
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
              Добро пожаловать
            </h2>
            <p className="text-muted-foreground mb-8">
              Войдите чтобы получить доступ ко всем возможностям платформы
            </p>

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              className="w-full h-12 bg-[#FF6030] hover:bg-[#E55528] text-white font-medium rounded-xl mb-4"
              data-testid="button-login"
            >
              Войти в аккаунт
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-muted-foreground">Доступные способы входа</span>
              </div>
            </div>

            {/* Auth Methods Info */}
            <div className="flex justify-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#F4F4F5]">
                <SiGoogle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#F4F4F5]">
                <SiGithub className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#F4F4F5]">
                <SiApple className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Нажмите "Войти в аккаунт" чтобы выбрать способ авторизации
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
