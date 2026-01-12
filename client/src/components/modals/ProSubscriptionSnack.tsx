import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Crown } from "lucide-react";

interface ProSubscriptionSnackProps {
  open: boolean;
  onClose: () => void;
  onStayFree: () => void;
  onUpgradeToPro: () => void;
}

export default function ProSubscriptionSnack({
  open,
  onClose,
  onStayFree,
  onUpgradeToPro,
}: ProSubscriptionSnackProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  const snackContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-[100] rounded-xl shadow-lg p-6 max-w-sm"
          style={{ 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            zIndex: 9999 
          }}
        >
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-bold text-white">
                Проверка от ментора
              </h4>
              <button
                onClick={onClose}
                className="h-5 w-5 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-white/90 leading-relaxed">
              Проверка от ментора платформы доступна только в PRO тарифе, подпишитесь чтобы разблокировать этот функционал
            </p>

            {/* Benefits List */}
            <div>
              <h5 className="text-base font-bold text-white mb-3">
                Что еще дает подписка PRO?
              </h5>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">•</span>
                  <span>Неограниченное количество символов в ответе</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">•</span>
                  <span>Проверка ответа от ментора</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">•</span>
                  <span>Неограниченное количество задач в день</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">•</span>
                  <span>Создание дизайн-батлов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">•</span>
                  <span>Чат с ментором</span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onStayFree}
                className="flex-1 text-sm h-10 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Остаться на Free
              </Button>
              <Button
                size="sm"
                onClick={onUpgradeToPro}
                className="flex-1 text-sm h-10 bg-white/20 hover:bg-white/30 text-white border-0 flex items-center justify-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Обновить до PRO
              </Button>
            </div>

            {/* Details Link */}
            <div className="text-center pt-2">
              <button
                onClick={onUpgradeToPro}
                className="text-xs text-white/80 hover:text-white underline transition-colors"
              >
                Подробнее
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(snackContent, document.body);
}
