import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, Users, ChevronRight, Briefcase, Palette, Smartphone, Box, FileText } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTasks } from "@/hooks/use-data";
import { cn } from "@/lib/utils";
import CreateTaskModal from "@/components/modals/CreateTaskModal";

const categories = [
  { id: "all", label: "Все", icon: null },
  { id: "product", label: "Продукты", icon: Briefcase, color: "category-product" },
  { id: "graphic", label: "Графический", icon: Palette, color: "category-graphic" },
  { id: "uxui", label: "UX/UI", icon: Smartphone, color: "category-uxui" },
  { id: "3d", label: "3D", icon: Box, color: "category-3d" },
  { id: "cases", label: "Кейсы", icon: FileText, color: "category-cases" },
];

const levels = [
  { id: "all", label: "Все уровни" },
  { id: "intern", label: "Intern" },
  { id: "junior", label: "Junior" },
  { id: "middle", label: "Middle" },
  { id: "senior", label: "Senior" },
  { id: "lead", label: "Lead" },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "product": return Briefcase;
    case "graphic": return Palette;
    case "uxui": return Smartphone;
    case "3d": return Box;
    case "cases": return FileText;
    default: return FileText;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "product": return "bg-purple-100 text-purple-700";
    case "graphic": return "bg-amber-100 text-amber-700";
    case "uxui": return "bg-pink-100 text-pink-700";
    case "3d": return "bg-blue-100 text-blue-700";
    case "cases": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "intern": return "bg-sky-100 text-sky-700";
    case "junior": return "bg-emerald-100 text-emerald-700";
    case "middle": return "bg-amber-100 text-amber-700";
    case "senior": return "bg-orange-100 text-orange-700";
    case "lead": return "bg-rose-100 text-rose-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const mockTasks = [
  {
    id: 1,
    title: "Увеличить Retention на этапе онбординга",
    description: "Проанализировать текущий онбординг и предложить улучшения для повышения удержания пользователей",
    category: "product",
    level: "middle",
    estimatedTime: "4-6 часов",
    participants: 24,
    slug: "retention-onboarding",
  },
  {
    id: 2,
    title: "Редизайн карточки товара",
    description: "Создать новый дизайн карточки товара для мобильного приложения e-commerce",
    category: "uxui",
    level: "junior",
    estimatedTime: "2-3 часа",
    participants: 45,
    slug: "product-card-redesign",
  },
  {
    id: 3,
    title: "Анимированный лого для стартапа",
    description: "Разработать анимированную версию логотипа для использования в приложении и на сайте",
    category: "graphic",
    level: "senior",
    estimatedTime: "8-10 часов",
    participants: 12,
    slug: "animated-logo",
  },
  {
    id: 4,
    title: "3D модель упаковки продукта",
    description: "Создать реалистичную 3D модель упаковки для презентации клиенту",
    category: "3d",
    level: "middle",
    estimatedTime: "6-8 часов",
    participants: 8,
    slug: "3d-packaging",
  },
  {
    id: 5,
    title: "Кейс: Редизайн банковского приложения",
    description: "Полный кейс редизайна мобильного приложения банка с исследованием и прототипами",
    category: "cases",
    level: "lead",
    estimatedTime: "20-30 часов",
    participants: 5,
    slug: "bank-app-case",
  },
];

export default function Tasks() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: apiTasks, isLoading } = useTasks({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    level: selectedLevel !== "all" ? selectedLevel : undefined,
  });

  const tasks = apiTasks?.length ? apiTasks : mockTasks;

  const filteredTasks = tasks.filter((task: any) => {
    if (selectedCategory !== "all" && task.category !== selectedCategory) return false;
    if (selectedLevel !== "all" && task.level !== selectedLevel) return false;
    return true;
  });

  const rightPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Фильтр по уровню</h3>
        <div className="space-y-2">
          {levels.map((level) => (
            <Button
              key={level.id}
              variant={selectedLevel === level.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setSelectedLevel(level.id)}
              data-testid={`filter-level-${level.id}`}
            >
              {level.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-3">Статистика</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Всего задач</span>
            <span className="font-medium">{tasks.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Выполнено вами</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">В процессе</span>
            <span className="font-medium">0</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout 
      rightPanel={rightPanel}
      title="Задачи"
      onCreateClick={() => setIsCreateModalOpen(true)}
    >
      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-full",
                selectedCategory === cat.id && "font-medium"
              )}
              data-testid={`filter-category-${cat.id}`}
            >
              {Icon && <Icon className="h-4 w-4 mr-1.5" />}
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Задачи не найдены
          </div>
        ) : (
          filteredTasks.map((task: any, index: number) => {
            const CategoryIcon = getCategoryIcon(task.category);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/tasks/${task.slug}`}>
                <Card 
                  className="p-4 hover-elevate cursor-pointer group"
                  data-testid={`task-card-${task.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      getCategoryColor(task.category)
                    )}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                          {task.title}
                        </h3>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs font-medium", getLevelColor(task.level))}
                        >
                          {task.level}
                        </Badge>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{task.estimatedTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{task.participants}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>

      <CreateTaskModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </MainLayout>
  );
}
