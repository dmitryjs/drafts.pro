import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Briefcase,
  Palette,
  Smartphone,
  Box,
  FileText,
  Tag,
  Upload
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTask } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "продукт":
    case "product": return Briefcase;
    case "графический":
    case "graphic": return Palette;
    case "ux/ui":
    case "uxui": return Smartphone;
    case "3d": return Box;
    case "кейсы":
    case "cases": return FileText;
    default: return FileText;
  }
};

const getCategoryColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case "продукт":
    case "product": return "bg-purple-100 text-purple-700";
    case "графический":
    case "graphic": return "bg-amber-100 text-amber-700";
    case "ux/ui":
    case "uxui": return "bg-pink-100 text-pink-700";
    case "3d": return "bg-blue-100 text-blue-700";
    case "кейсы":
    case "cases": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const getLevelColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "intern": return "bg-sky-100 text-sky-700";
    case "junior": return "bg-emerald-100 text-emerald-700";
    case "middle": return "bg-amber-100 text-amber-700";
    case "senior": return "bg-orange-100 text-orange-700";
    case "lead": return "bg-rose-100 text-rose-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:slug");
  const slug = params?.slug || "";
  const { data: task, isLoading } = useTask(slug);
  const [solution, setSolution] = useState("");

  if (isLoading) {
    return (
      <MainLayout title="Загрузка..." showCreateButton={false}>
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout title="Задача не найдена" showCreateButton={false}>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Эта задача не существует или была удалена</p>
          <Link href="/">
            <Button>Вернуться к задачам</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const CategoryIcon = getCategoryIcon(task.category);

  const rightPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Информация</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Уровень</span>
            <Badge className={cn("text-xs", getLevelColor(task.level))}>
              {task.level}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Категория</span>
            <span className="font-medium">{task.category}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Решений</span>
            <span className="font-medium">{task.solutionsCount || 0}</span>
          </div>
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">Теги</h3>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {task.sphere && (
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">Сфера</h3>
          <p className="text-sm text-muted-foreground">{task.sphere}</p>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout rightPanel={rightPanel} showCreateButton={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к задачам
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
            getCategoryColor(task.category)
          )}>
            <CategoryIcon className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={cn("text-xs", getLevelColor(task.level))}>
                {task.level}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="p-6">
          <div className="prose prose-sm max-w-none">
            {(() => {
              const lines = task.description?.split('\n') || [];
              const elements: JSX.Element[] = [];
              let i = 0;
              
              while (i < lines.length) {
                const line = lines[i];
                
                if (line.startsWith('**') && line.endsWith('**')) {
                  elements.push(
                    <h3 key={i} className="font-semibold mt-4 mb-2 first:mt-0">
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
                    <ul key={`ul-${i}`} className="ml-4 list-disc space-y-1">
                      {items.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  );
                } else if (/^\d+\./.test(line)) {
                  const items: string[] = [];
                  while (i < lines.length && /^\d+\./.test(lines[i])) {
                    items.push(lines[i].replace(/^\d+\.\s*/, ''));
                    i++;
                  }
                  elements.push(
                    <ol key={`ol-${i}`} className="ml-4 list-decimal space-y-1">
                      {items.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ol>
                  );
                } else if (line.trim()) {
                  elements.push(<p key={i}>{line}</p>);
                  i++;
                } else {
                  i++;
                }
              }
              
              return elements;
            })()}
          </div>
        </Card>

        {/* Submit Solution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Отправить решение</h3>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Опишите ваше решение или добавьте ссылку на Figma/Behance..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="min-h-[150px]"
            />
            
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Загрузить файлы
              </Button>
              
              <div className="flex-1" />
              
              <Button disabled={!solution.trim()}>
                Отправить решение
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
