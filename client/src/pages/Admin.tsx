import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Swords, 
  HelpCircle, 
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Shield,
  ShieldCheck,
  Check,
  X,
  Loader2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  usersCount: number;
  tasksCount: number;
  battlesCount: number;
  questionsCount: number;
  activeBattles: number;
  pendingBattles: number;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
}

interface Battle {
  id: number;
  slug: string;
  title: string;
  description: string;
  theme: string;
  category: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

interface AssessmentQuestion {
  id: number;
  specialization: string;
  question: string;
  options: any;
  category: string | null;
  difficulty: string | null;
  order: number | null;
}

export default function Admin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClientInstance = useQueryClient();
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [selectedSphere, setSelectedSphere] = useState("product");
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "mcq",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
    difficulty: "Medium",
  });

  const { data: isAdminCheck, isLoading: checkingAdmin } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdminCheck?.isAdmin === true,
  });

  const { data: users } = useQuery<AuthUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdminCheck?.isAdmin === true,
  });

  const { data: battles } = useQuery<Battle[]>({
    queryKey: ["/api/admin/battles"],
    enabled: isAdminCheck?.isAdmin === true,
  });

  const { data: questions } = useQuery<AssessmentQuestion[]>({
    queryKey: ["/api/admin/questions", selectedSphere],
    enabled: isAdminCheck?.isAdmin === true,
  });

  const setAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/admin`, { isAdmin });
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Статус администратора обновлён" });
    },
  });

  const updateBattleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Battle> }) => {
      return apiRequest("PATCH", `/api/admin/battles/${id}`, data);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Батл обновлён" });
    },
  });

  const deleteBattleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/battles/${id}`);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Батл удалён" });
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/questions", data);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsAddQuestionOpen(false);
      setNewQuestion({
        question: "",
        type: "mcq",
        options: ["", "", "", ""],
        correctAnswer: 0,
        category: "",
        difficulty: "Medium",
      });
      toast({ title: "Вопрос создан" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/questions/${id}`);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/questions"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Вопрос удалён" });
    },
  });

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdminCheck?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-bold mb-2">Доступ запрещён</h1>
            <p className="text-muted-foreground mb-4">
              У вас нет прав администратора для доступа к этой странице.
            </p>
            <Button onClick={() => navigate("/")}>Вернуться на главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateQuestion = () => {
    const formattedOptions = newQuestion.type === "mcq" 
      ? newQuestion.options.filter(o => o.trim()).map((text, i) => ({
          text,
          isCorrect: i === newQuestion.correctAnswer,
          points: i === newQuestion.correctAnswer ? 1 : 0,
        }))
      : [];

    createQuestionMutation.mutate({
      specialization: selectedSphere,
      question: newQuestion.question,
      options: formattedOptions,
      category: newQuestion.category || null,
      difficulty: newQuestion.difficulty,
    });
  };

  const getBattleStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      upcoming: { label: "Ожидает", variant: "outline" },
      active: { label: "Активен", variant: "default" },
      voting: { label: "Голосование", variant: "secondary" },
      finished: { label: "Завершён", variant: "secondary" },
    };
    const { label, variant } = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[#FF6030]" />
            <h1 className="text-xl font-bold">Админ-панель</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Вернуться на сайт
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="battles" className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              Батлы
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Вопросы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Пользователей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.usersCount || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Задач
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.tasksCount || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Батлов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.battlesCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.activeBattles || 0} активных
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Вопросов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.questionsCount || 0}</div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Админ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profileImageUrl || ""} />
                              <AvatarFallback>
                                {(user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ru-RU") : "—"}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={user.isAdmin}
                            onCheckedChange={(checked) => 
                              setAdminMutation.mutate({ userId: user.id, isAdmin: checked })
                            }
                            data-testid={`switch-admin-${user.id}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="battles">
            <Card>
              <CardHeader>
                <CardTitle>Управление батлами</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Тема</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battles?.map((battle) => (
                      <TableRow key={battle.id}>
                        <TableCell className="font-medium">{battle.title}</TableCell>
                        <TableCell>{battle.theme}</TableCell>
                        <TableCell>{battle.category}</TableCell>
                        <TableCell>{getBattleStatusBadge(battle.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={battle.status}
                              onValueChange={(value) =>
                                updateBattleMutation.mutate({ id: battle.id, data: { status: value } })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="upcoming">Ожидает</SelectItem>
                                <SelectItem value="active">Активен</SelectItem>
                                <SelectItem value="voting">Голосование</SelectItem>
                                <SelectItem value="finished">Завершён</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBattleMutation.mutate(battle.id)}
                              data-testid={`button-delete-battle-${battle.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление вопросами</CardTitle>
                <div className="flex items-center gap-4">
                  <Select value={selectedSphere} onValueChange={setSelectedSphere}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Продакт дизайн</SelectItem>
                      <SelectItem value="uxui">UX/UI дизайн</SelectItem>
                      <SelectItem value="graphic">Графический дизайн</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-question">
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить вопрос
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Добавить вопрос</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Вопрос</Label>
                          <Textarea
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                            placeholder="Введите текст вопроса..."
                            data-testid="input-question-text"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Тип ответа</Label>
                            <Select
                              value={newQuestion.type}
                              onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mcq">Варианты ответа</SelectItem>
                                <SelectItem value="free">Развёрнутый ответ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Сложность</Label>
                            <Select
                              value={newQuestion.difficulty}
                              onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Easy">Лёгкий</SelectItem>
                                <SelectItem value="Medium">Средний</SelectItem>
                                <SelectItem value="Hard">Сложный</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Категория</Label>
                          <Input
                            value={newQuestion.category}
                            onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                            placeholder="Например: Теория, Практика, Инструменты"
                            data-testid="input-question-category"
                          />
                        </div>
                        {newQuestion.type === "mcq" && (
                          <div className="space-y-2">
                            <Label>Варианты ответов</Label>
                            {newQuestion.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Button
                                  variant={newQuestion.correctAnswer === idx ? "default" : "outline"}
                                  size="icon"
                                  className="shrink-0"
                                  onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: idx })}
                                  data-testid={`button-correct-answer-${idx}`}
                                >
                                  {newQuestion.correctAnswer === idx ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <span className="text-xs">{idx + 1}</span>
                                  )}
                                </Button>
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...newQuestion.options];
                                    newOptions[idx] = e.target.value;
                                    setNewQuestion({ ...newQuestion, options: newOptions });
                                  }}
                                  placeholder={`Вариант ${idx + 1}`}
                                  data-testid={`input-option-${idx}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          className="w-full"
                          onClick={handleCreateQuestion}
                          disabled={createQuestionMutation.isPending || !newQuestion.question.trim()}
                          data-testid="button-save-question"
                        >
                          {createQuestionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Сохранить вопрос
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Вопрос</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Сложность</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions?.map((q, idx) => (
                      <TableRow key={q.id}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="max-w-md truncate">{q.question}</TableCell>
                        <TableCell>{q.category || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{q.difficulty || "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteQuestionMutation.mutate(q.id)}
                            data-testid={`button-delete-question-${q.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!questions || questions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Нет вопросов для выбранной сферы
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
