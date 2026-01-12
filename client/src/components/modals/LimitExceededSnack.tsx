import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LimitExceededSnackProps {
  open: boolean;
  onClose: () => void;
  onStayFree: () => void;
  onUpgradeToPro: () => void;
}

export default function LimitExceededSnack({
  open,
  onClose,
  onStayFree,
  onUpgradeToPro,
}: LimitExceededSnackProps) {
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
          className="fixed top-4 right-4 z-[100] bg-white border border-border rounded-xl shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#1D1D1F] mb-2">
                Превышен лимит символов
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Вы достигли лимита по символам в ответе, здесь вы сможете прочитать почему существуют лимиты по символам. 
                Также, вы можете обновить свой аккаунт до PRO и снять ограничения.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStayFree}
                  className="flex-1 text-xs h-8 bg-[#E8E8E8] hover:bg-[#DCDCE4] text-[#1D1D1F] border-0"
                >
                  Остаться на Free
                </Button>
                <Button
                  size="sm"
                  onClick={onUpgradeToPro}
                  className="flex-1 text-xs h-8 bg-[#FF6030] hover:bg-[#E55525] text-white"
                >
                  Обновить до PRO
                </Button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-[#1D1D1F] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(snackContent, document.body);
}
