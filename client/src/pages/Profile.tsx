import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Info, FileText, ChevronRight, Upload, Trash2, RefreshCw, Loader2, Pencil, Building2, MapPin, GraduationCap } from "lucide-react";
import { SiTelegram, SiBehance, SiDribbble } from "react-icons/si";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/components/layout/MainLayout";
import UserAvatar from "@/components/UserAvatar";
import { getLevelInfo, XP_REWARDS } from "@shared/xp";
import type { TaskDraft, Profile as ProfileType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const COUNTRIES = [
  { code: "RU", name: "Россия", flag: "🇷🇺" },
  { code: "BY", name: "Беларусь", flag: "🇧🇾" },
  { code: "UA", name: "Украина", flag: "🇺🇦" },
  { code: "KZ", name: "Казахстан", flag: "🇰🇿" },
  { code: "UZ", name: "Узбекистан", flag: "🇺🇿" },
  { code: "GE", name: "Грузия", flag: "🇬🇪" },
  { code: "AM", name: "Армения", flag: "🇦🇲" },
  { code: "AZ", name: "Азербайджан", flag: "🇦🇿" },
  { code: "RS", name: "Сербия", flag: "🇷🇸" },
  { code: "ME", name: "Черногория", flag: "🇲🇪" },
  { code: "TR", name: "Турция", flag: "🇹🇷" },
  { code: "AE", name: "ОАЭ", flag: "🇦🇪" },
  { code: "TH", name: "Таиланд", flag: "🇹🇭" },
  { code: "ID", name: "Индонезия", flag: "🇮🇩" },
  { code: "US", name: "США", flag: "🇺🇸" },
  { code: "DE", name: "Германия", flag: "🇩🇪" },
  { code: "NL", name: "Нидерланды", flag: "🇳🇱" },
  { code: "PT", name: "Португалия", flag: "🇵🇹" },
  { code: "ES", name: "Испания", flag: "🇪🇸" },
  { code: "CY", name: "Кипр", flag: "🇨🇾" },
];

const GRADES = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const avatarColors = [
  "#34C759", "#FF6030", "#007AFF", "#AF52DE", "#FF9500",
  "#5856D6", "#FF2D55", "#00C7BE", "#32ADE6", "#FF3B30",
];

function getColorFromName(name?: string | null): string {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getCountryFlag(countryCode?: string | null): string {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.flag || "";
}

function getCountryName(countryCode?: string | null): string {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.name || "";
}

function getGradeLabel(gradeValue?: string | null): string {
  const grade = GRADES.find(g => g.value === gradeValue);
  return grade?.label || "";
}

export default function Profile() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editTelegram, setEditTelegram] = useState("");
  const [editBehance, setEditBehance] = useState("");
  const [editDribbble, setEditDribbble] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");

  const { data: profileData } = useQuery<ProfileType>({
    queryKey: ["/api/profiles", user?.id],
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profileData) {
      setEditFullName(profileData.fullName || "");
      setEditBio(profileData.bio || "");
      setEditCompany(profileData.company || "");
      setEditCountry((profileData as any).country || "");
      setEditCity((profileData as any).city || "");
      setEditGrade((profileData as any).grade || "");
      setEditTelegram(profileData.telegramUsername || "");
      setEditBehance((profileData as any).behanceUrl || "");
      setEditDribbble((profileData as any).dribbbleUrl || "");
      setAvatarUrl(profileData.avatarUrl || null);
    }
  }, [profileData]);

  const mockUserXp = 450;
  const levelInfo = getLevelInfo(mockUserXp);

  const saveProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileType>) => {
      if (!profileData?.id) throw new Error("Profile not loaded");
      return apiRequest("PATCH", `/api/profiles/${profileData.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", user?.id] });
      toast({ title: "Профиль сохранён!" });
      setIsEditModalOpen(false);
    },
    onError: () => {
      toast({ title: "Ошибка при сохранении", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveProfileMutation.mutate({
      fullName: editFullName || undefined,
      bio: editBio || undefined,
      company: editCompany || undefined,
      country: editCountry || undefined,
      city: editCity || undefined,
      grade: editGrade || undefined,
      telegramUsername: editTelegram || undefined,
      behanceUrl: editBehance || undefined,
      dribbbleUrl: editDribbble || undefined,
      avatarUrl: avatarUrl,
    } as any);
  };

  const { data: drafts } = useQuery<TaskDraft[]>({
    queryKey: ["/api/drafts"],
  });

  const draftsCount = drafts?.length || 0;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast({ title: "Файл слишком большой. Максимум 3MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUrl(reader.result as string);
      reader.onerror = () => toast({ title: "Ошибка при чтении файла", variant: "destructive" });
      reader.readAsDataURL(file);
    }
  };

  const displayName = editFullName || user?.firstName || "Ваше имя";
  const displayBio = editBio || "Ваша роль";
  const hasLocation = editCountry || editCity;
  const hasInfo = editCompany || editGrade || hasLocation;
  
  const rightPanel = (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold">Опыт и уровень</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" data-testid="button-xp-info">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-sm font-medium mb-2">Как заработать XP:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between gap-4">
                    <span>Победа в батле</span>
                    <span className="text-[#FF6030]">+{XP_REWARDS.BATTLE_WIN.xp} XP</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>2-е место в батле</span>
                    <span className="text-[#FF6030]">+{XP_REWARDS.BATTLE_SECOND.xp} XP</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Принятое решение</span>
                    <span className="text-[#FF6030]">+{XP_REWARDS.TASK_ACCEPTED.xp} XP</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Решение задачи</span>
                    <span className="text-[#FF6030]">+{XP_REWARDS.TASK_SOLUTION.xp} XP</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Ежедневный вход</span>
                    <span className="text-[#FF6030]">+{XP_REWARDS.DAILY_LOGIN.xp} XP</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF6030] to-[#FF8F70] text-white flex-shrink-0">
              <span className="text-xl font-bold">{levelInfo.level}</span>
              <span className="text-[10px] opacity-90">уровень</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-sm mb-2">
                <Zap className="h-4 w-4 text-[#FF6030]" />
                <span className="font-medium">{levelInfo.totalXp} XP</span>
              </div>
              <Progress value={levelInfo.progressPercent} className="h-2 mb-1" />
              {!levelInfo.isMaxLevel && levelInfo.nextLevel && (
                <p className="text-xs text-muted-foreground">
                  До уровня {levelInfo.nextLevel.level}: {levelInfo.xpToNextLevel - levelInfo.xpInCurrentLevel} XP
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <button
        onClick={() => navigate("/drafts")}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-[#F0F0F0] hover:bg-[#E5E5E5] transition-colors group"
        data-testid="button-go-to-drafts"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <p className="font-medium">Черновики</p>
            <p className="text-xs text-muted-foreground">
              {draftsCount > 0 ? `${draftsCount} ${draftsCount === 1 ? 'черновик' : draftsCount < 5 ? 'черновика' : 'черновиков'}` : 'Нет черновиков'}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-3">Статистика</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Решено задач</span>
            <span className="font-medium">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Батлов</span>
            <span className="font-medium">3</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Уровень</span>
            <span className="font-medium">Уровень {levelInfo.level}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-3">Достижения</h3>
        <p className="text-sm text-muted-foreground">Пока нет достижений</p>
      </div>
    </div>
  );

  return (
    <MainLayout rightPanel={rightPanel} title="Профиль" showCreateButton={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <Card className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 z-10"
                onClick={() => setIsEditModalOpen(true)}
                data-testid="button-edit-profile"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Редактировать профиль</TooltipContent>
          </Tooltip>
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  data-testid="input-avatar-file"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer relative group" data-testid="button-avatar-menu">
                      <Avatar className="w-20 h-20 border-2 border-border/30">
                        <AvatarImage src={avatarUrl || ""} />
                        <AvatarFallback 
                          className="text-2xl text-white font-medium"
                          style={{ backgroundColor: getColorFromName(displayName) }}
                        >
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Pencil className="h-5 w-5 text-white" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {avatarUrl ? (
                      <>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Заменить
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAvatarUrl(null)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
              <p className="text-muted-foreground">{displayBio}</p>
            </div>

            {hasInfo && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {hasLocation && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {editCountry && getCountryFlag(editCountry)} {getCountryName(editCountry)}
                      {editCity && `, ${editCity}`}
                    </span>
                  </div>
                )}
                {editGrade && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    <span>{getGradeLabel(editGrade)}</span>
                  </div>
                )}
                {editCompany && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>{editCompany}</span>
                  </div>
                )}
              </div>
            )}

            {(editTelegram || editBehance || editDribbble) && (
              <div className="mt-4 flex gap-2">
                {editTelegram && (
                  <a href={editTelegram.startsWith("http") ? editTelegram : `https://t.me/${editTelegram}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                      <SiTelegram className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {editBehance && (
                  <a href={editBehance.startsWith("http") ? editBehance : `https://behance.net/${editBehance}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                      <SiBehance className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {editDribbble && (
                  <a href={editDribbble.startsWith("http") ? editDribbble : `https://dribbble.com/${editDribbble}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                      <SiDribbble className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-12 p-1 bg-muted/50">
            <TabsTrigger value="tasks" className="text-sm font-medium" data-testid="tab-tasks">
              Задачи
            </TabsTrigger>
            <TabsTrigger value="battles" className="text-sm font-medium" data-testid="tab-battles">
              Батлы
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="mt-4">
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Вы ещё не решили ни одной задачи</p>
            </div>
          </TabsContent>
          <TabsContent value="battles" className="mt-4">
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Вы ещё не участвовали в батлах</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Имя</Label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Введите ваше имя"
                data-testid="input-edit-fullname"
              />
            </div>

            <div className="space-y-2">
              <Label>О себе / роль</Label>
              <Input
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Например: Product Designer"
                data-testid="input-edit-bio"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Страна</Label>
                <Select value={editCountry} onValueChange={setEditCountry}>
                  <SelectTrigger data-testid="select-country">
                    <SelectValue placeholder="Выберите страну" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Город</Label>
                <Input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Введите город"
                  data-testid="input-edit-city"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Грейд</Label>
                <Select value={editGrade} onValueChange={setEditGrade}>
                  <SelectTrigger data-testid="select-grade">
                    <SelectValue placeholder="Выберите грейд" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Компания</Label>
                <Input
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="Где работаете"
                  data-testid="input-edit-company"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <Label className="text-sm font-medium mb-3 block">Социальные сети</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <SiTelegram className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    placeholder="username или ссылка" 
                    value={editTelegram}
                    onChange={(e) => setEditTelegram(e.target.value)}
                    data-testid="input-edit-telegram"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <SiBehance className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    placeholder="username или ссылка" 
                    value={editBehance}
                    onChange={(e) => setEditBehance(e.target.value)}
                    data-testid="input-edit-behance"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <SiDribbble className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    placeholder="username или ссылка" 
                    value={editDribbble}
                    onChange={(e) => setEditDribbble(e.target.value)}
                    data-testid="input-edit-dribbble"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-[#FF6030] hover:bg-[#E5562B] text-white"
              onClick={handleSave}
              disabled={saveProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {saveProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              data-testid="button-cancel-edit"
            >
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
