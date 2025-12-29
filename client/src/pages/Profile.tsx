import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { SiTelegram, SiBehance, SiDribbble } from "react-icons/si";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md mx-auto space-y-8"
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src="" />
              <AvatarFallback>ИП</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md">
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Иван Петров</h1>
            <p className="text-muted-foreground">Product Designer</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <SiTelegram className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <SiBehance className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <SiDribbble className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-6">
          <h2 className="font-semibold text-lg">Личная информация</h2>
          
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input defaultValue="Иван Петров" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="ivan@example.com" disabled />
              </div>
              <div className="space-y-2">
                <Label>О себе</Label>
                <Input defaultValue="Product Designer с 5-летним опытом" />
              </div>
              <div className="space-y-2">
                <Label>Компания</Label>
                <Input defaultValue="Яндекс" />
              </div>
              
              <Button className="w-full mt-4">Сохранить</Button>
            </CardContent>
          </Card>
          
          <h2 className="font-semibold text-lg">Статистика</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/30 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Решено задач</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Батлов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
