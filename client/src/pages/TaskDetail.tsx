import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MoreHorizontal,
  Send,
  Check,
  Calendar,
  Users,
  Briefcase,
  FolderOpen,
  FileImage,
  Upload,
  ChevronRight,
  Share2,
  Flag,
  Loader2,
  Zap
} from "lucide-react";
import LikeIcon from "@assets/icons/Like.svg";
import DislikeIcon from "@assets/icons/Dislike.svg";
import FavoritesIcon from "@assets/icons/Favorites.svg";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTask } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import TaskSubmitModal from "@/components/modals/TaskSubmitModal";
import TaskSubmitSuccessModal from "@/components/modals/TaskSubmitSuccessModal";

const getLevelColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "intern": return "text-[#666666]";
    case "junior": return "text-[#159931]";
    case "middle": return "text-[#FF9232]";
    case "senior": return "text-[#325BFF]";
    case "lead": return "text-[#FF32B7]";
    default: return "text-gray-500";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category?.toLowerCase()) {
    case "продукт":
    case "product": return "Продукт";
    case "графический":
    case "graphic": return "Графический";
    case "ux/ui":
    case "uxui": return "UX/UI";
    case "3d": return "3D";
    case "кейсы":
    case "cases": return "Кейсы";
    default: return category;
  }
};

// Mock tasks data for fallback
const mockTasksBySlug: Record<string, any> = {
  "retention-onboarding": {
    id: 1,
    title: "Увеличить Retention на онбординге в B2C продукте",
    description: "Необходимо увеличить ретеншен в продукте который работает в сфере B2C\n\n**Требования:**\n- Анализ текущего онбординга\n- Предложение улучшений\n- Прототипы решений",
    category: "product",
    level: "middle",
    author: "Дмитрий Галкин",
    authorId: 1,
    likes: 324,
    dislikes: 43,
    comments: 43,
    slug: "retention-onboarding",
    solutionsCount: 12,
    tags: ["онбординг", "retention", "B2C"],
  },
  "food-delivery-app-design": {
    id: 2,
    title: "Создать дизайн мобильного приложения для доставки еды",
    description: "Нужен современный и удобный дизайн для iOS и Android приложения\n\n**Требования:**\n- Адаптивный дизайн\n- Удобная навигация\n- Современный UI",
    category: "uxui",
    level: "senior",
    company: "Яндекс.Еда",
    companySlug: "yandex-eda",
    companyId: 1,
    likes: 456,
    dislikes: 12,
    comments: 89,
    slug: "food-delivery-app-design",
    solutionsCount: 34,
    tags: ["мобильное приложение", "доставка", "UI/UX"],
  },
  "fintech-logo-design": {
    id: 3,
    title: "Разработать логотип для финтех стартапа",
    description: "Требуется минималистичный и запоминающийся логотип\n\n**Требования:**\n- Минимализм\n- Запоминаемость\n- Адаптивность",
    category: "graphic",
    level: "junior",
    company: "Тинькофф",
    companySlug: "tinkoff",
    companyId: 2,
    likes: 234,
    dislikes: 8,
    comments: 45,
    slug: "fintech-logo-design",
    solutionsCount: 18,
    tags: ["логотип", "финтех", "брендинг"],
  },
  "banking-app-ux-research": {
    id: 4,
    title: "UX исследование для банковского приложения",
    description: "Провести исследование пользовательского опыта и предложить улучшения\n\n**Требования:**\n- Исследование пользователей\n- Анализ конкурентов\n- Рекомендации",
    category: "uxui",
    level: "senior",
    company: "Сбер",
    companySlug: "sber",
    companyId: 3,
    likes: 567,
    dislikes: 15,
    comments: 123,
    slug: "banking-app-ux-research",
    solutionsCount: 56,
    tags: ["UX", "исследование", "банкинг"],
  },
  "product-3d-model": {
    id: 5,
    title: "Создать 3D модель продукта для презентации",
    description: "Нужна качественная 3D модель для маркетинговых материалов\n\n**Требования:**\n- Высокое качество\n- Реалистичность\n- Готовность к рендеру",
    category: "3d",
    level: "middle",
    author: "Анна Петрова",
    authorId: 2,
    likes: 189,
    dislikes: 5,
    comments: 23,
    slug: "product-3d-model",
    solutionsCount: 9,
    tags: ["3D", "моделирование", "визуализация"],
  },
  "marketplace-interface-design": {
    id: 6,
    title: "Дизайн интерфейса для маркетплейса",
    description: "Создать удобный и интуитивный интерфейс для онлайн-магазина\n\n**Требования:**\n- Удобная навигация\n- Быстрый поиск\n- Удобная корзина",
    category: "uxui",
    level: "senior",
    company: "Авито",
    companySlug: "avito",
    companyId: 4,
    likes: 678,
    dislikes: 22,
    comments: 156,
    slug: "marketplace-interface-design",
    solutionsCount: 78,
    tags: ["маркетплейс", "интерфейс", "e-commerce"],
  },
  "corporate-website-redesign": {
    id: 7,
    title: "Кейс: Редизайн корпоративного сайта",
    description: "Полный редизайн существующего корпоративного сайта с улучшением UX\n\n**Требования:**\n- Современный дизайн\n- Улучшение UX\n- Адаптивность",
    category: "cases",
    level: "lead",
    author: "Иван Сидоров",
    authorId: 3,
    likes: 445,
    dislikes: 18,
    comments: 67,
    slug: "corporate-website-redesign",
    solutionsCount: 23,
    tags: ["редизайн", "корпоративный сайт", "UX"],
  },
  "design-system-web-platform": {
    id: 8,
    title: "Создать дизайн-систему для веб-платформы",
    description: "Разработать комплексную дизайн-систему с компонентами и гайдлайнами\n\n**Требования:**\n- Компоненты\n- Гайдлайны\n- Документация",
    category: "product",
    level: "lead",
    company: "Google",
    companySlug: "google",
    companyId: 5,
    likes: 789,
    dislikes: 25,
    comments: 234,
    slug: "design-system-web-platform",
    solutionsCount: 112,
    tags: ["дизайн-система", "компоненты", "гайдлайны"],
  },
};

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:slug");
  const slug = params?.slug || "";
  const { data: apiTask, isLoading } = useTask(slug);
  const task = apiTask || mockTasksBySlug[slug];
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("description");
  const [userSolution, setUserSolution] = useState<any>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSolutionPending, setIsSolutionPending] = useState(false);

  // Получаем решение пользователя для этой задачи (с polling для обновления статуса)
  const { data: solutionData } = useQuery({
    queryKey: ['/api/tasks', task?.id, 'solutions/my', user?.id],
    queryFn: async () => {
      if (!task?.id || !user?.id) return null;
      const response = await apiRequest('GET', `/api/tasks/${task.id}/solutions/my?userId=${user.id}`);
      return response.json();
    },
    enabled: !!task?.id && !!user?.id,
    refetchInterval: (data) => {
      // Polling каждые 5 секунд, если решение на проверке
      if (data?.solution?.status === 'pending' || data?.solution?.status === 'mentor_review') {
        return 5000;
      }
      return false; // Останавливаем polling, если решение проверено
    },
  });

  // Обновляем локальное состояние решения при получении данных
  useEffect(() => {
    if (solutionData?.solution) {
      setUserSolution(solutionData.solution);
      // Если решение проверено, убираем статус "на проверке"
      if (solutionData.solution.status === 'reviewed' && solutionData.solution.evaluation) {
        setIsSolutionPending(false);
      } else if (solutionData.solution.status === 'pending' || solutionData.solution.status === 'mentor_review') {
        setIsSolutionPending(true);
      }
    }
  }, [solutionData]);

  const favoriteMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/tasks/${taskId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", slug] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Обновлено" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ taskId, value }: { taskId: number; value: 1 | -1 }) => {
      return apiRequest("POST", `/api/tasks/${taskId}/vote`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", slug] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleVote = (value: 1 | -1) => {
    if (!user) {
      toast({ title: "Войдите, чтобы голосовать" });
      return;
    }
    if (task) {
      voteMutation.mutate({ taskId: task.id, value });
    }
  };

  const handleFavorite = () => {
    if (!user) {
      toast({ title: "Войдите, чтобы добавить в избранное" });
      return;
    }
    if (task) {
      favoriteMutation.mutate(task.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Ссылка скопирована" });
  };

  const handleReport = () => {
    toast({ title: "Жалоба отправлена", description: "Мы рассмотрим вашу жалобу в ближайшее время" });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4 max-w-4xl">
          <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Эта задача не существует или была удалена</p>
          <Link href="/">
            <Button>Вернуться к задачам</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const isCompanyTask = !!task.company || !!task.companySlug;
  const authorName = isCompanyTask ? (task.company || "Компания") : (task.author || task.authorName || "Аноним");
  const authorId = task.authorId || null;
  const companySlug = task.companySlug || null;
  const attachments = task.attachments || [];
  const visibleAttachments = attachments.slice(0, 4);
  const remainingCount = Math.max(0, attachments.length - 4);
  const isFavorited = task.isFavorited || false;

  const handleSubmitSolution = () => {
    if (!user) return;
    setIsSubmitModalOpen(true);
  };

  const handleSolutionSubmitted = (solutionData?: any) => {
    setIsSolutionPending(true);
    setIsSuccessModalOpen(true);
    setIsSubmitModalOpen(false);
    // Сохраняем решение локально для отображения
    setUserSolution({ 
      content: solutionData?.content || solutionData?.description || "",
      description: solutionData?.description || "",
      status: solutionData?.status || "pending",
      evaluation: null,
      solutionId: solutionData?.solutionId,
    });
    // Инвалидируем запрос для получения решения
    queryClient.invalidateQueries({ queryKey: ['/api/tasks', task?.id, 'solutions/my'] });
  };

  const parseDescription = (description: string) => {
    const lines = description?.split('\n') || [];
    const elements: JSX.Element[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <h3 key={i} className="font-semibold text-[#1D1D1F] mt-6 mb-2 first:mt-0">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
        i++;
      } else if (line.startsWith('- ')) {
        const items: string[] = [];
        while (i < lines.length && lines[i].startsWith('- ')) {
          items.push(lines[i].substring(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="ml-4 space-y-1 mb-4">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#159931] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#1D1D1F]">{item}</span>
              </li>
            ))}
          </ul>
        );
      } else if (/^\d+\./.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\./.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\.\s*/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="ml-4 list-decimal space-y-1 mb-4">
            {items.map((item, idx) => <li key={idx} className="text-sm text-[#1D1D1F]">{item}</li>)}
          </ol>
        );
      } else if (line.trim()) {
        elements.push(<p key={i} className="text-sm text-[#1D1D1F] mb-2">{line}</p>);
        i++;
      } else {
        i++;
      }
    }
    return elements;
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2 -mx-[15px] lg:mx-0 px-[15px] lg:px-0">
          {/* Left: Back + Author */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Link href="/">
              <button 
                className="h-8 w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center bg-[#E8E8EE] hover:bg-[#DCDCE4] transition-colors flex-shrink-0"
                data-testid="button-back"
              >
                <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#1D1D1F]" />
              </button>
            </Link>
            
            {isCompanyTask && companySlug ? (
              <Link href={`/companies/${companySlug}`}>
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-[#E8E8EE] hover:bg-[#DCDCE4] transition-colors cursor-pointer min-w-0">
                  <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#1D1D1F] flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium text-[#1D1D1F] truncate">{authorName}</span>
                </div>
              </Link>
            ) : authorId ? (
              <Link href={`/users/${authorId}`}>
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-[#E8E8EE] hover:bg-[#DCDCE4] transition-colors cursor-pointer min-w-0">
                  <UserAvatar name={authorName} size="sm" className="flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium text-[#1D1D1F] truncate">{authorName}</span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-[#E8E8EE] min-w-0">
                <UserAvatar name={authorName} size="sm" className="flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium text-[#1D1D1F] truncate">{authorName}</span>
              </div>
            )}
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            {/* Лайки и избранное временно отключены */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-9 w-9 rounded-full flex items-center justify-center bg-[#E8E8EE] text-[#1D1D1F] hover:bg-[#DCDCE4] transition-colors"
                  data-testid="button-more"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                  <Share2 className="h-4 w-4 mr-2" />
                  Поделиться
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport} className="cursor-pointer text-red-600">
                  <Flag className="h-4 w-4 mr-2" />
                  Пожаловаться
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {user ? (
              isSolutionPending ? (
                <Button 
                  className="gap-1.5 md:gap-2 bg-[#325BFF] text-white hover:bg-[#2A4FE6] rounded-xl text-xs md:text-sm px-3 md:px-4 h-8 md:h-10"
                  disabled
                  data-testid="button-solution-pending"
                >
                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                  <span className="hidden sm:inline">Ответ на проверке</span>
                  <span className="sm:hidden">Проверка</span>
                </Button>
              ) : (
                <Button 
                  className="gap-1.5 md:gap-2 bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] rounded-xl text-xs md:text-sm px-3 md:px-4 h-8 md:h-10"
                  onClick={handleSubmitSolution}
                  data-testid="button-submit-solution"
                >
                  <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Отправить решение</span>
                  <span className="sm:hidden">Отправить</span>
                </Button>
              )
            ) : (
              <Link href="/auth">
                <Button 
                  className="gap-1.5 md:gap-2 bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] rounded-xl text-xs md:text-sm px-3 md:px-4 h-8 md:h-10"
                  data-testid="button-login-to-submit"
                >
                  <span className="hidden sm:inline">Войдите, чтобы отправить</span>
                  <span className="sm:hidden">Войти</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Task Title */}
        <h1 className="text-xl md:text-2xl font-bold text-[#1D1D1F] mb-4 md:mb-6 leading-tight">
          {task.title}
        </h1>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FolderOpen className="h-3 w-3" /> Сфера
            </p>
            <p className="text-sm font-medium text-[#1D1D1F]">{task.sphere || "Веб"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Сложность
            </p>
            <p className={cn("text-sm font-medium", getLevelColor(task.level))}>{task.level}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Категория
            </p>
            <p className="text-sm font-medium text-[#1D1D1F]">{getCategoryLabel(task.category)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Users className="h-3 w-3" /> Решено
            </p>
            <p className="text-sm font-medium text-[#1D1D1F]">
              {task.solutionsCount || 0} / {(task.solutionsCount || 0) + 50} ({Math.round(((task.solutionsCount || 0) / ((task.solutionsCount || 0) + 50)) * 100)}%)
            </p>
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mb-6 -mx-[15px] lg:mx-0">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-2 px-[15px] lg:px-0">
              <FolderOpen className="h-3 w-3" /> Теги
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-[15px] lg:px-0 lg:flex-wrap lg:overflow-visible">
              {task.tags.map((tag: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs font-normal bg-[#E8E8EE] text-[#1D1D1F] border-0 hover:bg-[#DCDCE4] cursor-pointer flex-shrink-0 whitespace-nowrap"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-3 overflow-x-auto overflow-y-hidden -mx-[15px] lg:mx-0 px-[15px] lg:px-0">
          <button
            onClick={() => setActiveTab("description")}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === "description"
                ? "text-[#1D1D1F]"
                : "text-muted-foreground hover:text-[#1D1D1F]"
            )}
            data-testid="tab-description"
          >
            Описание задачи
            {activeTab === "description" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#1D1D1F]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("solution")}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === "solution"
                ? "text-[#1D1D1F]"
                : "text-muted-foreground hover:text-[#1D1D1F]"
            )}
            data-testid="tab-solution"
          >
            Ваше решение
            {activeTab === "solution" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#1D1D1F]"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "description" && (
          <div>
            {/* Description Content */}
            <div className="prose prose-sm max-w-none">
              {parseDescription(task.description || "")}
            </div>

            {/* File Attachments */}
            {attachments.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-[#1D1D1F] mb-4">Ресурсы</h3>
                <div className="flex gap-3 flex-wrap">
                  {visibleAttachments.map((file: string, index: number) => (
                    <div 
                      key={index}
                      className="w-40 h-28 bg-[#2D2D2D] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#3D3D3D] transition-colors relative overflow-hidden"
                      data-testid={`attachment-${index}`}
                    >
                      <FileImage className="h-8 w-8 text-white/50" />
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div 
                      className="w-40 h-28 bg-[#2D2D2D] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#3D3D3D] transition-colors"
                      data-testid="attachment-more"
                    >
                      <span className="text-white text-lg font-medium">+{remainingCount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === "solution" && (
          <div className="space-y-6">
            {!user ? (
              <Card className="p-8 text-center bg-white border-0 shadow-sm">
                <div className="text-muted-foreground mb-4">
                  Войдите, чтобы отправить решение
                </div>
                <Link href="/auth">
                  <Button className="bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] rounded-xl">
                    Войти
                  </Button>
                </Link>
              </Card>
            ) : isSolutionPending ? (
              <Card className="p-6 bg-white border-0 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[#325BFF]" />
                  <span className="font-medium text-[#1D1D1F]">Ответ на проверке</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Оценка появится в этом блоке после проверки нашей системой
                </p>
                {userSolution && (
                  <div className="mt-4 p-4 bg-[#F9F9F9] rounded-xl">
                    <p className="text-sm text-[#1D1D1F] whitespace-pre-wrap">
                      {userSolution.content || userSolution.description}
                    </p>
                  </div>
                )}
              </Card>
            ) : userSolution && userSolution.evaluation ? (
              <>
                <Card className="p-6 bg-white border-0 shadow-sm">
                  <div className="flex items-center gap-2 text-[#159931] mb-4">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Ваше решение отправлено</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    {userSolution.content || userSolution.description}
                  </div>
                </Card>
                
                {/* Секция Результат */}
                {userSolution.evaluation && (
                  <Card className="p-6 bg-white border-0 shadow-sm">
                    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-6">Результат</h3>
                    
                    {/* Метрики с прогресс-барами - как в Figma */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {userSolution.evaluation.metrics?.map((metric: any, index: number) => {
                        const getGradeColor = (grade: string) => {
                          switch (grade) {
                            case "Senior": return { text: "text-[#159931]", bg: "bg-[#159931]" };
                            case "Middle": return { text: "text-[#FF9232]", bg: "bg-[#FF9232]" };
                            case "Junior": return { text: "text-[#FF6030]", bg: "bg-[#FF6030]" };
                            default: return { text: "text-[#666666]", bg: "bg-[#666666]" };
                          }
                        };
                        const colors = getGradeColor(metric.grade);
                        
                        return (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[#1D1D1F]">{metric.label}</span>
                              <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-semibold", colors.text)}>
                                  {metric.percentage}%
                                </span>
                                <span className={cn("text-xs font-medium px-2 py-0.5 rounded", colors.text, "bg-opacity-10", colors.bg.replace("bg-", "bg-"))}>
                                  {metric.grade}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-[#E8E8E8] rounded-full h-2.5 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all", colors.bg)}
                                style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Комментарий системы */}
                    {userSolution.evaluation.feedback && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="text-sm font-semibold text-[#1D1D1F] mb-3">Комментарий системы:</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {userSolution.evaluation.feedback}
                        </p>
                      </div>
                    )}
                  </Card>
                )}
              </>
            ) : userSolution ? (
              <Card className="p-6 bg-white border-0 shadow-sm">
                <div className="flex items-center gap-2 text-[#159931] mb-4">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Ваше решение отправлено</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {userSolution.content || userSolution.description}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center bg-white border-0 shadow-sm">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-[#1D1D1F] mb-2">
                  Вы ещё не отправили своё решение
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Загрузите свою работу, чтобы получить обратную связь
                </p>
                <Button 
                  className="gap-2 bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] rounded-xl"
                  onClick={handleSubmitSolution}
                  data-testid="button-upload-solution"
                >
                  <Send className="h-4 w-4" />
                  Отправить решение
                </Button>
              </Card>
            )}
          </div>
        )}
      </motion.div>

      {task && (
        <>
          <TaskSubmitModal
            open={isSubmitModalOpen}
            onOpenChange={setIsSubmitModalOpen}
            taskId={task.id}
            taskTitle={task.title}
            taskDescription={task.description || ""}
            onSuccess={handleSolutionSubmitted}
          />
          <TaskSubmitSuccessModal
            open={isSuccessModalOpen}
            onOpenChange={setIsSuccessModalOpen}
          />
        </>
      )}
    </MainLayout>
  );
}
