import { useState } from "react";
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
  LayoutGrid,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Shield,
  ShieldCheck,
  Check,
  X,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Building2,
  Upload,
  GraduationCap
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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

interface Task {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  solutionsCount: number;
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

interface Company {
  id: number;
  name: string;
  slug: string;
  email: string;
  password: string | null;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  size: string | null;
  tasksCreated: number;
  battlesCreated: number;
  isActive: boolean;
  createdAt: string;
}

const CHART_COLORS = ["#FF6030", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

export default function Admin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClientInstance = useQueryClient();
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [selectedSphere, setSelectedSphere] = useState("product");
  
  // Detail view states
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // New company form
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    password: "",
    website: "",
    description: "",
    industry: "",
    size: "",
  });
  
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "mcq",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
    difficulty: "Medium",
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "product",
    level: "junior",
  });

  const { user } = useAuth();
  
  const { data: isAdminCheck, isLoading: checkingAdmin } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check", user?.id],
    queryFn: async () => {
      if (!user?.id) return { isAdmin: false };
      // Передаем userId в query параметре
      const response = await fetch(`/api/admin/check?userId=${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) return { isAdmin: false };
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdminCheck?.isAdmin === true,
  });

  const { data: users } = useQuery<AuthUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdminCheck?.isAdmin === true,
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: isAdminCheck?.isAdmin === true,
  });

  const { data: battles } = useQuery<Battle[]>({
    queryKey: ["/api/admin/battles"],
    enabled: isAdminCheck?.isAdmin === true,
  });

  const { data: questions } = useQuery<AssessmentQuestion[]>({
    queryKey: ["/api/admin/questions", selectedSphere],
    queryFn: async () => {
      const res = await fetch(`/api/admin/questions?specialization=${selectedSphere}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return res.json();
    },
    enabled: isAdminCheck?.isAdmin === true,
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/admin/companies"],
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

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsAddTaskOpen(false);
      setNewTask({ title: "", description: "", category: "product", level: "junior" });
      toast({ title: "Задача создана" });
    },
    onError: () => {
      toast({ title: "Ошибка создания задачи", variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Задача удалена" });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/companies", data);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      setIsAddCompanyOpen(false);
      setNewCompany({ name: "", email: "", password: "", website: "", description: "", industry: "", size: "" });
      toast({ title: "Компания создана" });
    },
    onError: () => {
      toast({ title: "Ошибка создания компании", variant: "destructive" });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Company> }) => {
      return apiRequest("PATCH", `/api/admin/companies/${id}`, data);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      toast({ title: "Компания обновлена" });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/companies/${id}`);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      toast({ title: "Компания удалена" });
    },
  });

  const approveBattleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/admin/battles/${id}/approve`);
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      toast({ title: "Батл одобрен" });
    },
  });

  const rejectBattleMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return apiRequest("POST", `/api/admin/battles/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      toast({ title: "Батл отклонён" });
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

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }
    createTaskMutation.mutate(newTask);
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

  const getTaskLevelBadge = (level: string) => {
    const levelColors: Record<string, string> = {
      intern: "bg-gray-100 text-gray-700",
      junior: "bg-green-100 text-green-700",
      middle: "bg-orange-100 text-orange-700",
      senior: "bg-blue-100 text-blue-700",
      lead: "bg-purple-100 text-purple-700",
    };
    return (
      <Badge className={levelColors[level?.toLowerCase()] || "bg-gray-100 text-gray-700"}>
        {level}
      </Badge>
    );
  };

  // Chart data preparation
  const categoryData = [
    { name: "Продукт", value: tasks?.filter(t => t.category === "product" || t.category === "Продукт").length || 0 },
    { name: "UX/UI", value: tasks?.filter(t => t.category === "uxui" || t.category === "UX/UI").length || 0 },
    { name: "Графика", value: tasks?.filter(t => t.category === "graphic" || t.category === "Графический").length || 0 },
    { name: "3D", value: tasks?.filter(t => t.category === "3d" || t.category === "3D").length || 0 },
    { name: "Кейсы", value: tasks?.filter(t => t.category === "cases" || t.category === "Кейсы").length || 0 },
  ].filter(d => d.value > 0);

  const levelData = [
    { name: "Intern", count: tasks?.filter(t => t.level?.toLowerCase() === "intern").length || 0 },
    { name: "Junior", count: tasks?.filter(t => t.level?.toLowerCase() === "junior").length || 0 },
    { name: "Middle", count: tasks?.filter(t => t.level?.toLowerCase() === "middle").length || 0 },
    { name: "Senior", count: tasks?.filter(t => t.level?.toLowerCase() === "senior").length || 0 },
    { name: "Lead", count: tasks?.filter(t => t.level?.toLowerCase() === "lead").length || 0 },
  ];

  const battleStatusData = [
    { name: "Активные", value: battles?.filter(b => b.status === "active").length || 0 },
    { name: "Голосование", value: battles?.filter(b => b.status === "voting").length || 0 },
    { name: "Ожидают", value: battles?.filter(b => b.status === "upcoming").length || 0 },
    { name: "Завершены", value: battles?.filter(b => b.status === "finished").length || 0 },
  ].filter(d => d.value > 0);

  const activityData = [
    { name: "Пн", users: 12, tasks: 5, battles: 2 },
    { name: "Вт", users: 19, tasks: 8, battles: 3 },
    { name: "Ср", users: 15, tasks: 6, battles: 1 },
    { name: "Чт", users: 22, tasks: 10, battles: 4 },
    { name: "Пт", users: 28, tasks: 12, battles: 5 },
    { name: "Сб", users: 18, tasks: 7, battles: 2 },
    { name: "Вс", users: 14, tasks: 4, battles: 1 },
  ];

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
          {/* Mobile: Horizontal Tabs */}
          <TabsList className="grid w-full grid-cols-6 max-w-3xl lg:hidden">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Дашборд</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Пользователи</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Задачи</span>
            </TabsTrigger>
            <TabsTrigger value="battles" className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Батлы</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Тесты</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Компании</span>
            </TabsTrigger>
          </TabsList>

          {/* Контент + сайдбар (на десктопе) */}
          <div className="lg:flex lg:gap-6">
            {/* Sidebar (desktop-only) */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <TabsList className="flex flex-col h-auto w-full p-1 bg-transparent gap-1">
                <TabsTrigger 
                  value="dashboard" 
                  className="w-full justify-start gap-3 h-10 px-3 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1D1D1F]"
                >
                  <BarChart3 className="h-4 w-4" />
                  Дашборд
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="w-full justify-start gap-3 h-10 px-3 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1D1D1F]"
                >
                  <Users className="h-4 w-4" />
                  Пользователи
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="w-full justify-start gap-3 h-10 px-3 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1D1D1F]"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Задачи
                </TabsTrigger>
                <TabsTrigger 
                  value="battles" 
                  className="w-full justify-start gap-3 h-10 px-3 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1D1D1F]"
                >
                  <Swords className="h-4 w-4" />
                  Батлы
                </TabsTrigger>
                <TabsTrigger 
                  value="tests" 
                  className="w-full justify-start gap-3 h-10 px-3 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1D1D1F]"
                >
                  <FileText className="h-4 w-4" />
                  Тесты
                </TabsTrigger>
                <TabsTrigger 
                  value="companies" 
                  className="w-full justify-start gap-3 h-10 px-3 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1D1D1F]"
                >
                  <Building2 className="h-4 w-4" />
                  Компании
                </TabsTrigger>
                <TabsTrigger 
                  value="mentor" 
                  className="w-full justify-start gap-3 h-10 px-3 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1D1D1F]"
                >
                  <GraduationCap className="h-4 w-4" />
                  Кабинет ментора
                </TabsTrigger>
              </TabsList>
            </aside>

            {/* Основной контент (общий для мобилки и десктопа) */}
            <div className="flex-1">
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="mt-0 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Пользователей
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.usersCount || 0}</div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" /> +12% за неделю
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Задач
                    </CardTitle>
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.tasksCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tasks?.filter(t => t.status === "published").length || 0} опубликовано
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Батлов
                    </CardTitle>
                    <Swords className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.battlesCount || 0}</div>
                    <p className="text-xs text-[#FF6030] flex items-center mt-1">
                      <Activity className="h-3 w-3 mr-1" /> {stats?.activeBattles || 0} активных
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Вопросов в тестах
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.questionsCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      По 3 специализациям
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Активность за неделю</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="users" 
                            name="Пользователи"
                            stroke="#FF6030" 
                            fill="#FF6030" 
                            fillOpacity={0.3}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="tasks" 
                            name="Задачи"
                            stroke="#3B82F6" 
                            fill="#3B82F6"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks by Level */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Задачи по уровню сложности</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={levelData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" stroke="#888" fontSize={12} />
                          <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={60} />
                          <Tooltip />
                          <Bar dataKey="count" name="Количество" fill="#FF6030" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Second Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks by Category Pie */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Задачи по категориям</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData.length > 0 ? categoryData : [{ name: "Нет данных", value: 1 }]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Battle Status Pie */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Статусы батлов</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={battleStatusData.length > 0 ? battleStatusData : [{ name: "Нет данных", value: 1 }]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {battleStatusData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-0">
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
                      <TableRow 
                        key={user.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedUser(user)}
                        data-testid={`row-user-${user.id}`}
                      >
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
                        <TableCell onClick={(e) => e.stopPropagation()}>
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

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление задачами</CardTitle>
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-task">
                      <Plus className="h-4 w-4 mr-2" />
                      Создать задачу
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Создать задачу</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Название</Label>
                        <Input
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="Введите название задачи..."
                          data-testid="input-task-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Описание</Label>
                        <Textarea
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="Опишите задачу подробно..."
                          className="min-h-[150px]"
                          data-testid="input-task-description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Категория</Label>
                          <Select
                            value={newTask.category}
                            onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="product">Продукт</SelectItem>
                              <SelectItem value="uxui">UX/UI</SelectItem>
                              <SelectItem value="graphic">Графический</SelectItem>
                              <SelectItem value="3d">3D</SelectItem>
                              <SelectItem value="cases">Кейсы</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Уровень</Label>
                          <Select
                            value={newTask.level}
                            onValueChange={(value) => setNewTask({ ...newTask, level: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="intern">Intern</SelectItem>
                              <SelectItem value="junior">Junior</SelectItem>
                              <SelectItem value="middle">Middle</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                              <SelectItem value="lead">Lead</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-[#FF6030] hover:bg-[#E55525]"
                        onClick={handleCreateTask}
                        disabled={createTaskMutation.isPending}
                        data-testid="button-save-task"
                      >
                        {createTaskMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Создать задачу
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Уровень</TableHead>
                      <TableHead>Решений</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks?.map((task) => (
                      <TableRow 
                        key={task.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedTask(task)}
                        data-testid={`row-task-${task.id}`}
                      >
                        <TableCell className="font-medium max-w-xs truncate">
                          {task.title}
                        </TableCell>
                        <TableCell>{task.category}</TableCell>
                        <TableCell>{getTaskLevelBadge(task.level)}</TableCell>
                        <TableCell>{task.solutionsCount || 0}</TableCell>
                        <TableCell>
                          <Badge variant={task.status === "published" ? "default" : "secondary"}>
                            {task.status === "published" ? "Опубликовано" : task.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            data-testid={`button-delete-task-${task.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!tasks || tasks.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Нет задач
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
              </TabsContent>

              {/* Battles Tab */}
              <TabsContent value="battles" className="mt-0">
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
                      <TableRow 
                        key={battle.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedBattle(battle)}
                        data-testid={`row-battle-${battle.id}`}
                      >
                        <TableCell className="font-medium">{battle.title}</TableCell>
                        <TableCell>{battle.theme}</TableCell>
                        <TableCell>{battle.category}</TableCell>
                        <TableCell>{getBattleStatusBadge(battle.status)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                    {(!battles || battles.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Нет батлов
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
              </TabsContent>

              {/* Tests Tab (renamed from Questions) */}
              <TabsContent value="tests" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление тестами</CardTitle>
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        
                        try {
                          const text = await file.text();
                          const data = JSON.parse(text);
                          
                          if (!Array.isArray(data)) {
                            toast({ title: "Неверный формат JSON. Ожидается массив вопросов", variant: "destructive" });
                            return;
                          }
                          
                          let successCount = 0;
                          for (const q of data) {
                            try {
                              await apiRequest("POST", "/api/admin/questions", {
                                specialization: selectedSphere,
                                question: q.question,
                                options: q.options || [],
                                category: q.category || null,
                                difficulty: q.difficulty || "Medium",
                              });
                              successCount++;
                            } catch (err) {
                              console.error("Failed to import question:", err);
                            }
                          }
                          
                          queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/questions"] });
                          toast({ title: `Импортировано ${successCount} из ${data.length} вопросов` });
                        } catch (err) {
                          toast({ title: "Ошибка чтения JSON файла", variant: "destructive" });
                        }
                      };
                      input.click();
                    }}
                    data-testid="button-upload-questions"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Загрузить JSON
                  </Button>
                  <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-question">
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить вопрос
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Добавить вопрос в тест</DialogTitle>
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
                          className="w-full bg-[#FF6030] hover:bg-[#E55525]"
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
                      <TableRow 
                        key={q.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedQuestion(q)}
                        data-testid={`row-question-${q.id}`}
                      >
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="max-w-md truncate">{q.question}</TableCell>
                        <TableCell>{q.category || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{q.difficulty || "—"}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
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

              {/* Companies Tab */}
              <TabsContent value="companies" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Компании ({companies?.length || 0})</CardTitle>
                  <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D]" data-testid="button-add-company">
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить компанию
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Добавить компанию</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Название компании *</Label>
                          <Input
                            value={newCompany.name}
                            onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                            placeholder="ООО Компания"
                            data-testid="input-company-name"
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={newCompany.email}
                            onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                            placeholder="company@example.com"
                            data-testid="input-company-email"
                          />
                        </div>
                        <div>
                          <Label>Пароль</Label>
                          <Input
                            type="password"
                            value={newCompany.password}
                            onChange={(e) => setNewCompany({ ...newCompany, password: e.target.value })}
                            placeholder="Введите пароль"
                            data-testid="input-company-password"
                          />
                        </div>
                        <div>
                          <Label>Веб-сайт</Label>
                          <Input
                            value={newCompany.website}
                            onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                            placeholder="https://company.com"
                            data-testid="input-company-website"
                          />
                        </div>
                        <div>
                          <Label>Индустрия</Label>
                          <Select value={newCompany.industry} onValueChange={(v) => setNewCompany({ ...newCompany, industry: v })}>
                            <SelectTrigger data-testid="select-company-industry">
                              <SelectValue placeholder="Выберите индустрию" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tech">IT / Технологии</SelectItem>
                              <SelectItem value="fintech">Финтех</SelectItem>
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="healthcare">Медицина</SelectItem>
                              <SelectItem value="education">Образование</SelectItem>
                              <SelectItem value="other">Другое</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Размер компании</Label>
                          <Select value={newCompany.size} onValueChange={(v) => setNewCompany({ ...newCompany, size: v })}>
                            <SelectTrigger data-testid="select-company-size">
                              <SelectValue placeholder="Выберите размер" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 сотрудников</SelectItem>
                              <SelectItem value="11-50">11-50 сотрудников</SelectItem>
                              <SelectItem value="51-200">51-200 сотрудников</SelectItem>
                              <SelectItem value="201-500">201-500 сотрудников</SelectItem>
                              <SelectItem value="500+">500+ сотрудников</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Описание</Label>
                          <Textarea
                            value={newCompany.description}
                            onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                            placeholder="Краткое описание компании"
                            rows={3}
                            data-testid="textarea-company-description"
                          />
                        </div>
                        <Button 
                          className="w-full bg-[#2D2D2D] hover:bg-[#3D3D3D]"
                          onClick={() => {
                            if (!newCompany.name.trim() || !newCompany.email.trim()) {
                              toast({ title: "Заполните обязательные поля", variant: "destructive" });
                              return;
                            }
                            createCompanyMutation.mutate(newCompany);
                          }}
                          disabled={createCompanyMutation.isPending}
                          data-testid="button-create-company"
                        >
                          {createCompanyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Создать компанию
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
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Компания</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Индустрия</TableHead>
                      <TableHead>Размер</TableHead>
                      <TableHead>Задачи</TableHead>
                      <TableHead>Батлы</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies?.map((company) => (
                      <TableRow 
                        key={company.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCompany(company)}
                        data-testid={`row-company-${company.id}`}
                      >
                        <TableCell className="text-muted-foreground">{company.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{company.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>{company.industry || "—"}</TableCell>
                        <TableCell>{company.size || "—"}</TableCell>
                        <TableCell>{company.tasksCreated}</TableCell>
                        <TableCell>{company.battlesCreated}</TableCell>
                        <TableCell>
                          <Badge variant={company.isActive ? "default" : "secondary"}>
                            {company.isActive ? "Активна" : "Неактивна"}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateCompanyMutation.mutate({ id: company.id, data: { isActive: !company.isActive } })}
                              data-testid={`button-toggle-company-${company.id}`}
                            >
                              {company.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCompanyMutation.mutate(company.id)}
                              data-testid={`button-delete-company-${company.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!companies || companies.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          Нет компаний
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            </TabsContent>

            {/* Кабинет ментора Tab */}
            <TabsContent value="mentor" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1D1D1F]">Кабинет ментора</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Задачи от премиум подписчиков, требующие проверки от ментора
                    </p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Задачи на проверку</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Здесь будут отображаться задачи от премиум подписчиков</p>
                      <p className="text-sm mt-2">Функционал в разработке</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Company Detail Dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Информация о компании</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                  <p className="text-muted-foreground">{selectedCompany.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">ID компании</Label>
                  <p className="font-medium">{selectedCompany.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Slug</Label>
                  <p className="font-medium font-mono text-sm">{selectedCompany.slug}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Индустрия</Label>
                  <p className="font-medium">{selectedCompany.industry || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Размер</Label>
                  <p className="font-medium">{selectedCompany.size || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Задачи создано</Label>
                  <p className="font-medium">{selectedCompany.tasksCreated}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Батлы создано</Label>
                  <p className="font-medium">{selectedCompany.battlesCreated}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Веб-сайт</Label>
                  <p className="font-medium">{selectedCompany.website || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Дата создания</Label>
                  <p className="font-medium">
                    {selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString("ru-RU") : "—"}
                  </p>
                </div>
              </div>
              {selectedCompany.description && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground text-xs">Описание</Label>
                  <p className="text-sm mt-1">{selectedCompany.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Информация о пользователе</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profileImageUrl || ""} />
                  <AvatarFallback className="text-xl">
                    {(selectedUser.firstName?.[0] || selectedUser.email?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {[selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(" ") || "Без имени"}
                  </h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">ID пользователя</Label>
                  <p className="font-medium">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Дата регистрации</Label>
                  <p className="font-medium">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("ru-RU") : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Статус</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.isAdmin ? (
                      <Badge className="bg-[#FF6030]">Администратор</Badge>
                    ) : (
                      <Badge variant="secondary">Пользователь</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Информация о задаче</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getTaskLevelBadge(selectedTask.level)}
                  <Badge variant="secondary">{selectedTask.category}</Badge>
                  <Badge variant={selectedTask.status === "published" ? "default" : "outline"}>
                    {selectedTask.status === "published" ? "Опубликовано" : selectedTask.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">ID задачи</Label>
                  <p className="font-medium">{selectedTask.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Slug</Label>
                  <p className="font-medium font-mono text-sm">{selectedTask.slug}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Количество решений</Label>
                  <p className="font-medium">{selectedTask.solutionsCount || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Дата создания</Label>
                  <p className="font-medium">
                    {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString("ru-RU") : "—"}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground text-xs">Описание</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedTask.description}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate(`/tasks/${selectedTask.slug}`);
                    setSelectedTask(null);
                  }}
                  data-testid="button-open-task"
                >
                  Открыть на сайте
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Battle Detail Dialog */}
      <Dialog open={!!selectedBattle} onOpenChange={(open) => !open && setSelectedBattle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Информация о батле</DialogTitle>
          </DialogHeader>
          {selectedBattle && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedBattle.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getBattleStatusBadge(selectedBattle.status)}
                  <Badge variant="secondary">{selectedBattle.category}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">ID батла</Label>
                  <p className="font-medium">{selectedBattle.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Slug</Label>
                  <p className="font-medium font-mono text-sm">{selectedBattle.slug}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Тема</Label>
                  <p className="font-medium">{selectedBattle.theme}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Дата начала</Label>
                  <p className="font-medium">
                    {selectedBattle.startDate ? new Date(selectedBattle.startDate).toLocaleDateString("ru-RU") : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Дата окончания</Label>
                  <p className="font-medium">
                    {selectedBattle.endDate ? new Date(selectedBattle.endDate).toLocaleDateString("ru-RU") : "—"}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground text-xs">Описание</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedBattle.description}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate(`/battles/${selectedBattle.slug}`);
                    setSelectedBattle(null);
                  }}
                  data-testid="button-open-battle"
                >
                  Открыть на сайте
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Question Detail Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Информация о вопросе</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Текст вопроса</Label>
                <p className="text-base mt-1">{selectedQuestion.question}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground text-xs">ID</Label>
                  <p className="font-medium">{selectedQuestion.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Специализация</Label>
                  <p className="font-medium">
                    {selectedQuestion.specialization === "product" ? "Продакт дизайн" :
                     selectedQuestion.specialization === "uxui" ? "UX/UI дизайн" :
                     selectedQuestion.specialization === "graphic" ? "Графический дизайн" : 
                     selectedQuestion.specialization}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Сложность</Label>
                  <Badge variant="outline">{selectedQuestion.difficulty || "—"}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Категория</Label>
                  <p className="font-medium">{selectedQuestion.category || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Порядок</Label>
                  <p className="font-medium">{selectedQuestion.order ?? "—"}</p>
                </div>
              </div>
              {selectedQuestion.options && Array.isArray(selectedQuestion.options) && selectedQuestion.options.length > 0 && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground text-xs mb-2 block">Варианты ответов</Label>
                  <div className="space-y-2">
                    {selectedQuestion.options.map((opt: any, idx: number) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg border ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.isCorrect && <Check className="h-4 w-4 text-green-600" />}
                          <span>{opt.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
