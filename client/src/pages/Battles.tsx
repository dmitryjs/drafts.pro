import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Clock, 
  Users, 
  Plus,
  Swords
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import CreateBattleModal from "@/components/modals/CreateBattleModal";
import AuthRequiredModal from "@/components/modals/AuthRequiredModal";

type BattleStatus = "waiting" | "moderation" | "voting" | "completed";

interface Battle {
  id: number;
  title: string;
  description: string;
  status: BattleStatus;
  creatorName: string;
  creatorAvatar?: string;
  creatorImage?: string;
  opponentName?: string;
  opponentAvatar?: string;
  opponentImage?: string;
  timeRemaining?: string;
  votesCount?: number;
  votersAvatars?: string[];
  slug: string;
  xpReward: number;
}

const mockBattles: Battle[] = [
  {
    id: 1,
    title: "Космический кот #4532",
    description: "Соревнование между двумя работами",
    status: "waiting",
    creatorName: "Dizplazer",
    creatorImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=400&fit=crop",
    slug: "space-cat-4532",
    xpReward: 50,
  },
  {
    id: 2,
    title: "Космический кот vs Самурай",
    description: "Два художника соревнуются за звание лучшего",
    status: "voting",
    creatorName: "Dizplazer",
    creatorImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=400&fit=crop",
    opponentName: "Dmitry Galkin",
    opponentImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    timeRemaining: "6д 19ч 37м",
    votesCount: 26,
    votersAvatars: ["", "", "", ""],
    slug: "space-cat-vs-samurai",
    xpReward: 50,
  },
  {
    id: 3,
    title: "Пейзаж горы",
    description: "Природа против технологий",
    status: "moderation",
    creatorName: "Artist123",
    creatorImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    opponentName: "Designer456",
    opponentImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop",
    slug: "mountain-landscape",
    xpReward: 50,
  },
  {
    id: 4,
    title: "Абстракция #789",
    description: "Финальный батл недели",
    status: "completed",
    creatorName: "Winner",
    creatorImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop",
    opponentName: "RunnerUp",
    opponentImage: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop",
    slug: "abstraction-789",
    xpReward: 50,
  },
];

const tabs = [
  { id: "active", label: "Активные" },
  { id: "voting", label: "Голосование" },
  { id: "waiting", label: "Ожидают оппонента" },
  { id: "recent", label: "Недавние батлы" },
  { id: "my", label: "Мои батлы" },
];

const getStatusLabel = (status: BattleStatus) => {
  switch (status) {
    case "waiting": return "Ожидает оппонента";
    case "moderation": return "На модерации";
    case "voting": return "Голосование";
    case "completed": return "Завершён";
    default: return status;
  }
};

const getStatusColor = (status: BattleStatus) => {
  switch (status) {
    case "waiting": return "bg-[#E8E8EE] text-[#1D1D1F]";
    case "moderation": return "bg-amber-100 text-amber-700";
    case "voting": return "bg-emerald-100 text-emerald-700";
    case "completed": return "bg-gray-100 text-gray-600";
    default: return "bg-gray-100 text-gray-600";
  }
};

export default function Battles() {
  const [activeTab, setActiveTab] = useState("active");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const filteredBattles = mockBattles.filter((battle) => {
    if (activeTab === "active") return battle.status !== "completed";
    if (activeTab === "voting") return battle.status === "voting";
    if (activeTab === "waiting") return battle.status === "waiting";
    if (activeTab === "recent") return battle.status === "completed";
    if (activeTab === "my") return false;
    return true;
  });

  const handleCreateBattle = () => {
    if (user) {
      setIsCreateModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleJoinBattle = (battleId: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }
  };

  const isEmpty = filteredBattles.length === 0;

  return (
    <MainLayout 
      onCreateBattle={handleCreateBattle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Батлы</h1>
        
        <Button 
          className="gap-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl"
          onClick={handleCreateBattle}
          data-testid="button-new-battle"
        >
          Новый батл
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === tab.id
                ? "text-[#1D1D1F]"
                : "text-muted-foreground hover:text-[#1D1D1F]"
            )}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#1D1D1F]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Swords className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-6">
            Пока нет батлов в этой категории.<br />
            Создайте первый и сразитесь с другими дизайнерами!
          </p>
          <Button 
            className="gap-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl"
            onClick={handleCreateBattle}
            data-testid="button-create-first-battle"
          >
            Создать новый батл
          </Button>
        </div>
      ) : (
        /* Battles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBattles.map((battle, index) => (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/battles/${battle.slug}`}>
                <Card 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white border-0 shadow-sm"
                  data-testid={`battle-card-${battle.id}`}
                >
                  {/* Battle Images */}
                  <div className="relative aspect-[16/10] flex">
                    {/* Creator Image */}
                    <div className="flex-1 relative overflow-hidden">
                      {battle.creatorImage ? (
                        <img 
                          src={battle.creatorImage} 
                          alt={battle.creatorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2D2D2D] flex items-center justify-center">
                          <Swords className="h-12 w-12 text-white/30" />
                        </div>
                      )}
                    </div>
                    
                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-12 h-12 rounded-full bg-[#2D2D2D] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        VS
                      </div>
                    </div>
                    
                    {/* Opponent Image or Join Button */}
                    <div className="flex-1 relative overflow-hidden">
                      {battle.opponentImage ? (
                        <img 
                          src={battle.opponentImage} 
                          alt={battle.opponentName || ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F4F4F5] flex items-center justify-center">
                          <Button 
                            className="bg-[#FF6030] hover:bg-[#E55528] text-[#1D1D1F] font-medium rounded-full px-6"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleJoinBattle(battle.id);
                            }}
                            data-testid={`button-join-${battle.id}`}
                          >
                            Присоединиться
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Battle Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-[#1D1D1F]">{battle.creatorName}</span>
                      {battle.opponentName && (
                        <>
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-semibold text-[#1D1D1F]">{battle.opponentName}</span>
                        </>
                      )}
                      {!battle.opponentName && (
                        <span className="text-muted-foreground">vs ...</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {battle.status === "waiting" && (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Ожидает оппонента</span>
                        </>
                      )}
                      
                      {battle.status === "moderation" && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          На модерации
                        </Badge>
                      )}
                      
                      {battle.status === "voting" && battle.timeRemaining && (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>{battle.timeRemaining}</span>
                        </>
                      )}
                      
                      {battle.status === "completed" && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          Завершён
                        </Badge>
                      )}
                    </div>
                    
                    {/* Voting info */}
                    {battle.status === "voting" && battle.votesCount && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-white">
                              <AvatarFallback className="text-xs bg-muted">
                                {i}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {battle.votesCount} человек голосуют
                        </span>
                      </div>
                    )}
                    
                    {/* Moderation notice */}
                    {battle.status === "waiting" && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-sm text-muted-foreground">
                          Голосование начнётся после модерации
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Battle Modal */}
      <CreateBattleModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        message="Авторизуйтесь чтобы создавать батлы"
      />
    </MainLayout>
  );
}
