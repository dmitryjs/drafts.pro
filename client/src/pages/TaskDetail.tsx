import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Star,
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
  Flag
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTask } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:slug");
  const slug = params?.slug || "";
  const { data: task, isLoading } = useTask(slug);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("description");
  const [userSolution, setUserSolution] = useState<any>(null);

  const favoriteMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/tasks/${taskId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", slug] });
      toast({ title: "Обновлено" });
    },
  });

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

  const authorName = task.author || task.authorName || "Аноним";
  const attachments = task.attachments || [];
  const visibleAttachments = attachments.slice(0, 4);
  const remainingCount = Math.max(0, attachments.length - 4);
  const isFavorited = task.isFavorited || false;

  const handleSubmitSolution = () => {
    if (!user) return;
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
        className="max-w-4xl"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Left: Back + Author */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <button 
                className="h-9 w-9 rounded-full flex items-center justify-center bg-[#E8E8EE] hover:bg-[#DCDCE4] transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 text-[#1D1D1F]" />
              </button>
            </Link>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8E8EE]">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-[#159931] text-white">
                  {authorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-[#1D1D1F]">{authorName}</span>
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
                isFavorited ? "bg-[#FF6030] text-white" : "bg-[#E8E8EE] text-[#1D1D1F] hover:bg-[#DCDCE4]"
              )}
              data-testid="button-favorite"
            >
              <Star className="h-4 w-4" />
            </button>
            
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
              <Button 
                className="gap-2 bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] rounded-xl"
                onClick={handleSubmitSolution}
                data-testid="button-submit-solution"
              >
                <Send className="h-4 w-4" />
                Отправить решение
              </Button>
            ) : (
              <Link href="/auth">
                <Button 
                  className="gap-2 bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] rounded-xl"
                  data-testid="button-login-to-submit"
                >
                  Войдите, чтобы отправить
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Task Title */}
        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-6 leading-tight">
          {task.title}
        </h1>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FolderOpen className="h-3 w-3" /> Теги
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {task.tags.map((tag: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs font-normal bg-[#E8E8EE] text-[#1D1D1F] border-0 hover:bg-[#DCDCE4] cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent p-0 h-auto gap-2 mb-6">
            <TabsTrigger 
              value="description"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-white",
                "bg-[#E8E8EE] text-[#1D1D1F] hover:bg-[#DCDCE4]"
              )}
              data-testid="tab-description"
            >
              Описание задачи
            </TabsTrigger>
            <TabsTrigger 
              value="solution"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors data-[state=active]:bg-[#2D2D2D] data-[state=active]:text-white",
                "bg-[#E8E8EE] text-[#1D1D1F] hover:bg-[#DCDCE4]"
              )}
              data-testid="tab-solution"
            >
              Ваше решение
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-0">
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

            {/* Mock attachments for display purposes */}
            {attachments.length === 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-[#1D1D1F] mb-4">Ресурсы</h3>
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div 
                      key={index}
                      className="w-40 h-28 bg-[#2D2D2D] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#3D3D3D] transition-colors"
                      data-testid={`attachment-placeholder-${index}`}
                    >
                      <FileImage className="h-8 w-8 text-white/50" />
                    </div>
                  ))}
                  <div 
                    className="w-40 h-28 bg-[#2D2D2D] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#3D3D3D] transition-colors"
                    data-testid="attachment-more-placeholder"
                  >
                    <span className="text-white text-lg font-medium">+7</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="solution" className="mt-0">
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
            ) : userSolution ? (
              <Card className="p-6 bg-white border-0 shadow-sm">
                <div className="flex items-center gap-2 text-[#159931] mb-4">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Ваше решение отправлено</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {userSolution.content}
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
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
