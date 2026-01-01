import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Upload,
  Check,
  Clock,
  Info
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type BattlePhase = "waiting" | "moderation" | "voting" | "completed";

interface Participant {
  name: string;
  avatar?: string;
  image?: string;
  votes?: number;
  xpReward?: number;
}

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
}

const mockBattle = {
  id: 1,
  title: "Название батла крупным текстом",
  description: "Game kinda complicated at first but then you learn everything gets easier. It's not a game that needs to be played all day, so I think it's worth playing even more for the low investment. The only problem currently is the network rates, which are high, but I believe there will be a solution soon.",
  phase: "voting" as BattlePhase,
  creator: {
    name: "Space cat #4532",
    avatar: "",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&h=600&fit=crop",
    collection: "Space cats",
    owner: "Dizplazer",
    votes: 999999,
  },
  opponent: {
    name: "Samurai's Silent Vigil",
    avatar: "",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    collection: "7Heaven",
    owner: "Dmitry Galkin",
    votes: 900999,
  },
  timeRemaining: "6 дней 17 часов 32 минуты",
  xpReward: 50,
};

const mockComments: Comment[] = [
  {
    id: 1,
    author: "user123",
    content: "Мне очень нравится эта работа. Думаю, она заслуживает победы за потрясающую графику и анимацию.",
    createdAt: "3 часа назад",
    likes: 10,
    dislikes: 3,
  },
  {
    id: 2,
    author: "designer456",
    content: "Game kinda complicated at first but then you learn everything gets easier. It's not a game that needs to be played all day, so I think it's worth playing even more for the low!",
    createdAt: "4 часа назад",
    likes: 10,
    dislikes: 3,
  },
];

const phaseLabels = {
  waiting: "Ожидание оппонента",
  moderation: "Модерация",
  voting: "Голосование",
  completed: "Объявление победителя",
};

export default function BattleDetail() {
  const [, params] = useRoute("/battles/:slug");
  const slug = params?.slug || "";
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedVote, setSelectedVote] = useState<"creator" | "opponent" | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const battle = mockBattle;
  const hasOpponent = !!battle.opponent?.image;
  const canVote = battle.phase === "voting" && user;
  const isCompleted = battle.phase === "completed";

  const handleVote = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!selectedVote) return;
  };

  const handleJoinBattle = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const phases: BattlePhase[] = ["waiting", "moderation", "voting", "completed"];
  const currentPhaseIndex = phases.indexOf(battle.phase);

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl"
      >
        {/* Phase Progress */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {phases.map((phase, index) => {
            const isActive = phase === battle.phase;
            const isCompleted = index < currentPhaseIndex;
            
            return (
              <Badge
                key={phase}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap",
                  isActive
                    ? "bg-[#2D2D2D] text-white"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#E8E8EE] text-muted-foreground"
                )}
              >
                {isCompleted && <Check className="h-3 w-3 mr-1" />}
                <span className="mr-1">{index + 1}</span>
                {phaseLabels[phase]}
              </Badge>
            );
          })}
        </div>

        {/* Two Column Layout for Participants */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Creator Side */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Соперник</p>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-3 flex items-center gap-2">
              {battle.creator.name}
              {isCompleted && battle.creator.votes > (battle.opponent?.votes || 0) && (
                <Badge className="bg-amber-100 text-amber-700">+{battle.xpReward}XP</Badge>
              )}
            </h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#E8E8EE]" />
                <div className="text-xs">
                  <p className="text-muted-foreground">Коллекция</p>
                  <p className="font-medium text-[#1D1D1F]">{battle.creator.collection}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{battle.creator.owner.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <p className="text-muted-foreground">Владелец</p>
                  <p className="font-medium text-[#1D1D1F]">{battle.creator.owner}</p>
                </div>
              </div>
            </div>
            
            <div className="aspect-square rounded-xl overflow-hidden bg-[#2D2D2D]">
              <img 
                src={battle.creator.image} 
                alt={battle.creator.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Opponent Side */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Вы</p>
            
            {hasOpponent ? (
              <>
                <h2 className="text-xl font-bold text-[#1D1D1F] mb-3 flex items-center gap-2">
                  {battle.opponent.name}
                  {isCompleted && (battle.opponent?.votes || 0) > battle.creator.votes && (
                    <Badge className="bg-amber-100 text-amber-700">+{battle.xpReward}XP</Badge>
                  )}
                </h2>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-emerald-100" />
                    <div className="text-xs">
                      <p className="text-muted-foreground">Коллекция</p>
                      <p className="font-medium text-[#1D1D1F]">{battle.opponent.collection}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-pink-200">{battle.opponent.owner?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                      <p className="text-muted-foreground">Владелец</p>
                      <p className="font-medium text-[#1D1D1F]">{battle.opponent.owner}</p>
                    </div>
                  </div>
                </div>
                
                <div className="aspect-square rounded-xl overflow-hidden bg-[#2D2D2D]">
                  <img 
                    src={battle.opponent.image} 
                    alt={battle.opponent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-muted-foreground mb-3">Название работы</h2>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#E8E8EE]" />
                    <div className="text-xs">
                      <p className="text-muted-foreground">Коллекция</p>
                      <p className="text-muted-foreground">Collection name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-pink-100">?</AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                      <p className="text-muted-foreground">Владелец</p>
                      <p className="text-muted-foreground">Owner name</p>
                    </div>
                  </div>
                </div>
                
                <Card className="aspect-square bg-[#F9F9F9] border-2 border-dashed flex flex-col items-center justify-center">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ) : (
                    <>
                      <label className="flex flex-col items-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                        <Button variant="outline" className="rounded-xl mb-3">
                          Выбрать файл
                        </Button>
                        <p className="text-sm text-muted-foreground text-center px-6">
                          Выберите свою работу для участия в батле
                        </p>
                      </label>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium text-[#1D1D1F]">Важно!</span>
                            <br />
                            Можно использовать только работы, созданные вами.
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Battle Title and Description */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1D1D1F] mb-4">{battle.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {battle.description}
          </p>
          <button className="text-sm text-blue-600 hover:underline mt-2">
            Показать ещё
          </button>
        </div>

        {/* Voting Section */}
        {battle.phase === "voting" && (
          <Card className="p-6 mb-8 bg-white border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-[#1D1D1F]">Голосование</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">Оставшееся время:</p>
            <p className="text-2xl font-bold text-[#1D1D1F] mb-6">{battle.timeRemaining}</p>
            
            {/* Vote Options */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedVote("creator")}
                className={cn(
                  "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-colors",
                  selectedVote === "creator" 
                    ? "border-[#2D2D2D] bg-[#F9F9F9]" 
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <img 
                  src={battle.creator.image} 
                  alt={battle.creator.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#1D1D1F]">{battle.creator.name}</p>
                  <p className="text-sm text-muted-foreground">{battle.creator.owner}</p>
                </div>
                {selectedVote === "creator" && (
                  <Check className="h-5 w-5 text-[#1D1D1F]" />
                )}
                {isCompleted && (
                  <div className="text-right">
                    <p className="font-bold text-[#1D1D1F]">{battle.creator.votes?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Voted</p>
                  </div>
                )}
              </button>
              
              {hasOpponent && (
                <button
                  onClick={() => setSelectedVote("opponent")}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-colors",
                    selectedVote === "opponent" 
                      ? "border-[#2D2D2D] bg-[#F9F9F9]" 
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <img 
                    src={battle.opponent.image} 
                    alt={battle.opponent.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-[#1D1D1F]">{battle.opponent.name}</p>
                    <p className="text-sm text-muted-foreground">{battle.opponent.owner}</p>
                  </div>
                  {selectedVote === "opponent" && (
                    <Check className="h-5 w-5 text-[#1D1D1F]" />
                  )}
                  {isCompleted && (
                    <div className="text-right">
                      <p className="font-bold text-[#1D1D1F]">{battle.opponent.votes?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Voted</p>
                    </div>
                  )}
                </button>
              )}
            </div>
            
            {!isCompleted && (
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl"
                onClick={handleVote}
                disabled={!selectedVote}
              >
                Голосовать и получить <Badge className="ml-2 bg-white/20 text-white">5XP</Badge>
              </Button>
            )}
          </Card>
        )}

        {/* Comments Section */}
        <Card className="p-6 bg-white border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-[#1D1D1F]">Комментарии</span>
          </div>
          
          {/* Comment Input */}
          <Textarea
            placeholder="Что вы думаете об этом батле?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="mb-4 rounded-xl resize-none"
            disabled={battle.phase === "waiting" || battle.phase === "moderation"}
          />
          
          {(battle.phase === "waiting" || battle.phase === "moderation") && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
              <Info className="h-4 w-4" />
              Комментарии будут доступны после прохождения модерации
            </p>
          )}
          
          {/* Comments List */}
          {battle.phase !== "waiting" && battle.phase !== "moderation" && (
            <div className="space-y-4">
              {mockComments.map((comment) => (
                <div key={comment.id} className="border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-[#1D1D1F]">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                      </div>
                      <p className="text-sm text-[#1D1D1F]">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[#1D1D1F]">
                          <ThumbsUp className="h-4 w-4" />
                          {comment.likes}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[#1D1D1F]">
                          <ThumbsDown className="h-4 w-4" />
                          {comment.dislikes}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </MainLayout>
  );
}
