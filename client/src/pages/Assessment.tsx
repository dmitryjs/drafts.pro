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
import { Textarea } from "@/components/ui/textarea";
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

interface TestOption {
  id: string;
  text: string;
  correct?: boolean;
}

interface TestQuestion {
  id: string;
  prompt: string;
  options?: TestOption[];
  rubricMax?: number;
}

interface TestSection {
  id: string;
  type: "mcq" | "free";
  title: string;
  questions: TestQuestion[];
}

interface TestData {
  id: string;
  title: string;
  durationMinutes: number;
  scoring: { mcq: number; freeMax: number };
  gradeBands: { grade: string; min: number; max: number }[];
  sections: TestSection[];
}

interface NormalizedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: "mcq" | "free";
  maxScore?: number;
}

interface FreeTextAnswer {
  questionId: string;
  question: string;
  answer: string;
  maxScore: number;
}

interface FreeTextEvaluation {
  evaluations: {
    questionId: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  totalScore: number;
  maxTotalScore: number;
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

const normalizeTestData = (data: TestData): NormalizedQuestion[] => {
  const questions: NormalizedQuestion[] = [];
  
  data.sections.forEach(section => {
    if (section.type === "mcq") {
      section.questions.forEach(q => {
        if (q.options) {
          const correctIndex = q.options.findIndex(opt => opt.correct === true);
          questions.push({
            id: q.id,
            question: q.prompt,
            options: q.options.map(opt => opt.text),
            correctAnswer: correctIndex >= 0 ? correctIndex : 0,
            type: "mcq"
          });
        }
      });
    } else if (section.type === "free") {
      section.questions.forEach(q => {
        questions.push({
          id: q.id,
          question: q.prompt,
          options: [],
          correctAnswer: -1,
          type: "free",
          maxScore: q.rubricMax || 10
        });
      });
    }
  });
  
  return questions;
};

interface AIResumeAnalysis {
  score: number;
  feedbackItems: FeedbackItem[];
}

interface AIRecommendations {
  overallFeedback: string;
  recommendations: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[];
  suggestedResources: {
    title: string;
    type: string;
  }[];
}

export default function Assessment() {
  const [step, setStep] = useState<AssessmentStep>("upload");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedSphere, setSelectedSphere] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [freeTextAnswers, setFreeTextAnswers] = useState<Record<string, string>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [testQuestions, setTestQuestions] = useState<NormalizedQuestion[]>([]);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<AIResumeAnalysis | null>(null);
  const [testRecommendations, setTestRecommendations] = useState<AIRecommendations | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [freeTextEvaluation, setFreeTextEvaluation] = useState<FreeTextEvaluation | null>(null);
  const [isEvaluatingFreeText, setIsEvaluatingFreeText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeResumeWithAI = async (file: File) => {
    try {
      const text = await file.text();
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, sphere: selectedSphere || "product" }),
      });
      if (response.ok) {
        const analysis = await response.json();
        setResumeAnalysis(analysis);
      }
    } catch (error) {
      console.error("Failed to analyze resume:", error);
    }
  };

  useEffect(() => {
    if (step === "processing" && resumeFile) {
      setProcessingProgress(0);
      analyzeResumeWithAI(resumeFile);
      
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep("sphere"), 500);
            return 100;
          }
          return prev + Math.random() * 8 + 3;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [step, resumeFile]);

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

  const loadTestForSphere = async (sphereId: string) => {
    setIsLoadingTest(true);
    try {
      const response = await fetch(`/api/assessment-tests/${sphereId}`);
      if (response.ok) {
        const data: TestData = await response.json();
        const normalized = normalizeTestData(data);
        if (normalized.length > 0) {
          setTestQuestions(normalized);
        } else {
          setTestQuestions(mockQuestions.map(q => ({
            id: q.id.toString(),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            type: "mcq" as const
          })));
        }
      } else {
        setTestQuestions(mockQuestions.map(q => ({
          id: q.id.toString(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          type: "mcq" as const
        })));
      }
    } catch (error) {
      console.error("Failed to load test:", error);
      setTestQuestions(mockQuestions.map(q => ({
        id: q.id.toString(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        type: "mcq" as const
      })));
    }
    setIsLoadingTest(false);
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleFreeTextAnswer = (questionId: string, text: string) => {
    setFreeTextAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const evaluateFreeTextWithAI = async (): Promise<FreeTextEvaluation | null> => {
    const freeQuestions = testQuestions.filter(q => q.type === "free");
    if (freeQuestions.length === 0) return null;

    const answersToEvaluate: FreeTextAnswer[] = freeQuestions.map(q => ({
      questionId: q.id,
      question: q.question,
      answer: freeTextAnswers[q.id] || "",
      maxScore: q.maxScore || 10
    }));

    setIsEvaluatingFreeText(true);
    try {
      const response = await fetch("/api/evaluate-free-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sphere: selectedSphere || "product",
          answers: answersToEvaluate
        }),
      });

      if (response.ok) {
        const evaluation = await response.json();
        setFreeTextEvaluation(evaluation);
        setIsEvaluatingFreeText(false);
        return evaluation;
      }
    } catch (error) {
      console.error("Failed to evaluate free text:", error);
    }
    setIsEvaluatingFreeText(false);
    return null;
  };

  const fetchTestRecommendations = async (score: number) => {
    setIsLoadingRecommendations(true);
    try {
      const questions = testQuestions.length > 0 ? testQuestions : mockQuestions.map(q => ({
        id: q.id.toString(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        type: "mcq" as const
      }));
      
      const incorrectTopics = questions
        .filter(q => q.type === "mcq" && answers[q.id] !== q.correctAnswer)
        .map(q => q.question);
      
      const response = await fetch("/api/test-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sphere: selectedSphere || "product",
          testScore: score,
          incorrectTopics,
        }),
      });
      
      if (response.ok) {
        const recommendations = await response.json();
        setTestRecommendations(recommendations);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
    setIsLoadingRecommendations(false);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep("results");
      const freeEval = await evaluateFreeTextWithAI();
      const score = calculateFinalTestScore(freeEval);
      fetchTestRecommendations(score);
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
    setFreeTextAnswers({});
  };

  const calculateMCQScore = (): { correct: number; total: number } => {
    const questions = testQuestions.length > 0 ? testQuestions : mockQuestions.map(q => ({
      id: q.id.toString(),
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      type: "mcq" as const
    }));
    const mcqQuestions = questions.filter(q => q.type === "mcq");
    let correct = 0;
    mcqQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return { correct, total: mcqQuestions.length };
  };

  const calculateFinalTestScore = (freeEval: FreeTextEvaluation | null): number => {
    const mcq = calculateMCQScore();
    const mcqPercent = mcq.total > 0 ? (mcq.correct / mcq.total) * 100 : 0;

    if (freeEval && freeEval.maxTotalScore > 0) {
      const freePercent = (freeEval.totalScore / freeEval.maxTotalScore) * 100;
      return Math.round((mcqPercent * 0.4) + (freePercent * 0.6));
    }
    return Math.round(mcqPercent);
  };

  const getGradeRu = (score: number) => {
    if (score >= 95) return "Head of Design";
    if (score >= 88) return "Lead+";
    if (score >= 80) return "Lead";
    if (score >= 72) return "Senior+";
    if (score >= 64) return "Senior";
    if (score >= 52) return "Middle+";
    if (score >= 40) return "Middle";
    if (score >= 25) return "Junior+";
    if (score >= 10) return "Junior";
    return "Junior";
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes("Head") || grade.includes("Lead")) return "#6CDC00";
    if (grade.includes("Senior")) return "#FEB00D";
    if (grade.includes("Middle")) return "#FF8C00";
    return "#F33835";
  };

  const getSalaryRange = (gradeRu: string, location: "ru" | "abroad") => {
    const salaries: Record<string, { ru: string; abroad: string }> = {
      "Head of Design": { ru: "400 000 - 700 000 ₽", abroad: "$10 000 - $20 000" },
      "Lead+": { ru: "350 000 - 500 000 ₽", abroad: "$8 000 - $15 000" },
      "Lead": { ru: "280 000 - 400 000 ₽", abroad: "$6 500 - $12 000" },
      "Senior+": { ru: "220 000 - 320 000 ₽", abroad: "$5 000 - $8 000" },
      "Senior": { ru: "180 000 - 280 000 ₽", abroad: "$4 000 - $7 000" },
      "Middle+": { ru: "140 000 - 220 000 ₽", abroad: "$3 500 - $5 500" },
      "Middle": { ru: "100 000 - 160 000 ₽", abroad: "$2 500 - $4 000" },
      "Junior+": { ru: "80 000 - 120 000 ₽", abroad: "$2 000 - $3 000" },
      "Junior": { ru: "60 000 - 100 000 ₽", abroad: "$1 500 - $2 500" },
    };
    return salaries[gradeRu]?.[location] || salaries["Junior"][location];
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
            disabled={!selectedSphere || isLoadingTest}
            onClick={async () => {
              if (selectedSphere) {
                await loadTestForSphere(selectedSphere);
                setStep("testing");
              }
            }}
            data-testid="button-start-test"
          >
            {isLoadingTest ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка теста...
              </>
            ) : (
              <>
                Начать тестирование
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderTestingStep = () => {
    const questions = testQuestions.length > 0 ? testQuestions : mockQuestions.map(q => ({
      id: q.id.toString(),
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      type: "mcq" as const
    }));
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    if (!question) return null;

    const isFreeText = question.type === "free";
    const canProceed = isFreeText 
      ? (freeTextAnswers[question.id]?.trim().length ?? 0) > 10
      : answers[question.id] !== undefined;

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
              Вопрос {currentQuestion + 1} из {questions.length}
              {isFreeText && <span className="ml-2 text-primary">(Открытый вопрос)</span>}
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

          {isFreeText ? (
            <div className="space-y-3">
              <Textarea
                placeholder="Напишите ваш ответ здесь..."
                value={freeTextAnswers[question.id] || ""}
                onChange={(e) => handleFreeTextAnswer(question.id, e.target.value)}
                className="min-h-[200px] rounded-xl resize-none"
                data-testid="input-free-text-answer"
              />
              <p className="text-xs text-muted-foreground">
                Минимум 10 символов. Сейчас: {freeTextAnswers[question.id]?.length || 0}
              </p>
            </div>
          ) : (
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
          )}

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
              disabled={!canProceed}
              onClick={handleNextQuestion}
              data-testid="button-next-question"
            >
              {currentQuestion === questions.length - 1 ? "Завершить тест" : "Следующий вопрос"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderResultsStep = () => {
    const testScore = calculateFinalTestScore(freeTextEvaluation);
    const resumeScore = resumeAnalysis?.score ?? 0;
    const finalScore = testScore;
    const gradeRu = getGradeRu(finalScore);

    const feedbackItems = resumeAnalysis?.feedbackItems ?? mockFeedbackItems;
    const positiveItems = feedbackItems.filter(item => item.isPositive);
    const negativeItems = feedbackItems.filter(item => !item.isPositive);

    const arrowAngle = -90 + (finalScore / 100) * 180;
    const arrowRadius = 55;
    const arrowX = 100 + arrowRadius * Math.cos((arrowAngle - 90) * Math.PI / 180);
    const arrowY = 90 + arrowRadius * Math.sin((arrowAngle - 90) * Math.PI / 180);

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
                <div className="text-3xl font-bold text-foreground">{resumeScore}%</div>
                <div className="text-sm text-muted-foreground mt-1">Оценка резюме</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-3xl font-bold text-foreground">{testScore}%</div>
                <div className="text-sm text-muted-foreground mt-1">Оценка теста</div>
              </div>
              <div className="p-4 bg-muted/10 rounded-xl border border-border">
                <div className="text-3xl font-bold text-foreground">{finalScore}%</div>
                <div className="text-sm text-muted-foreground mt-1">Итоговая оценка</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-center mb-6">РЕЗУЛЬТАТ БЕНЧМАРКА</h2>
            
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-56 h-32 mb-4">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F33835" />
                      <stop offset="50%" stopColor="#FEB00D" />
                      <stop offset="100%" stopColor="#6CDC00" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20 90 A 80 80 0 0 1 180 90"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${arrowX},${arrowY - 8} ${arrowX - 5},${arrowY + 5} ${arrowX + 5},${arrowY + 5}`}
                    fill="#1D1D1F"
                    transform={`rotate(${arrowAngle}, ${arrowX}, ${arrowY})`}
                  />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                  <span className="text-4xl font-bold text-foreground">{finalScore}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Грейд:</p>
                <p className="text-lg font-semibold" style={{ color: getGradeColor(gradeRu) }}>{gradeRu}</p>
              </div>

              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
                <span>0</span>
                <div className="w-32 h-1.5 bg-gradient-to-r from-[#F33835] via-[#FEB00D] to-[#6CDC00] rounded-full" />
                <span>100</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs mb-6">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F33835" }} />
                <span className="text-muted-foreground">Junior / Junior+</span>
                <span className="text-muted-foreground/70">0 - 39</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FEB00D" }} />
                <span className="text-muted-foreground">Middle - Senior+</span>
                <span className="text-muted-foreground/70">40 - 79</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#6CDC00" }} />
                <span className="text-muted-foreground">Lead - Head</span>
                <span className="text-muted-foreground/70">80 - 100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                  <span className="w-4 h-3 rounded-sm bg-gradient-to-b from-white via-blue-500 to-red-500 flex-shrink-0" />
                  Россия
                </div>
                <div className="text-xl font-bold">{getSalaryRange(gradeRu, "ru")}</div>
                <div className="text-xs text-muted-foreground mt-1">в месяц</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  Зарубежом
                </div>
                <div className="text-xl font-bold">{getSalaryRange(gradeRu, "abroad")}</div>
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

          {(isLoadingRecommendations || testRecommendations) && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Рекомендации по развитию</h3>
              
              {isLoadingRecommendations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Генерируем рекомендации...</span>
                </div>
              ) : testRecommendations ? (
                <div className="space-y-6">
                  {testRecommendations.overallFeedback && (
                    <p className="text-muted-foreground bg-muted/30 p-4 rounded-xl">
                      {testRecommendations.overallFeedback}
                    </p>
                  )}
                  
                  {testRecommendations.recommendations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Что изучить:</h4>
                      {testRecommendations.recommendations.map((rec, index) => (
                        <div key={index} className="flex gap-3 p-3 bg-muted/20 rounded-xl">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            rec.priority === "high" ? "bg-red-500" :
                            rec.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                          }`} />
                          <div>
                            <p className="font-medium">{rec.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {testRecommendations.suggestedResources.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Полезные ресурсы:</h4>
                      <div className="flex flex-wrap gap-2">
                        {testRecommendations.suggestedResources.map((resource, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {resource.title} ({resource.type})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </Card>
          )}

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
                setFreeTextAnswers({});
                setResumeAnalysis(null);
                setTestRecommendations(null);
                setFreeTextEvaluation(null);
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
