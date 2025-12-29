import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { SiTelegram, SiBehance, SiDribbble } from "react-icons/si";
import MainLayout from "@/components/layout/MainLayout";

export default function Profile() {
  const rightPanel = (
    <div className="space-y-6">
      <div>
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
            <span className="font-medium">Middle</span>
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
