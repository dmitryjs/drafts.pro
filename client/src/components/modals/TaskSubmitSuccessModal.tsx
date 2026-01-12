import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

interface TaskSubmitSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskSubmitSuccessModal({
  open,
  onOpenChange,
}: TaskSubmitSuccessModalProps) {
  const [, setLocation] = useLocation();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleGoToTasks = () => {
    onOpenChange(false);
    setLocation("/");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 bg-white">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-[#11D55D] flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#1D1D1F] mb-2">
              Задача отправлена на проверку!
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-sm text-muted-foreground mb-6">
            Ваша задача проверяется системой, это может занять от 30 минут до 3-х часов. 
            Оценка вашего ответа и комментарии будут доступны на странице решаемой задачи.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-[#E8E8E8] hover:bg-[#DCDCE4] text-[#1D1D1F] border-0 rounded-xl h-11"
              onClick={handleClose}
            >
              Закрыть
            </Button>
            <Button
              className="flex-1 bg-[#FF6030] hover:bg-[#E55525] text-white rounded-xl h-11"
              onClick={handleGoToTasks}
            >
              К списку задач
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
