import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  TrendingUp, 
  Clock, 
  X,
  AlertTriangle,
  BarChart3,
  Globe,
  Loader2,
  XCircle
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AssessmentStep = "upload" | "processing" | "sphere" | "testing" | "results";

interface FeedbackItem {
  title: string;
  description: string;
  isPositive: boolean;
}

interface Sphere {
  id: string;
  name: string;
  description: string;
  questionsCount: number;
}

const spheres: Sphere[] = [
  { id: "product", name: "Продакт дизайн", description: "Дизайн продуктов и сервисов", questionsCount: 25 },
  { id: "uxui", name: "UX/UI дизайн", description: "Пользовательский опыт и интерфейсы", questionsCount: 30 },
  { id: "graphic", name: "Графический дизайн", description: "Визуальные коммуникации и брендинг", questionsCount: 20 },
  { id: "3d", name: "3D дизайн", description: "Трёхмерная графика и визуализация", questionsCount: 22 },
  { id: "motion", name: "Моушн дизайн", description: "Анимация и видео", questionsCount: 18 },
];

const mockQuestions = [
  {
    id: 1,
    question: "Что такое дизайн-система?",
    options: [
      "Набор цветов и шрифтов",
      "Комплексная система компонентов, стилей и правил их использования",
      "Программа для создания дизайна",
      "Методология разработки"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Какой принцип гештальт-психологии описывает группировку элементов по близости?",
    options: [
      "Принцип замкнутости",
      "Принцип подобия",
      "Принцип близости",
      "Принцип непрерывности"
    ],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "Что такое A/B тестирование в дизайне?",
    options: [
      "Тестирование двух версий дизайна на разных группах пользователей",
      "Проверка совместимости с браузерами",
      "Тестирование на мобильных устройствах",
      "Проверка доступности"
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Что означает аббревиатура CJM?",
    options: [
      "Creative Journey Map",
      "Customer Journey Map",
      "Content Journey Method",
      "Client Journey Model"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "Какой контраст считается минимально допустимым для текста по WCAG AA?",
    options: [
      "3:1",
      "4.5:1",
      "7:1",
      "2:1"
    ],
    correctAnswer: 1
  }
];

const mockFeedbackItems: FeedbackItem[] = [
  {
    title: "Профессиональное саммари",
    description: "Отличное саммари: указана роль, опыт и ключевые компетенции. Рекрутер сразу видит роль, опыт, домены и подходы — именно то, что нужно для быстрого скрининга",
    isPositive: true
  },
  {
    title: "Фокус на достижениях",
    description: "Указаны конкретные метрики: «Улучшил показатели Retention на 8%», «Conversion Rate вырос с 45% до 62%». Классическая формула Действие+Результат+Метрика — рекрутеры любят такие цифры",
    isPositive: true
  },
  {
    title: "Ссылки и ресурсы",
    description: "Есть LinkedIn, Dribbble, Dprofile — полный набор для дизайнера. Рекрутеры сразу перейдут по ссылкам проверить кейсы, это ускоряет процесс отбора",
    isPositive: true
  },
  {
    title: "Контактная информация",
    description: "Полные контакты: email, LinkedIn, Dribbble. Укажи город/релокацию — для международных вакансий это важно",
    isPositive: true
  },
  {
    title: "Опыт работы",
    description: "Обратная хронология, конкретика: компании, роли, сроки. Понятно, чем занимался и в каких продуктах",
    isPositive: true
  },
  {
    title: "Количественные показатели",
    description: "Много метрик: «Retention +8%», «Conversion 45→62%», «D7 Retention +12%». Отлично показывает влияние на бизнес",
    isPositive: true
  },
  {
    title: "Навыки анимации",
    description: "Не указаны навыки работы с анимацией интерфейсов. Добавь After Effects, Principle или Framer Motion — это востребованный навык",
    isPositive: false
  },
  {
    title: "Юзабилити-тестирование",
    description: "Нет упоминания методов исследований: интервью, A/B тесты, юзабилити. Добавь примеры проведённых исследований",
    isPositive: false
  }
];

export default function Assessment() {
  const [step, setStep] = useState<AssessmentStep>("upload");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedSphere, setSelectedSphere] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "processing") {
      setProcessingProgress(0);
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep("sphere"), 500);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setResumeFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setResumeFile(file);
    }
  };

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep("results");
    }
  };

  const handleExitTest = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    setStep("sphere");
    setCurrentQuestion(0);
    setAnswers({});
  };

  const calculateScore = () => {
    let correct = 0;
    mockQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / mockQuestions.length) * 100);
  };

  const getGrade = (score: number) => {
    if (score >= 90) return "Senior";
    if (score >= 75) return "Middle+";
    if (score >= 60) return "Middle";
    if (score >= 45) return "Junior+";
    return "Junior";
  };

  const getSalaryRange = (grade: string, location: "ru" | "abroad") => {
    const salaries: Record<string, { ru: string; abroad: string }> = {
      "Senior": { ru: "250 000 - 400 000 ₽", abroad: "$6 000 - $12 000" },
      "Middle+": { ru: "180 000 - 280 000 ₽", abroad: "$4 000 - $7 000" },
      "Middle": { ru: "120 000 - 200 000 ₽", abroad: "$3 000 - $5 000" },
      "Junior+": { ru: "80 000 - 140 000 ₽", abroad: "$2 000 - $3 500" },
      "Junior": { ru: "50 000 - 90 000 ₽", abroad: "$1 200 - $2 500" },
    };
    return salaries[grade]?.[location] || "N/A";
  };

  const renderUploadStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-[600px]"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Оценка навыков</h1>
        <p className="text-muted-foreground">
          Загрузите резюме для анализа вашего опыта и навыков
        </p>
      </div>

      <Card className="p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
            resumeFile ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-muted-foreground/50"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="dropzone-resume"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-resume-file"
          />
          
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-xl flex items-center justify-center">
            {resumeFile ? (
              <FileText className="h-10 w-10 text-primary" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
          </div>

          {resumeFile ? (
            <div>
              <p className="font-medium text-foreground mb-1">{resumeFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(resumeFile.size / 1024 / 1024).toFixed(2)} МБ
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setResumeFile(null);
                }}
                data-testid="button-remove-resume"
              >
                <X className="h-4 w-4 mr-1" />
                Удалить
              </Button>
            </div>
          ) : (
            <div>
              <p className="font-medium text-foreground mb-1">
                Выбери или перетащи файл
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, DOCX, до 10 МБ
              </p>
            </div>
          )}
        </div>

        <Button
          className="w-full mt-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl"
          disabled={!resumeFile}
          onClick={() => setStep("processing")}
          data-testid="button-next-to-sphere"
        >
          Далее
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </motion.div>
  );

  const renderProcessingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-[600px]"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Оценка навыков</h1>
        <p className="text-muted-foreground">
          Анализируем ваше резюме
        </p>
      </div>

      <Card className="p-8">
        <div className="border-2 border-dashed rounded-xl p-10 text-center border-primary bg-primary/5">
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-xl flex items-center justify-center">
            <FileText className="h-10 w-10 text-primary" />
          </div>

          <p className="font-medium text-foreground mb-1">
            {resumeFile?.name}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            PDF, DOCX, до 10 МБ
          </p>

          <Button
            disabled
            className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl pointer-events-none"
            data-testid="button-processing"
          >
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Формирую оценку...
          </Button>
        </div>

        <div className="mt-6">
          <Progress value={Math.min(processingProgress, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            {Math.min(Math.round(processingProgress), 100)}% завершено
          </p>
        </div>
      </Card>
    </motion.div>
  );

  const renderSphereStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-[600px]"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Выберите сферу</h1>
        <p className="text-muted-foreground">
          Выберите направление дизайна для прохождения теста
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Тестирование займёт от 20 до 40 минут в зависимости от выбранной сферы
          </p>
        </div>

        <RadioGroup 
          value={selectedSphere || ""} 
          onValueChange={setSelectedSphere}
          className="space-y-3"
        >
          {spheres.map((sphere) => (
            <div key={sphere.id}>
              <Label
                htmlFor={sphere.id}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedSphere === sphere.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-muted-foreground/50"
                }`}
                data-testid={`sphere-option-${sphere.id}`}
              >
                <RadioGroupItem value={sphere.id} id={sphere.id} />
                <div className="flex-1">
                  <p className="font-medium">{sphere.name}</p>
                  <p className="text-sm text-muted-foreground">{sphere.description}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {sphere.questionsCount} вопросов
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => setStep("upload")}
            data-testid="button-back-to-upload"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Button
            className="flex-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl"
            disabled={!selectedSphere}
            onClick={() => setStep("testing")}
            data-testid="button-start-test"
          >
            Начать тестирование
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderTestingStep = () => {
    const question = mockQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-[700px]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Тестирование</h1>
            <p className="text-sm text-muted-foreground">
              Вопрос {currentQuestion + 1} из {mockQuestions.length}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExitTest}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
            data-testid="button-exit-test"
          >
            <X className="h-4 w-4 mr-1" />
            Выйти
          </Button>
        </div>

        <Progress value={progress} className="mb-6" />

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">{question.question}</h2>

          <RadioGroup
            value={answers[question.id]?.toString() || ""}
            onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div key={index}>
                <Label
                  htmlFor={`answer-${index}`}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    answers[question.id] === index
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                  data-testid={`answer-option-${index}`}
                >
                  <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                  <span>{option}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex gap-3 mt-6">
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                data-testid="button-prev-question"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
            )}
            <Button
              className="flex-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl"
              disabled={answers[question.id] === undefined}
              onClick={handleNextQuestion}
              data-testid="button-next-question"
            >
              {currentQuestion === mockQuestions.length - 1 ? "Завершить тест" : "Следующий вопрос"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderResultsStep = () => {
    const testScore = calculateScore();
    const resumeScore = 78;
    const finalScore = Math.round((testScore * 0.6) + (resumeScore * 0.4));
    const grade = getGrade(finalScore);

    const positiveItems = mockFeedbackItems.filter(item => item.isPositive);
    const negativeItems = mockFeedbackItems.filter(item => !item.isPositive);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-[700px]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Результаты оценки</h1>
          <p className="text-muted-foreground">
            На основе анализа резюме и результатов тестирования
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">{resumeScore}%</div>
                <div className="text-sm text-muted-foreground mt-1">Оценка резюме</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">{testScore}%</div>
                <div className="text-sm text-muted-foreground mt-1">Оценка теста</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="text-3xl font-bold text-primary">{finalScore}%</div>
                <div className="text-sm text-muted-foreground mt-1">Итоговая оценка</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Ваш грейд и зарплатный бенчмарк</h2>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl mb-6">
              <div className="text-4xl font-bold text-primary mb-2">{grade}</div>
              <div className="text-sm text-muted-foreground">
                {spheres.find(s => s.id === selectedSphere)?.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-3 rounded-sm bg-gradient-to-b from-white via-blue-500 to-red-500 flex-shrink-0" />
                  Россия
                </div>
                <div className="text-xl font-bold">{getSalaryRange(grade, "ru")}</div>
                <div className="text-xs text-muted-foreground mt-1">в месяц</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  Зарубежом
                </div>
                <div className="text-xl font-bold">{getSalaryRange(grade, "abroad")}</div>
                <div className="text-xs text-muted-foreground mt-1">в месяц</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Детальная информация</h3>
            <div className="space-y-4">
              {positiveItems.map((item, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
              {negativeItems.map((item, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => {
                setStep("upload");
                setResumeFile(null);
                setSelectedSphere(null);
                setCurrentQuestion(0);
                setAnswers({});
              }}
              data-testid="button-restart-assessment"
            >
              Пройти заново
            </Button>
            <Button
              className="flex-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl"
              data-testid="button-save-results"
            >
              Сохранить результаты
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <MainLayout title="Оценка навыков" showCreateButton={false}>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {step === "upload" && renderUploadStep()}
          {step === "processing" && renderProcessingStep()}
          {step === "sphere" && renderSphereStep()}
          {step === "testing" && renderTestingStep()}
          {step === "results" && renderResultsStep()}
        </AnimatePresence>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выйти из тестирования?</AlertDialogTitle>
            <AlertDialogDescription>
              Весь прогресс будет потерян. Вам придётся начать тестирование заново.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-exit">Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExit}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-exit"
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
