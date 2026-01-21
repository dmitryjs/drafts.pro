import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  Check
} from "lucide-react";
import CategoryIcon3D from "@assets/icons/CategoryIcons_3D.svg";
import LikeIcon from "@assets/icons/Like.svg";
import DislikeIcon from "@assets/icons/Dislike.svg";
import FavoritesIcon from "@assets/icons/Favorites.svg";
import CategoryIconCases from "@assets/icons/CategoryIcons_Cases.svg";
import CategoryIconFolder from "@assets/icons/CategoryIcons_Folder.svg";
import CategoryIconFolderActive from "@assets/icons/CategoryIcons_Folder_Active.svg";
import CategoryIconGraphic from "@assets/icons/CategoryIcons_Graphic.svg";
import CategoryIconProducts from "@assets/icons/CategoryIcons_Products.svg";
import CategoryIconUXUI from "@assets/icons/CategoryIcons_UXUI.svg";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks } from "@/hooks/use-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const categories = [
  { id: "all", label: "Все темы", icon: CategoryIconFolder, iconActive: CategoryIconFolderActive },
  { id: "cases", label: "Кейсы", icon: CategoryIconCases },
  { id: "product", label: "Продукты", icon: CategoryIconProducts },
  { id: "uxui", label: "UX/UI", icon: CategoryIconUXUI },
  { id: "graphic", label: "Графический", icon: CategoryIconGraphic },
  { id: "3d", label: "3D", icon: CategoryIcon3D },
];

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "intern": return "text-[#666666]";
    case "junior": return "text-[#159931]";
    case "middle": return "text-[#FF9232]";
    case "senior": return "text-[#325BFF]";
    case "lead": return "text-[#FF32B7]";
    default: return "text-gray-500";
  }
};

const getLevelLabel = (level: string) => {
  switch (level.toLowerCase()) {
    case "intern": return "Intern";
    case "junior": return "Junior";
    case "middle": return "Middle";
    case "senior": return "Senior";
    case "lead": return "Lead";
    default: return level;
  }
};

const getCategoryDot = (category: string) => {
  switch (category) {
    case "product": return "bg-green-500";
    case "graphic": return "bg-pink-500";
    case "uxui": return "bg-purple-500";
    case "3d": return "bg-blue-500";
    case "cases": return "bg-yellow-400";
    default: return "bg-gray-400";
  }
};

const companyTasks = [
  { id: 1, name: "Яндекс.Еда", count: 156, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Yandex_Eda_logo.svg", bgColor: "bg-yellow-400", slug: "yandex-eda" },
  { id: 2, name: "Тинькофф", count: 156, logo: "", bgColor: "bg-yellow-400", slug: "tinkoff" },
  { id: 3, name: "Сбер", count: 156, logo: "", bgColor: "bg-green-500", slug: "sber" },
  { id: 4, name: "Авито", count: 156, logo: "", bgColor: "bg-blue-500", slug: "avito" },
  { id: 5, name: "Google", count: 156, logo: "", bgColor: "bg-white border", slug: "google" },
];

const mockTasks = [
  {
    id: 1,
    title: "Увеличить Retention на онбординге в B2C продукте",
    description: "Необходимо увеличить ретеншен в продукте который работает в сфере B2C",
    category: "product",
    level: "middle",
    author: "Дмитрий Галкин",
    authorId: 1,
    likes: 324,
    dislikes: 43,
    comments: 43,
    slug: "retention-onboarding",
    solutionsCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Создать дизайн мобильного приложения для доставки еды",
    description: "Нужен современный и удобный дизайн для iOS и Android приложения",
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
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Разработать логотип для финтех стартапа",
    description: "Требуется минималистичный и запоминающийся логотип",
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
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 4,
    title: "UX исследование для банковского приложения",
    description: "Провести исследование пользовательского опыта и предложить улучшения",
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
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 5,
    title: "Создать 3D модель продукта для презентации",
    description: "Нужна качественная 3D модель для маркетинговых материалов",
    category: "3d",
    level: "middle",
    author: "Анна Петрова",
    authorId: 2,
    likes: 189,
    dislikes: 5,
    comments: 23,
    slug: "product-3d-model",
    solutionsCount: 9,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 6,
    title: "Дизайн интерфейса для маркетплейса",
    description: "Создать удобный и интуитивный интерфейс для онлайн-магазина",
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
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 7,
    title: "Кейс: Редизайн корпоративного сайта",
    description: "Полный редизайн существующего корпоративного сайта с улучшением UX",
    category: "cases",
    level: "lead",
    author: "Иван Сидоров",
    authorId: 3,
    likes: 445,
    dislikes: 18,
    comments: 67,
    slug: "corporate-website-redesign",
    solutionsCount: 23,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 8,
    title: "Создать дизайн-систему для веб-платформы",
    description: "Разработать комплексную дизайн-систему с компонентами и гайдлайнами",
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
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

const grades = [
  { id: "all", label: "Все грейды" },
  { id: "Intern", label: "Intern" },
  { id: "Junior", label: "Junior" },
  { id: "Middle", label: "Middle" },
  { id: "Senior", label: "Senior" },
  { id: "Lead", label: "Lead" },
];

const sortOptions = [
  { id: "newest", label: "Сначала новые" },
  { id: "oldest", label: "Сначала старые" },
  { id: "solutions_desc", label: "Больше решений" },
  { id: "solutions_asc", label: "Меньше решений" },
];

export default function Tasks() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: apiTasks, isLoading, isError } = useTasks({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowFallback(false);
      return;
    }
    const timeoutId = window.setTimeout(() => setShowFallback(true), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [isLoading]);

  const voteMutation = useMutation({
    mutationFn: async ({ taskId, value }: { taskId: number; value: 1 | -1 }) => {
      return apiRequest("POST", `/api/tasks/${taskId}/vote`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/tasks/${taskId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Обновлено" });
    },
  });

  const handleVote = (e: React.MouseEvent, taskId: number, value: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Войдите, чтобы голосовать" });
      return;
    }
    voteMutation.mutate({ taskId, value });
  };

  const handleFavorite = (e: React.MouseEvent, taskId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Войдите, чтобы добавить в избранное" });
      return;
    }
    favoriteMutation.mutate(taskId);
  };

  const tasks = apiTasks?.length ? apiTasks : mockTasks;
  const isLoadingTasks = isLoading && !isError && !showFallback;

  let filteredTasks = tasks.filter((task: any) => {
    if (selectedCategory !== "all" && task.category !== selectedCategory) return false;
    if (selectedGrade !== "all" && task.level?.toLowerCase() !== selectedGrade.toLowerCase()) return false;
    return true;
  });

  // Sort tasks
  filteredTasks = [...filteredTasks].sort((a: any, b: any) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case "solutions_desc":
        return (b.solutionsCount || 0) - (a.solutionsCount || 0);
      case "solutions_asc":
        return (a.solutionsCount || 0) - (b.solutionsCount || 0);
      case "newest":
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  const rightPanel = (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Задачи от компаний</h3>
      <div className="space-y-2">
        {companyTasks.map((company) => (
          <Link key={company.id} href={`/companies/${company.slug || company.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <div 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                company.bgColor
              )}>
                {company.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{company.name}</p>
                <p className="text-xs text-muted-foreground">{company.count} задач</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Button variant="ghost" className="w-full justify-center text-sm text-muted-foreground">
        Показать все
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );

  return (
    <MainLayout 
      rightPanel={rightPanel}
      onCreateTask={() => setIsCreateModalOpen(true)}
    >
      <div className="w-full max-w-full lg:max-w-5xl lg:mx-auto">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide lg:flex-wrap lg:overflow-visible lg:pb-0 -mx-[15px] px-[15px] lg:mx-0 lg:px-0">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const iconSrc = cat.id === "all" && isActive && (cat as any).iconActive 
            ? (cat as any).iconActive 
            : cat.icon;
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "h-11 lg:h-auto lg:px-4 lg:py-2 px-4 py-3 rounded-full text-sm lg:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2",
                isActive 
                  ? "bg-[#141416] text-white"
                  : "bg-[#E8E8E8] text-[#1D1D1F] hover:bg-[#DCDCE4]"
              )}
              data-testid={`filter-category-${cat.id}`}
            >
              <img 
                src={iconSrc} 
                alt={cat.label} 
                className="w-5 h-5 lg:w-5 lg:h-5" 
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar - Full Width with Sort/Filter */}
      <div className="mb-6 -mx-[15px] px-[15px] lg:mx-0 lg:px-0">
        <div className="relative flex items-center lg:gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              placeholder="Поиск задач"
              className="pl-12 pr-[88px] lg:pr-4 h-[50px] lg:h-11 bg-[#FFFFFF] lg:bg-[#FFFFFF] border-border rounded-[12px] lg:rounded-xl w-full text-sm lg:text-base max-w-full"
              data-testid="input-search-tasks"
            />
            {/* Mobile: buttons inside search */}
            <div className="absolute right-[12px] top-1/2 -translate-y-1/2 flex items-center gap-2 lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-[#E8E8EE] transition-colors flex-shrink-0"
                    data-testid="button-sort"
                  >
                    <ArrowUpDown className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className="cursor-pointer"
                    >
                      <span className="flex-1">{option.label}</span>
                      {sortBy === option.id && <Check className="h-4 w-4 text-[#FF6030]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <button
                onClick={() => setIsFilterOpen(true)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                  selectedGrade !== "all" 
                    ? "bg-[#FF6030] text-white" 
                    : "text-muted-foreground hover:bg-[#E8E8EE]"
                )}
                data-testid="button-filter"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Desktop: Sort and Filter buttons outside */}
          <div className="hidden lg:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-11 w-11 rounded-xl flex items-center justify-center text-muted-foreground bg-[#E8E8E8] hover:bg-[#D7D7D7] transition-colors flex-shrink-0"
                  data-testid="button-sort-desktop"
                >
                  <ArrowUpDown className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className="cursor-pointer"
                  >
                    <span className="flex-1">{option.label}</span>
                    {sortBy === option.id && <Check className="h-4 w-4 text-[#FF6030]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                selectedGrade !== "all" 
                  ? "bg-[#FF6030] text-white hover:bg-[#E5562B]" 
                  : "bg-[#E8E8E8] text-muted-foreground hover:bg-[#D7D7D7]"
              )}
              data-testid="button-filter-desktop"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Grid - 2 columns on desktop, newsfeed on mobile */}
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 -mx-[15px] px-[15px] lg:mx-0 lg:px-0">
        {isLoadingTasks ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white animate-pulse rounded-xl" />
          ))
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground lg:col-span-2">
            Задачи не найдены
          </div>
        ) : (
          filteredTasks.map((task: any, index: number) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link href={`/tasks/${task.slug}`}>
                <Card 
                  className="p-4 md:p-5 h-auto md:h-[200px] flex flex-col hover:shadow-md transition-shadow cursor-pointer bg-white border-0 shadow-sm"
                  data-testid={`task-card-${task.id}`}
                >
                  {/* Author Avatar + Name -> Arrow -> Category Tag */}
                  <div className="flex items-start gap-2 mb-3 flex-shrink-0 relative">
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-20 lg:pr-0">
                      <UserAvatar name={task.author || task.authorName || "Аноним"} size="sm" />
                      <span className="text-sm lg:text-sm text-[#1D1D1F] font-medium truncate">{task.author || task.authorName || "Аноним"}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground hidden sm:block flex-shrink-0" />
                      <Badge variant="secondary" className="px-3 py-1 lg:px-2 lg:py-0.5 text-xs lg:text-xs font-normal bg-[#E8E8EE] text-[#1D1D1F] border-0 whitespace-nowrap flex-shrink-0">
                        {task.category === "product" || task.category === "Продукт" ? "Продукты" : 
                         task.category === "uxui" || task.category === "UX/UI" ? "UX/UI" :
                         task.category === "graphic" || task.category === "Графический" ? "Графический" :
                         task.category === "3d" || task.category === "3D" ? "3D" : "Кейсы"}
                      </Badge>
                    </div>
                    <span className={cn("text-sm lg:text-sm font-medium whitespace-nowrap absolute top-0 right-0 lg:static lg:ml-auto flex-shrink-0", getLevelColor(task.level))}>
                      {getLevelLabel(task.level)}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-semibold text-lg lg:text-base leading-snug mb-2 line-clamp-2 text-[#1D1D1F] flex-shrink-0">
                    {task.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm lg:text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                    {task.description}
                  </p>
                  
                  {/* Interactive Action Buttons - Like/Dislike and Favorite - ВРЕМЕННО ОТКЛЮЧЕНО */}
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
      </div>

      <CreateTaskModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />

      {/* Filter Sheet Overlay */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-80 sm:w-96 bg-white">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-base md:text-lg font-semibold">Фильтры</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Грейд</h4>
              <div className="space-y-2">
                {grades.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => setSelectedGrade(grade.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors",
                      selectedGrade === grade.id
                        ? "bg-[#FF6030] text-white"
                        : "bg-[#F4F4F5] text-[#1D1D1F] hover:bg-[#E8E8EE]"
                    )}
                    data-testid={`filter-grade-${grade.id}`}
                  >
                    {grade.label}
                    {selectedGrade === grade.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedGrade("all");
                  setIsFilterOpen(false);
                }}
                data-testid="button-reset-filters"
              >
                Сбросить
              </Button>
              <Button
                className="flex-1 bg-[#FF6030] hover:bg-[#E55525]"
                onClick={() => setIsFilterOpen(false)}
                data-testid="button-apply-filters"
              >
                Применить
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
