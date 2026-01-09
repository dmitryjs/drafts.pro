import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TaskSubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  taskTitle: string;
}

export default function TaskSubmitModal({
  open,
  onOpenChange,
  taskId,
  taskTitle,
}: TaskSubmitModalProps) {
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: { description: string }) => {
      return apiRequest("POST", `/api/tasks/${taskId}/solutions`, {
        taskId,
        description: data.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Решение отправлено!" });
      setAnswer("");
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Ошибка при отправке решения", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!answer.trim()) return;
    submitMutation.mutate({ description: answer });
  };

  const charCount = answer.length;
  const maxChars = 500;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 bg-white">
        <DialogHeader className="p-6 pb-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-[#1D1D1F]">
            Решение задачи
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-submit-modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground mb-4">
            Опишите решение данной задачи максимально подробно стараясь затронуть
            все корнер кейсы, не забудьте структурировать ваш ответ чтобы его было
            легче проверить.
          </p>
        </div>

        <div className="px-6 pb-4">
          <div className="relative border border-border rounded-xl bg-[#F9F9F9] p-4">
            <Textarea
              placeholder="Введите ваш ответ..."
              value={answer}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) {
                  setAnswer(e.target.value);
                }
              }}
              className="min-h-[180px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm"
              data-testid="input-solution-text"
            />
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
              {charCount} / {maxChars}
            </div>
          </div>
        </div>

        <div className="p-6 pt-2">
          <Button
            className="w-full bg-[#FF6030] hover:bg-[#E55525] text-white rounded-xl h-11"
            onClick={handleSubmit}
            disabled={submitMutation.isPending || !answer.trim()}
            data-testid="button-submit-solution"
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Отправить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
