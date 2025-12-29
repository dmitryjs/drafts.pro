import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, ArrowRight, TrendingUp } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: 1, title: "Загрузите портфолио", description: "PDF, Behance или Dribbble ссылка", icon: Upload },
  { id: 2, title: "Загрузите резюме", description: "PDF или Word документ", icon: FileText },
  { id: 3, title: "Пройдите тест", description: "15-20 вопросов по вашей специализации", icon: CheckCircle },
];

export default function Assessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);

  const rightPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Как это работает</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>1. Загрузите ваше портфолио для анализа качества работ</p>
          <p>2. Добавьте резюме для оценки опыта</p>
          <p>3. Пройдите тест для проверки теоретических знаний</p>
          <p>4. Получите персональную оценку и рекомендации по зарплате</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-3">Преимущества</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Объективная оценка навыков</li>
          <li>Рекомендации по развитию</li>
          <li>Рыночная оценка зарплаты</li>
          <li>Верификация для работодателей</li>
        </ul>
      </div>
    </div>
  );

  if (assessmentComplete) {
    return (
      <MainLayout rightPanel={rightPanel} title="Оценка навыков" showCreateButton={false}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ваш уровень: Middle</h2>
            <p className="text-muted-foreground mb-6">
              На основе анализа портфолио, резюме и теста
            </p>
            
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="text-sm text-muted-foreground mb-1">Рекомендованная зарплата</div>
              <div className="text-3xl font-bold text-primary">120 000 - 180 000 ₽</div>
              <div className="text-sm text-muted-foreground mt-1">в месяц</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-left mb-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">85%</div>
                <div className="text-xs text-muted-foreground">Дизайн системы</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">72%</div>
                <div className="text-xs text-muted-foreground">UX исследования</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">90%</div>
                <div className="text-xs text-muted-foreground">Визуальный дизайн</div>
              </div>
            </div>

            <Button onClick={() => setAssessmentComplete(false)}>
              Пройти заново
            </Button>
          </Card>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout rightPanel={rightPanel} title="Оценка навыков" showCreateButton={false}>
      <div className="max-w-2xl space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Прогресс оценки</span>
            <span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-5 ${isCurrent ? 'ring-2 ring-primary' : ''} ${isCompleted ? 'bg-muted/30' : ''}`}
                  data-testid={`assessment-step-${step.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-100 text-emerald-600' : 
                      isCurrent ? 'bg-primary text-primary-foreground' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>

                    {isCurrent && (
                      <Button onClick={() => {
                        if (currentStep < steps.length - 1) {
                          setCurrentStep(currentStep + 1);
                        } else {
                          setAssessmentComplete(true);
                        }
                      }}>
                        {currentStep === steps.length - 1 ? "Завершить" : "Далее"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
