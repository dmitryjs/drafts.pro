import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TaskSubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  taskTitle: string;
  taskDescription: string;
}

interface AIEvaluationResult {
  isCorrect: boolean;
  feedback: string;
}

export default function TaskSubmitModal({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  taskDescription,
}: TaskSubmitModalProps) {
  const [answer, setAnswer] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<AIEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: { description: string }) => {
      setIsEvaluating(true);
      const response = await apiRequest("POST", `/api/tasks/${taskId}/solutions`, {
        taskId,
        description: data.description,
        taskDescription: taskDescription,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsEvaluating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (data.evaluation) {
        setEvaluationResult(data.evaluation);
      } else {
        toast({ title: "Решение отправлено!" });
        handleClose();
      }
    },
    onError: () => {
      setIsEvaluating(false);
      toast({ title: "Ошибка при отправке решения", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setEvaluationResult(null);
    submitMutation.mutate({ description: answer });
  };

  const handleClose = () => {
    setAnswer("");
    setEvaluationResult(null);
    setIsEvaluating(false);
    onOpenChange(false);
  };

  const handleTryAgain = () => {
    setAnswer("");
    setEvaluationResult(null);
  };

  const charCount = answer.length;
  const maxChars = 1000;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 bg-white">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-[#1D1D1F]">
            Решение задачи
          </DialogTitle>
          <DialogDescription className="sr-only">
            Отправьте ваше решение на проверку
          </DialogDescription>
        </DialogHeader>

        {isEvaluating ? (
          <div className="px-6 pb-6 flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-[#FF6030]" />
              <Bot className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF6030]" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              ИИ проверяет ваш ответ...
            </p>
          </div>
        ) : evaluationResult ? (
          <div className="px-6 pb-6">
            <div className={cn(
              "rounded-xl p-6 mb-4",
              evaluationResult.isCorrect ? "bg-green-50" : "bg-amber-50"
            )}>
              <div className="flex items-center gap-3 mb-3">
                {evaluationResult.isCorrect ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-amber-600" />
                )}
                <h3 className={cn(
                  "text-lg font-semibold",
                  evaluationResult.isCorrect ? "text-green-700" : "text-amber-700"
                )}>
                  {evaluationResult.isCorrect ? "Отличная работа!" : "Попробуйте ещё раз"}
                </h3>
              </div>
              <p className={cn(
                "text-sm leading-relaxed",
                evaluationResult.isCorrect ? "text-green-700" : "text-amber-700"
              )}>
                {evaluationResult.feedback}
              </p>
            </div>
            
            {!evaluationResult.isCorrect && (
              <p className="text-xs text-muted-foreground text-center mb-4">
                Повторная попытка доступна через 3 часа
              </p>
            )}
            
            <Button
              className="w-full bg-[#2D2D2D] hover:bg-[#1D1D1F] text-white rounded-xl h-11"
              onClick={handleClose}
              data-testid="button-close-result"
            >
              Закрыть
            </Button>
          </div>
        ) : (
          <>
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Bot className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Ваш ответ проверит ИИ и даст обратную связь
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Опишите решение данной задачи максимально подробно, стараясь затронуть
                все корнер кейсы. Структурируйте ваш ответ для удобства проверки.
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
                  className="min-h-[200px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm"
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
                Отправить на проверку
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
