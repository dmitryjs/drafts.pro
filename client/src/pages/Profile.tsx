import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Zap, Info, FileText, ChevronRight, Upload, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { SiTelegram, SiBehance, SiDribbble } from "react-icons/si";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MainLayout from "@/components/layout/MainLayout";
import { getLevelInfo, XP_REWARDS } from "@shared/xp";
import type { TaskDraft, Profile as ProfileType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [behanceLink, setBehanceLink] = useState("");
  const [dribbbleLink, setDribbbleLink] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState({
    fullName: "",
    bio: "",
    company: "",
    location: "",
    telegramLink: "",
    behanceLink: "",
    dribbbleLink: "",
    avatarUrl: null as string | null,
  });

  // Fetch profile data
  const { data: profileData } = useQuery<ProfileType>({
    queryKey: ["/api/profiles", user?.id],
    enabled: !!user?.id,
  });

  // Set initial values when profile loads
  useEffect(() => {
    if (profileData) {
      const values = {
        fullName: profileData.fullName || "",
        bio: profileData.bio || "",
        company: profileData.company || "",
        location: profileData.location || "",
        telegramLink: (profileData as any).telegramLink || "",
        behanceLink: (profileData as any).behanceLink || "",
        dribbbleLink: (profileData as any).dribbbleLink || "",
        avatarUrl: profileData.avatarUrl || null,
      };
      setFullName(values.fullName);
      setBio(values.bio);
      setCompany(values.company);
      setLocation(values.location);
      setTelegramLink(values.telegramLink);
      setBehanceLink(values.behanceLink);
      setDribbbleLink(values.dribbbleLink);
      setAvatarUrl(values.avatarUrl);
      setInitialValues(values);
    }
  }, [profileData]);

  const mockUserXp = 450;
  const levelInfo = getLevelInfo(mockUserXp);

  // Check if form has changes
  const hasChanges = 
    fullName !== initialValues.fullName ||
    bio !== initialValues.bio ||
    company !== initialValues.company ||
    location !== initialValues.location ||
    telegramLink !== initialValues.telegramLink ||
    behanceLink !== initialValues.behanceLink ||
    dribbbleLink !== initialValues.dribbbleLink;

  const saveProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileType>) => {
      if (!user?.id) throw new Error("Not authenticated");
      return apiRequest("PATCH", `/api/profiles/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", user?.id] });
      toast({ title: "Профиль сохранён!" });
      setInitialValues({
        fullName,
        bio,
        company,
        location,
        telegramLink,
        behanceLink,
        dribbbleLink,
        avatarUrl,
      });
    },
    onError: () => {
      toast({ title: "Ошибка при сохранении", variant: "destructive" });
    },
  });

  const saveAvatarMutation = useMutation({
    mutationFn: async (url: string | null) => {
      if (!user?.id) throw new Error("Not authenticated");
      return apiRequest("PATCH", `/api/profiles/${user.id}`, { avatarUrl: url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", user?.id] });
      toast({ title: "Аватарка сохранена!" });
    },
    onError: () => {
      toast({ title: "Ошибка при сохранении аватарки", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveProfileMutation.mutate({
      fullName: fullName || undefined,
      bio: bio || undefined,
      company: company || undefined,
      location: location || undefined,
      telegramUsername: telegramLink || undefined,
    });
  };

  const { data: drafts } = useQuery<TaskDraft[]>({
    queryKey: ["/api/drafts"],
  });

  const draftsCount = drafts?.length || 0;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 500KB for base64 storage)
      if (file.size > 500 * 1024) {
        toast({ title: "Файл слишком большой. Максимум 500KB", variant: "destructive" });
        return;
      }
      
      // Convert to base64 for persistent storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setAvatarUrl(base64Url);
        // Auto-save avatar as base64
        saveAvatarMutation.mutate(base64Url);
      };
      reader.onerror = () => {
        toast({ title: "Ошибка при чтении файла", variant: "destructive" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarUrl(null);
    saveAvatarMutation.mutate(null);
  };

  const hasSocialLinks = telegramLink || behanceLink || dribbbleLink;
  
  const rightPanel = (
    <div className="space-y-6">
      <div>
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
      </div>

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
        className="max-w-2xl space-y-8"
      >
        <Card className="relative">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
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
                    <button className="cursor-pointer" data-testid="button-avatar-menu">
                      <Avatar className="w-24 h-24 border-2 border-border/30">
                        <AvatarImage src={avatarUrl || ""} />
                        <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                          {fullName ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "ИП"}
                        </AvatarFallback>
                      </Avatar>
                      {saveAvatarMutation.isPending && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {avatarUrl ? (
                      <>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Заменить
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDeleteAvatar} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить аватарку
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{fullName || "Иван Петров"}</h1>
                <p className="text-muted-foreground">{bio || "Product Designer"}</p>
                {hasSocialLinks && (
                  <div className="flex gap-2 mt-3">
                    {telegramLink && (
                      <a href={telegramLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                          <SiTelegram className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {behanceLink && (
                      <a href={behanceLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                          <SiBehance className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {dribbbleLink && (
                      <a href={dribbbleLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                          <SiDribbble className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">Опыт и уровень</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" data-testid="button-xp-info">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
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
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6030] to-[#FF8F70] text-white">
                  <span className="text-2xl font-bold">{levelInfo.level}</span>
                  <span className="text-xs opacity-90">уровень</span>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-semibold text-lg">Уровень {levelInfo.level}</span>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-[#FF6030]" />
                        <span>{levelInfo.totalXp} XP</span>
                      </div>
                    </div>
                    {!levelInfo.isMaxLevel && levelInfo.nextLevel && (
                      <div className="text-right text-sm text-muted-foreground">
                        <span>До уровня {levelInfo.nextLevel.level}</span>
                        <p className="font-medium text-foreground">{levelInfo.xpToNextLevel - levelInfo.xpInCurrentLevel} XP</p>
                      </div>
                    )}
                  </div>
                  
                  <Progress 
                    value={levelInfo.progressPercent} 
                    className="h-2"
                  />
                  
                  {!levelInfo.isMaxLevel && levelInfo.nextLevel && (
                    <p className="text-xs text-muted-foreground">
                      Следующий уровень: {levelInfo.nextLevel.title}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Separator />
        
        <div className="space-y-6">
          <h2 className="font-semibold text-lg">Личная информация</h2>
          
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Иван Петров"
                    data-testid="input-fullname"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={user?.email || ""} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>О себе</Label>
                <Input 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Product Designer с 5-летним опытом"
                  data-testid="input-bio"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Компания</Label>
                  <Input 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Яндекс"
                    data-testid="input-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Город</Label>
                  <Input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Москва"
                    data-testid="input-location"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Социальные сети</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <SiTelegram className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://t.me/username" 
                      value={telegramLink}
                      onChange={(e) => setTelegramLink(e.target.value)}
                      data-testid="input-telegram-link"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <SiBehance className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://behance.net/username" 
                      value={behanceLink}
                      onChange={(e) => setBehanceLink(e.target.value)}
                      data-testid="input-behance-link"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <SiDribbble className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      placeholder="https://dribbble.com/username" 
                      value={dribbbleLink}
                      onChange={(e) => setDribbbleLink(e.target.value)}
                      data-testid="input-dribbble-link"
                    />
                  </div>
                </div>
              </div>
              
              {hasChanges && (
                <Button 
                  className="w-full mt-4 bg-[#FF6030] hover:bg-[#E55525]" 
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
                    "Сохранить изменения"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
}
