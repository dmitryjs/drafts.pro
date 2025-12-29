import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Bell, Globe, Shield, LogOut, User } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  return (
    <MainLayout title="Настройки" showCreateButton={false}>
      <div className="max-w-2xl space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Уведомления</h3>
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <Label className="font-medium block">Push-уведомления</Label>
                  <p className="text-xs text-muted-foreground">Новые задачи и батлы</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <Label className="font-medium block">Email-рассылка</Label>
                  <p className="text-xs text-muted-foreground">Еженедельный дайджест</p>
                </div>
              </div>
              <Switch />
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Аккаунт</h3>
          <Card className="p-2 space-y-1">
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" /> Редактировать профиль
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" /> Политика конфиденциальности
            </Button>
            <Separator className="my-2" />
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Выйти из аккаунта
            </Button>
          </Card>
        </div>
        
        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground">Drafts v1.0.0</p>
        </div>
      </div>
    </MainLayout>
  );
}
