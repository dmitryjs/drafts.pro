import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}

export default function AuthRequiredModal({
  open,
  onOpenChange,
  message,
}: AuthRequiredModalProps) {
  const [, navigate] = useLocation();

  const handleAuth = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-[#1D1D1F] text-center">
            Требуется авторизация
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <p className="text-center text-muted-foreground mb-6" data-testid="text-auth-message">
            {message}
          </p>

          <Button
            className="w-full bg-[#FF6030] hover:bg-[#E55528] text-[#1D1D1F] font-medium rounded-xl"
            onClick={handleAuth}
            data-testid="button-auth-redirect"
          >
            Авторизоваться
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
