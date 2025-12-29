import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Calendar, CheckCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const mockMentors = [
  {
    id: 1,
    name: "Анна Иванова",
    title: "Lead Product Designer",
    company: "Яндекс",
    specialization: "product",
    rating: 4.9,
    reviews: 47,
    hourlyRate: 5000,
    isVerified: true,
    isAvailable: true,
    avatarUrl: "",
    slug: "anna-ivanova",
  },
  {
    id: 2,
    name: "Дмитрий Козлов",
    title: "Senior UX Designer",
    company: "Тинькофф",
    specialization: "uxui",
    rating: 4.8,
    reviews: 32,
    hourlyRate: 4000,
    isVerified: true,
    isAvailable: true,
    avatarUrl: "",
    slug: "dmitry-kozlov",
  },
  {
    id: 3,
    name: "Мария Петрова",
    title: "Art Director",
    company: "BBDO",
    specialization: "graphic",
    rating: 4.7,
    reviews: 28,
    hourlyRate: 6000,
    isVerified: true,
    isAvailable: false,
    avatarUrl: "",
    slug: "maria-petrova",
  },
  {
    id: 4,
    name: "Алексей Смирнов",
    title: "3D Artist",
    company: "Wargaming",
    specialization: "3d",
    rating: 4.9,
    reviews: 19,
    hourlyRate: 4500,
    isVerified: true,
    isAvailable: true,
    avatarUrl: "",
    slug: "alexey-smirnov",
  },
];

const specializations = [
  { id: "all", label: "Все" },
  { id: "product", label: "Продукт" },
  { id: "uxui", label: "UX/UI" },
  { id: "graphic", label: "Графический" },
  { id: "3d", label: "3D" },
];

export default function Mentors() {
  const [filter, setFilter] = useState("all");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredMentors = mockMentors.filter((mentor) => {
    if (filter !== "all" && mentor.specialization !== filter) return false;
    if (showAvailableOnly && !mentor.isAvailable) return false;
    return true;
  });

  const rightPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Специализация</h3>
        <div className="space-y-2">
          {specializations.map((spec) => (
            <Button
              key={spec.id}
              variant={filter === spec.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setFilter(spec.id)}
            >
              {spec.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-sm">Только доступные</span>
        </label>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-3">Ваши сессии</h3>
        <div className="text-sm text-muted-foreground">
          У вас пока нет запланированных сессий
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout rightPanel={rightPanel} title="Менторы" showCreateButton={false}>
      <div className="grid gap-4">
        {filteredMentors.map((mentor, index) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-5 hover-elevate cursor-pointer" data-testid={`mentor-card-${mentor.id}`}>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={mentor.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{mentor.name}</h3>
                    {mentor.isVerified && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {mentor.title} в {mentor.company}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{mentor.rating}</span>
                      <span className="text-sm text-muted-foreground">({mentor.reviews})</span>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {mentor.specialization.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-semibold">{mentor.hourlyRate.toLocaleString()} ₽</div>
                  <div className="text-xs text-muted-foreground">за час</div>
                  
                  <Button 
                    size="sm" 
                    className="mt-3"
                    disabled={!mentor.isAvailable}
                  >
                    {mentor.isAvailable ? "Записаться" : "Недоступен"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </MainLayout>
  );
}
