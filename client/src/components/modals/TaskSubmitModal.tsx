import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Bot, Crown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePremium } from "@/hooks/use-premium";
import { cn } from "@/lib/utils";
import LimitExceededSnack from "./LimitExceededSnack";
import ProSubscriptionSnack from "./ProSubscriptionSnack";

interface TaskSubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  taskTitle: string;
  taskDescription: string;
  onSuccess?: () => void;
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
  onSuccess,
}: TaskSubmitModalProps) {
  const [answer, setAnswer] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<AIEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [mentorCheck, setMentorCheck] = useState(false);
  const [showLimitSnack, setShowLimitSnack] = useState(false);
  const [showProSnack, setShowProSnack] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isPro } = usePremium();
  const queryClient = useQueryClient();

  // Лимит символов: безгранично для PRO, 1000 для Free
  const maxChars = isPro ? Infinity : 1000;
  const charCount = answer.length;
  const isOverLimit = !isPro && charCount > maxChars;

  // Показываем снек при превышении лимита (только один раз)
  useEffect(() => {
    if (isOverLimit && !showLimitSnack) {
      setShowLimitSnack(true);
    } else if (!isOverLimit) {
      setShowLimitSnack(false);
    }
  }, [isOverLimit, showLimitSnack]);

  const submitMutation = useMutation({
    mutationFn: async (data: { description: string; mentorCheck: boolean }) => {
      setIsEvaluating(true);
      const response = await apiRequest("POST", `/api/tasks/${taskId}/solutions${user?.id ? `?userId=${user.id}` : ''}`, {
        taskId,
        description: data.description,
        taskDescription: taskDescription,
        mentorCheck: data.mentorCheck,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsEvaluating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (onSuccess) {
        onSuccess({ content: answer, description: answer, evaluation: data.evaluation });
      }
      handleClose();
    },
    onError: () => {
      setIsEvaluating(false);
      toast({ title: "Ошибка при отправке решения", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!answer.trim()) return;
    if (isOverLimit) return;
    
    // Если Free пользователь включил "Проверка от ментора", показываем снек
    if (mentorCheck && !isPro) {
      setShowProSnack(true);
      return;
    }
    
    setEvaluationResult(null);
    submitMutation.mutate({ description: answer, mentorCheck: mentorCheck && isPro });
  };

  const handleClose = () => {
    setAnswer("");
    setEvaluationResult(null);
    setIsEvaluating(false);
    setMentorCheck(false);
    setShowLimitSnack(false);
    setShowProSnack(false);
    onOpenChange(false);
  };

  const handleAnswerChange = (value: string) => {
    // Если PRO - без ограничений
    if (isPro) {
      setAnswer(value);
      return;
    }
    
    // Если Free - останавливаем ввод при превышении лимита
    if (value.length <= maxChars) {
      setAnswer(value);
      setShowLimitSnack(false);
    }
    // Если превышен лимит - не обновляем answer, оставляем предыдущее значение
    // Снек уже показывается через useEffect
  };

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
              {mentorCheck ? "Ментор проверяет ваш ответ..." : "ИИ проверяет ваш ответ..."}
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Bot className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Ваш ответ проверит {mentorCheck && isPro ? "ментор платформы" : "ИИ"} и даст обратную связь
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Опишите решение данной задачи максимально подробно, стараясь затронуть
                все корнер кейсы. Структурируйте ваш ответ для удобства проверки.
              </p>
            </div>

            <div className="px-6 pb-4">
              <div className={cn(
                "relative border rounded-xl bg-[#F9F9F9] p-4",
                isOverLimit ? "border-red-500" : "border-border"
              )}>
                <Textarea
                  placeholder="Введите ваш ответ..."
                  value={answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className={cn(
                    "min-h-[200px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm pr-16 pb-8",
                    isOverLimit && "text-red-500"
                  )}
                  data-testid="input-solution-text"
                />
                <div className={cn(
                  "absolute bottom-4 right-4 text-xs",
                  isOverLimit ? "text-red-500 font-medium" : "text-muted-foreground"
                )}>
                  {isPro ? (
                    `${charCount} символов`
                  ) : (
                    `${charCount} / ${maxChars}`
                  )}
                </div>
              </div>
            </div>

            {/* Снек при превышении лимита */}
            <LimitExceededSnack
              open={showLimitSnack}
              onClose={() => setShowLimitSnack(false)}
              onStayFree={() => setShowLimitSnack(false)}
              onUpgradeToPro={() => {
                setShowLimitSnack(false);
                // TODO: Открыть модалку покупки PRO подписки
                toast({
                  title: "Обновление до PRO",
                  description: "Функция покупки PRO подписки будет доступна в ближайшее время",
                });
              }}
            />

            {/* Снек для PRO подписки (проверка от ментора) */}
            <ProSubscriptionSnack
              open={showProSnack}
              onClose={() => setShowProSnack(false)}
              onStayFree={() => setShowProSnack(false)}
              onUpgradeToPro={() => {
                setShowProSnack(false);
                // TODO: Открыть модалку покупки PRO подписки
                toast({
                  title: "Обновление до PRO",
                  description: "Функция покупки PRO подписки будет доступна в ближайшее время",
                });
              }}
            />

            {/* Плашка "Проверка от ментора" - видна всем, но работает только для PRO */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F9F9] border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-4 w-4 text-[#FF6030]" />
                    <Label htmlFor="mentor-check" className="text-sm font-medium text-[#1D1D1F] cursor-pointer">
                      Проверка от ментора
                    </Label>
                    {!isPro && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#FF6030] text-white font-medium">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPro 
                      ? "Ваш ответ проверит ментор платформы вместо ИИ"
                      : "Обновите аккаунт до PRO, чтобы получить проверку от ментора"
                    }
                  </p>
                </div>
                <Switch
                  id="mentor-check"
                  checked={mentorCheck}
                  onCheckedChange={(checked) => {
                    if (checked && !isPro) {
                      // Показываем снек о необходимости PRO подписки
                      setShowProSnack(true);
                      setMentorCheck(false);
                    } else {
                      setMentorCheck(checked);
                    }
                  }}
                  disabled={!isPro && mentorCheck}
                />
              </div>
            </div>

            <div className="p-6 pt-2">
              <Button
                className="w-full bg-[#FF6030] hover:bg-[#E55525] text-white rounded-xl h-11"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !answer.trim() || isOverLimit}
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
