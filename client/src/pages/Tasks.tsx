import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ChevronUp,
  ChevronDown,
  MessageCircle, 
  Star, 
  Search,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTasks, useTaskInteraction } from "@/hooks/use-data";
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const { data: apiTasks, isLoading } = useTasks({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });
  const taskInteraction = useTaskInteraction();
  
  const handleCreateBattle = () => {
    toast({
      title: "Создание батла",
      description: "Функция создания батла будет доступна в ближайшее время",
    });
  };
  
  const handleUpvote = (e: React.MouseEvent, taskId: number) => {
    e.preventDefault();
    e.stopPropagation();
    taskInteraction.mutate({ taskId, action: 'upvote' });
  };
  
  const handleDownvote = (e: React.MouseEvent, taskId: number) => {
    e.preventDefault();
    e.stopPropagation();
    taskInteraction.mutate({ taskId, action: 'downvote' });
  };
  
  const handleBookmark = (e: React.MouseEvent, taskId: number) => {
    e.preventDefault();
    e.stopPropagation();
    taskInteraction.mutate({ taskId, action: 'bookmark' });
    toast({ title: "Добавлено в закладки" });
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
      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedCategory === cat.id 
                ? cat.id === "all" 
                  ? "bg-[#2D2D2D] text-white" 
                  : "bg-[#2D2D2D] text-white"
                : "bg-[#E8E8EE] text-[#1D1D1F]"
            )}
            data-testid={`filter-category-${cat.id}`}
          >
            <span className="flex items-center gap-1.5">
              {cat.id !== "all" && selectedCategory !== cat.id && (
                <span className={cn("w-2 h-2 rounded-full", getCategoryDot(cat.id))} />
              )}
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar - Full Width with Sort/Filter */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" fill="currentColor" />
          <Input
            placeholder="Поиск задач"
            className="pl-12 h-11 bg-white border-border rounded-xl w-full"
            style={{ height: '44px' }}
            data-testid="input-search-tasks"
          />
        </div>
        
        <button
          className="h-11 w-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-[#E8E8EE] transition-colors"
          data-testid="button-sort"
        >
          <ArrowUpDown className="h-5 w-5" />
        </button>
        <button
          className="h-11 w-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-[#E8E8EE] transition-colors"
          data-testid="button-filter"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Tasks Grid - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {/* Author Avatar + Name -> Arrow -> Category Tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                        {task.author?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-[#1D1D1F] font-medium">{task.author}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs font-normal bg-[#E8E8EE] text-[#1D1D1F] border-0">
                      {task.category === "product" ? "Продукты" : 
                       task.category === "uxui" ? "UX/UI" :
                       task.category === "graphic" ? "Графический" :
                       task.category === "3d" ? "3D" : "Кейсы"}
                    </Badge>
                    <span className={cn("ml-auto text-sm font-medium", getLevelColor(task.level))}>
                      {getLevelLabel(task.level)}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2 text-[#1D1D1F]">
                    {task.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {task.description}
                  </p>
                  
                  {/* Interactive Action Buttons - Reddit style */}
                  <div className="flex items-center gap-2">
                    {/* Upvote */}
                    <button
                      onClick={(e) => handleUpvote(e, task.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] transition-colors"
                      data-testid={`button-upvote-${task.id}`}
                    >
                      <ChevronUp className="h-4 w-4" fill="currentColor" strokeWidth={3} />
                      <span className="text-sm font-medium">{task.likes || 0}</span>
                    </button>
                    
                    {/* Downvote */}
                    <button
                      onClick={(e) => handleDownvote(e, task.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] transition-colors"
                      data-testid={`button-downvote-${task.id}`}
                    >
                      <ChevronDown className="h-4 w-4" fill="currentColor" strokeWidth={3} />
                      <span className="text-sm font-medium">{task.dislikes || 0}</span>
                    </button>
                    
                    {/* Comments */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-[#E8E8EE] transition-colors"
                      data-testid={`button-comments-${task.id}`}
                    >
                      <MessageCircle className="h-4 w-4 text-muted-foreground" fill="currentColor" />
                      <span className="text-sm text-muted-foreground">{task.comments || 0}</span>
                    </button>
                    
                    {/* Bookmark */}
                    <button
                      onClick={(e) => handleBookmark(e, task.id)}
                      className="ml-auto h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#E8E8EE] transition-colors"
                      data-testid={`button-bookmark-${task.id}`}
                    >
                      <Star className="h-4 w-4 text-muted-foreground" fill="currentColor" />
                    </button>
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
