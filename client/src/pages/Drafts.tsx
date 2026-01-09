import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Edit2, Trash2, Send, FileText, ChevronLeft, Tag, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MainLayout from "@/components/layout/MainLayout";
import type { TaskDraft } from "@shared/schema";

export default function Drafts() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: drafts, isLoading } = useQuery<TaskDraft[]>({
    queryKey: ["/api/drafts"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/drafts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drafts"] });
      toast({
        title: "Черновик удалён",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить черновик",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (draft: TaskDraft) => {
      const res = await apiRequest("POST", "/api/tasks", {
        title: draft.title || "Без названия",
        description: draft.description || "",
        category: draft.category || "cases",
        level: draft.level || "junior",
        tags: draft.tags || [],
        sphere: draft.spheres?.[0] || null,
        status: "published",
      });
      return res.json();
    },
    onSuccess: async (_, draft) => {
      await apiRequest("DELETE", `/api/drafts/${draft.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/drafts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Задача опубликована",
        description: "Черновик успешно опубликован как задача",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось опубликовать черновик",
        variant: "destructive",
      });
    },
  });

  const getCategoryLabel = (category: string | null) => {
    const map: Record<string, string> = {
      cases: "Кейсы",
      product: "Продукты",
      uxui: "UX/UI",
      graphic: "Графический",
      "3d": "3D",
    };
    return category ? map[category] || category : null;
  };

  const getLevelLabel = (level: string | null) => {
    return level ? level.charAt(0).toUpperCase() + level.slice(1) : null;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const rightPanel = (
    <div className="space-y-4">
      <h3 className="font-semibold">О черновиках</h3>
      <p className="text-sm text-muted-foreground">
        Здесь хранятся ваши незавершённые задачи. Вы можете продолжить редактирование,
        удалить или опубликовать черновик.
      </p>
    </div>
  );

  return (
    <MainLayout rightPanel={rightPanel} title="Черновики" showCreateButton={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            data-testid="button-back-to-profile"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Мои черновики</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : drafts && drafts.length > 0 ? (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <Card key={draft.id} className="group" data-testid={`draft-card-${draft.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-semibold truncate">
                          {draft.title || "Без названия"}
                        </h3>
                      </div>

                      {draft.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {draft.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 items-center">
                        {getCategoryLabel(draft.category) && (
                          <span className="text-xs px-2 py-1 bg-[#F0F0F0] rounded">
                            {getCategoryLabel(draft.category)}
                          </span>
                        )}
                        {getLevelLabel(draft.level) && (
                          <span className="text-xs px-2 py-1 bg-[#F0F0F0] rounded">
                            {getLevelLabel(draft.level)}
                          </span>
                        )}
                        {draft.tags && draft.tags.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            {draft.tags.length}
                          </span>
                        )}
                        {draft.spheres && draft.spheres.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            {draft.spheres.length}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(draft.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast({
                            title: "Редактирование",
                            description: "Функция в разработке",
                          });
                        }}
                        data-testid={`button-edit-draft-${draft.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(draft.id)}
                        data-testid={`button-delete-draft-${draft.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => publishMutation.mutate(draft)}
                        disabled={!draft.title || !draft.category || !draft.level}
                        data-testid={`button-publish-draft-${draft.id}`}
                      >
                        <Send className="h-4 w-4 mr-1.5" />
                        Опубликовать
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Нет черновиков</h3>
              <p className="text-muted-foreground mb-4">
                Создайте задачу и сохраните её как черновик
              </p>
              <Button onClick={() => navigate("/tasks")} data-testid="button-go-to-tasks">
                Перейти к задачам
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить черновик?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Черновик будет удалён безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
