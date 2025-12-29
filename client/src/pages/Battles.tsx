import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Trophy, Calendar } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const mockBattles = [
  {
    id: 1,
    title: "Редизайн главной страницы",
    description: "Создайте новый дизайн главной страницы для онлайн-магазина электроники",
    category: "uxui",
    status: "active",
    participants: 32,
    deadline: "2024-01-15",
    prize: "50 000 ₽",
    slug: "homepage-redesign",
  },
  {
    id: 2,
    title: "Лого для fintech стартапа",
    description: "Разработайте логотип для нового финансового приложения",
    category: "graphic",
    status: "upcoming",
    participants: 0,
    deadline: "2024-01-20",
    prize: "30 000 ₽",
    slug: "fintech-logo",
  },
  {
    id: 3,
    title: "Мобильное приложение для доставки",
    description: "Дизайн мобильного приложения для сервиса доставки еды",
    category: "product",
    status: "completed",
    participants: 48,
    deadline: "2024-01-01",
    prize: "75 000 ₽",
    slug: "delivery-app",
  },
];

const statusLabels: Record<string, string> = {
  active: "Активный",
  upcoming: "Скоро",
  completed: "Завершён",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  upcoming: "bg-amber-100 text-amber-700",
  completed: "bg-gray-100 text-gray-600",
};

export default function Battles() {
  const [filter, setFilter] = useState("all");

  const filteredBattles = mockBattles.filter((battle) => {
    if (filter === "all") return true;
    return battle.status === filter;
  });

  const rightPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Статус</h3>
        <div className="space-y-2">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => setFilter("all")}
          >
            Все батлы
          </Button>
          <Button
            variant={filter === "active" ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => setFilter("active")}
          >
            Активные
          </Button>
          <Button
            variant={filter === "upcoming" ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => setFilter("upcoming")}
          >
            Предстоящие
          </Button>
          <Button
            variant={filter === "completed" ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => setFilter("completed")}
          >
            Завершённые
          </Button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-3">Ваши результаты</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Участий</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Побед</span>
            <span className="font-medium">0</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout rightPanel={rightPanel} title="Дизайн батлы" showCreateButton={false}>
      <div className="space-y-4">
        {filteredBattles.map((battle, index) => (
          <motion.div
            key={battle.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-5 hover-elevate cursor-pointer group" data-testid={`battle-card-${battle.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", statusColors[battle.status])}>
                      {statusLabels[battle.status]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {battle.category.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {battle.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {battle.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{battle.participants} участников</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(battle.deadline).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Trophy className="h-4 w-4" />
                    <span>{battle.prize}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </MainLayout>
  );
}
