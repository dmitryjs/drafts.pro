import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Edit2, Zap, Info, FileText, ChevronRight } from "lucide-react";
import { SiTelegram, SiBehance, SiDribbble } from "react-icons/si";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/MainLayout";
import { getLevelInfo, XP_REWARDS } from "@shared/xp";
import type { TaskDraft } from "@shared/schema";

export default function Profile() {
  const [, navigate] = useLocation();
  const mockUserXp = 450;
  const levelInfo = getLevelInfo(mockUserXp);

  const { data: drafts } = useQuery<TaskDraft[]>({
    queryKey: ["/api/drafts"],
  });

  const draftsCount = drafts?.length || 0;
  
  const rightPanel = (
    <div className="space-y-6">
      {/* Drafts Section */}
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
            <span className="font-medium">{levelInfo.level} - {levelInfo.title}</span>
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
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">ИП</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md">
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Иван Петров</h1>
            <p className="text-muted-foreground">Product Designer</p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                <SiTelegram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                <SiBehance className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                <SiDribbble className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* XP & Level Section */}
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
                {/* Level Badge */}
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6030] to-[#FF8F70] text-white">
                  <span className="text-2xl font-bold">{levelInfo.level}</span>
                  <span className="text-xs opacity-90">уровень</span>
                </div>
                
                {/* Progress Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-semibold text-lg">{levelInfo.title}</span>
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
                  <Input defaultValue="Иван Петров" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="ivan@example.com" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>О себе</Label>
                <Input defaultValue="Product Designer с 5-летним опытом" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Компания</Label>
                  <Input defaultValue="Яндекс" />
                </div>
                <div className="space-y-2">
                  <Label>Город</Label>
                  <Input defaultValue="Москва" />
                </div>
              </div>
              
              <Button className="w-full mt-4">Сохранить изменения</Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
}
