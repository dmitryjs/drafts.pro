import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Star, 
  Search,
  Grid3X3,
  List,
  ChevronRight
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTasks } from "@/hooks/use-data";
import { cn } from "@/lib/utils";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "all", label: "Все темы", color: "bg-[#2D2D2D] text-white" },
  { id: "cases", label: "Кейсы", color: "bg-yellow-400" },
  { id: "product", label: "Продукты", color: "bg-green-500" },
  { id: "uxui", label: "UX/UI", color: "bg-purple-500" },
  { id: "graphic", label: "Графический", color: "bg-pink-500" },
  { id: "3d", label: "3D", color: "bg-blue-500" },
];

const statusFilters = [
  { id: "solution", label: "Решение" },
  { id: "review", label: "Проверка" },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "intern": return "text-blue-500";
    case "junior": return "text-emerald-500";
    case "middle": return "text-orange-500";
    case "senior": return "text-red-500";
    case "lead": return "text-purple-500";
    default: return "text-gray-500";
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
  { id: 1, name: "Яндекс.Еда", count: 156, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Yandex_Eda_logo.svg", bgColor: "bg-yellow-400" },
  { id: 2, name: "Тинькофф", count: 156, logo: "", bgColor: "bg-yellow-400" },
  { id: 3, name: "Сбер", count: 156, logo: "", bgColor: "bg-green-500" },
  { id: 4, name: "Авито", count: 156, logo: "", bgColor: "bg-blue-500" },
  { id: 5, name: "Google", count: 156, logo: "", bgColor: "bg-white border" },
];

const mockTasks = [
  {
    id: 1,
    title: "Увеличить Retention на онбординге в B2C продукте",
    description: "Необходимо увеличить ретеншен в продукте который работает в сфере B2C",
    category: "product",
    level: "middle",
    author: "Дмитрий Галкин",
    likes: 324,
    dislikes: 43,
    comments: 43,
    slug: "retention-onboarding",
  },
  {
    id: 2,
    title: "Увеличить Retention на онбординге в B2C продукте в несколько строк плюс ещё немного инфы",
    description: "Необходимо увеличить ретеншен в продукте который работает в сфере B2C",
    category: "product",
    level: "middle",
    author: "Дмитрий Галкин",
    likes: 324,
    dislikes: 43,
    comments: 43,
    slug: "retention-onboarding-2",
  },
  {
    id: 3,
    title: "Увеличить Retention на онбординге в B2C продукте",
    description: "Необходимо увеличить ретеншен в продукте который работает в сфере B2C ФыВЛФЭЫВЛСьФЭЖХЛСЬЭФЫВЫжСвВЛсвПЛпьЫЛпьЫльпЫльпЫльпЛЛД",
    category: "product",
    level: "middle",
    author: "Дмитрий Галкин",
    likes: 324,
    dislikes: 43,
    comments: 43,
    slug: "retention-onboarding-3",
  },
  {
    id: 4,
    title: "Увеличить Retention на онбординге в B2C продукте в несколько строк плюс ещё немного инфы",
    description: "Необходимо увеличить ретеншен в продукте который работает в сфере B2C ФыВЛФЭЫВЛСьФЭЖХЛСЬЭФЫВЫжСвВЛсвПЛпьЫЛпьЫльпЫльпЫльпЛЛД",
    category: "product",
    level: "middle",
    author: "Дмитрий Галкин",
    likes: 324,
    dislikes: 43,
    comments: 43,
    slug: "retention-onboarding-4",
  },
  {
    id: 5,
    title: "Увеличить Retention на онбординге в B2C продукте",
    description: "Необходимо увеличить ретеншен в продукте который работает в сфере B2C",
    category: "product",
    level: "middle",
    author: "Дмитрий Галкин",
    likes: 324,
    dislikes: 43,
    comments: 43,
    slug: "retention-onboarding-5",
  },
  {
    id: 6,
    title: "Увеличить Retention на онбординге в B2C продукте в несколько строк плюс ещё немного инфы",
    description: "Необходимо увеличить ретеншен в продукте который работает в сфере B2C ФыВЛФЭЫВЛСьФЭЖХЛСЬЭФЫВЫжСвВЛсвПЛпьЫЛпьЫльпЫльпЫльпЛЛД",
    category: "product",
    level: "middle",
    author: "Дмитрий Галкин",
    likes: 324,
    dislikes: 43,
    comments: 43,
    slug: "retention-onboarding-6",
  },
];

export default function Tasks() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("solution");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const { data: apiTasks, isLoading } = useTasks({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });
  
  const handleCreateBattle = () => {
    toast({
      title: "Создание батла",
      description: "Функция создания батла будет доступна в ближайшее время",
    });
  };

  const tasks = apiTasks?.length ? apiTasks : mockTasks;

  const filteredTasks = tasks.filter((task: any) => {
    if (selectedCategory !== "all" && task.category !== selectedCategory) return false;
    return true;
  });

  const rightPanel = (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Задачи от компаний</h3>
      <div className="space-y-2">
        {companyTasks.map((company) => (
          <div 
            key={company.id}
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
      onCreateBattle={handleCreateBattle}
    >
      {/* Filters Row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Status filters */}
        {statusFilters.map((status) => (
          <Button
            key={status.id}
            variant={selectedStatus === status.id ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(status.id)}
            className="rounded-full text-sm"
            data-testid={`filter-status-${status.id}`}
          >
            {status.label}
          </Button>
        ))}
        
        <div className="h-6 w-px bg-border mx-1" />
        
        {/* Category filters */}
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "rounded-full text-sm gap-1.5",
              selectedCategory === cat.id && cat.id === "all" && "bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
            )}
            data-testid={`filter-category-${cat.id}`}
          >
            {cat.id !== "all" && (
              <span className={cn("w-2 h-2 rounded-full", getCategoryDot(cat.id))} />
            )}
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск задач"
            className="pl-9 bg-white border-border rounded-lg"
            data-testid="input-search-tasks"
          />
        </div>
        
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="view-grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks Grid - 2 columns */}
      <div className={cn(
        "gap-4",
        viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2" : "flex flex-col"
      )}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white animate-pulse rounded-xl" />
          ))
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground col-span-2">
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
                  className="p-5 hover:shadow-md transition-shadow cursor-pointer bg-white border-0 shadow-sm"
                  data-testid={`task-card-${task.id}`}
                >
                  {/* Author and Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("w-2.5 h-2.5 rounded-full", getCategoryDot(task.category))} />
                    <span className="text-sm text-muted-foreground">{task.author}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground capitalize">
                      {task.category === "product" ? "Продукты" : 
                       task.category === "uxui" ? "UX/UI" :
                       task.category === "graphic" ? "Графический" :
                       task.category === "3d" ? "3D" : "Кейсы"}
                    </span>
                    <span className={cn("ml-auto text-sm font-medium", getLevelColor(task.level))}>
                      {task.level.charAt(0).toUpperCase() + task.level.slice(1)}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2">
                    {task.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {task.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </div>
                      <span>{task.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </div>
                      <span>{task.dislikes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </div>
                      <span>{task.comments}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-7 w-7"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <CreateTaskModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </MainLayout>
  );
}
