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

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
}

const mockBattlesByPhase: Record<BattlePhase, any> = {
  waiting: {
    id: 1,
    title: "Космический кот #4532",
    description: "Соревнование между двумя дизайнерами. Создайте свою работу и покажите мастерство.",
    phase: "waiting" as BattlePhase,
    creator: {
      name: "Space cat #4532",
      avatar: "",
      image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&h=600&fit=crop",
      collection: "Space cats",
      owner: "Dizplazer",
      votes: 0,
    },
    opponent: null,
    timeRemaining: null,
    xpReward: 50,
  },
  moderation: {
    id: 2,
    title: "Пейзаж горы vs Технологии",
    description: "Природа против технологий. Два художника соревнуются за звание лучшего в этом батле.",
    phase: "moderation" as BattlePhase,
    creator: {
      name: "Mountain Landscape",
      avatar: "",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
      collection: "Nature",
      owner: "Artist123",
      votes: 0,
    },
    opponent: {
      name: "Tech Vision",
      avatar: "",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop",
      collection: "Tech Art",
      owner: "Designer456",
      votes: 0,
    },
    timeRemaining: null,
    xpReward: 50,
  },
  voting: {
    id: 3,
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
  },
  completed: {
    id: 4,
    title: "Абстракция #789 - Финал",
    description: "Финальный батл недели завершён. Поздравляем победителя!",
    phase: "completed" as BattlePhase,
    creator: {
      name: "Abstract Dreams",
      avatar: "",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=600&fit=crop",
      collection: "Abstract Art",
      owner: "Winner",
      votes: 1500000,
    },
    opponent: {
      name: "Color Explosion",
      avatar: "",
      image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop",
      collection: "Colors",
      owner: "RunnerUp",
      votes: 1200000,
    },
    timeRemaining: null,
    xpReward: 50,
  }
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

const slugToPhase: Record<string, BattlePhase> = {
  "space-cat-4532": "waiting",
  "mountain-landscape": "moderation", 
  "space-cat-vs-samurai": "voting",
  "abstraction-789": "completed",
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

  const phase = slugToPhase[slug] || "voting";
  const battle = mockBattlesByPhase[phase];
  const hasOpponent = !!battle.opponent?.image;
  const canVote = phase === "voting" && user;
  const isCompleted = phase === "completed";

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
  const currentPhaseIndex = phases.indexOf(phase);

  const creatorWon = isCompleted && battle.creator.votes > (battle.opponent?.votes || 0);
  const opponentWon = isCompleted && (battle.opponent?.votes || 0) > battle.creator.votes;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl"
        data-testid="battle-detail-page"
      >
        {/* Back Button */}
        <Link href="/battles">
          <Button variant="ghost" className="mb-4 gap-2" data-testid="button-back-to-battles">
            <ArrowLeft className="h-4 w-4" />
            Назад к батлам
          </Button>
        </Link>

        {/* Phase Progress */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2" data-testid="phase-progress">
          {phases.map((p, index) => {
            const isActive = p === phase;
            const isPassed = index < currentPhaseIndex;
            
            return (
              <Badge
                key={p}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1",
                  isActive
                    ? "bg-[#2D2D2D] text-white"
                    : isPassed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#E8E8EE] text-muted-foreground"
                )}
                data-testid={`phase-badge-${p}`}
              >
                {isPassed && <Check className="h-3 w-3" />}
                <span className="mr-1">{index + 1}</span>
                {phaseLabels[p]}
              </Badge>
            );
          })}
        </div>

        {/* Two Column Layout for Participants */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Creator Side */}
          <div data-testid="creator-section">
            <p className="text-xs text-muted-foreground mb-2">Создатель</p>
            <h2 className="text-xl font-bold text-[#1D1D1F] mb-3 flex items-center gap-2" data-testid="text-creator-name">
              {battle.creator.name}
              {creatorWon && (
                <Badge className="bg-amber-100 text-amber-700" data-testid="badge-winner-xp">+{battle.xpReward}XP</Badge>
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
                data-testid="img-creator-work"
              />
            </div>
          </div>
          
          {/* Opponent Side */}
          <div data-testid="opponent-section">
            <p className="text-xs text-muted-foreground mb-2">Оппонент</p>
            
            {hasOpponent ? (
              <>
                <h2 className="text-xl font-bold text-[#1D1D1F] mb-3 flex items-center gap-2" data-testid="text-opponent-name">
                  {battle.opponent.name}
                  {opponentWon && (
                    <Badge className="bg-amber-100 text-amber-700" data-testid="badge-winner-xp">+{battle.xpReward}XP</Badge>
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
                    data-testid="img-opponent-work"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-muted-foreground mb-3" data-testid="text-waiting-opponent">
                  Ожидаем оппонента
                </h2>
                
                <div className="flex items-center gap-4 mb-4 opacity-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#E8E8EE]" />
                    <div className="text-xs">
                      <p className="text-muted-foreground">Коллекция</p>
                      <p className="text-muted-foreground">—</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-muted">?</AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                      <p className="text-muted-foreground">Владелец</p>
                      <p className="text-muted-foreground">—</p>
                    </div>
                  </div>
                </div>
                
                <Card className="aspect-square bg-[#F9F9F9] border-2 border-dashed flex flex-col items-center justify-center relative">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" data-testid="img-join-preview" />
                      <Button 
                        className="absolute bottom-4 left-4 right-4 bg-[#FF6030] hover:bg-[#E55528] text-[#1D1D1F] font-medium rounded-xl"
                        onClick={handleJoinBattle}
                        data-testid="button-confirm-join"
                      >
                        Присоединиться к батлу
                      </Button>
                    </div>
                  ) : (
                    <>
                      <label className="flex flex-col items-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                          data-testid="input-join-image"
                        />
                        <Button variant="outline" className="rounded-xl mb-3" data-testid="button-select-join-file">
                          Выбрать файл
                        </Button>
                        <p className="text-sm text-muted-foreground text-center px-6">
                          Выберите свою работу для участия в батле
                        </p>
                      </label>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-start gap-2 p-3 bg-white rounded-lg shadow-sm">
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
          <h1 className="text-2xl font-bold text-[#1D1D1F] mb-4" data-testid="text-battle-title">{battle.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-battle-description">
            {battle.description}
          </p>
          <button className="text-sm text-blue-600 hover:underline mt-2" data-testid="button-show-more">
            Показать ещё
          </button>
        </div>

        {/* Moderation Notice */}
        {phase === "moderation" && (
          <Card className="p-6 mb-8 bg-amber-50 border-amber-200" data-testid="card-moderation-notice">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-800">На модерации</span>
            </div>
            <p className="text-sm text-amber-700">
              Ваш батл проходит проверку модераторами. Обычно это занимает от 1 до 24 часов. 
              После одобрения начнётся голосование.
            </p>
          </Card>
        )}

        {/* Voting Section */}
        {phase === "voting" && (
          <Card className="p-6 mb-8 bg-white border-0 shadow-sm" data-testid="card-voting-section">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-[#1D1D1F]">Голосование</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">Оставшееся время:</p>
            <p className="text-2xl font-bold text-[#1D1D1F] mb-6" data-testid="text-time-remaining">{battle.timeRemaining}</p>
            
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
                data-testid="button-vote-creator"
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
                  data-testid="button-vote-opponent"
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
                </button>
              )}
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl"
              onClick={handleVote}
              disabled={!selectedVote}
              data-testid="button-submit-vote"
            >
              Голосовать и получить <Badge className="ml-2 bg-white/20 text-white">5XP</Badge>
            </Button>
          </Card>
        )}

        {/* Completed Section - Winner Announcement */}
        {isCompleted && (
          <Card className="p-6 mb-8 bg-emerald-50 border-emerald-200" data-testid="card-winner-announcement">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-emerald-800">Батл завершён</span>
            </div>
            
            <div className="flex items-center gap-4">
              <img 
                src={creatorWon ? battle.creator.image : battle.opponent.image} 
                alt="Winner"
                className="w-16 h-16 rounded-xl object-cover border-4 border-emerald-300"
              />
              <div>
                <p className="text-sm text-emerald-700">Победитель:</p>
                <p className="text-xl font-bold text-emerald-800" data-testid="text-winner-name">
                  {creatorWon ? battle.creator.name : battle.opponent.name}
                </p>
                <p className="text-sm text-emerald-600">
                  {creatorWon ? battle.creator.owner : battle.opponent.owner} получил +{battle.xpReward}XP
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-emerald-200">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">{battle.creator.name}</span>
                <span className="font-medium text-emerald-800" data-testid="text-creator-votes">{battle.creator.votes.toLocaleString()} голосов</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-emerald-700">{battle.opponent.name}</span>
                <span className="font-medium text-emerald-800" data-testid="text-opponent-votes">{battle.opponent.votes.toLocaleString()} голосов</span>
              </div>
            </div>
          </Card>
        )}

        {/* Comments Section */}
        <Card className="p-6 bg-white border-0 shadow-sm" data-testid="card-comments">
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
            disabled={phase === "waiting" || phase === "moderation"}
            data-testid="input-comment"
          />
          
          {(phase === "waiting" || phase === "moderation") && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4" data-testid="text-comments-disabled">
              <Info className="h-4 w-4" />
              Комментарии будут доступны после прохождения модерации
            </p>
          )}
          
          {(phase === "voting" || phase === "completed") && (
            <Button 
              className="mb-4 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl"
              disabled={!commentText.trim()}
              data-testid="button-submit-comment"
            >
              Отправить
            </Button>
          )}
          
          {/* Comments List */}
          {(phase === "voting" || phase === "completed") && (
            <div className="space-y-4" data-testid="comments-list">
              {mockComments.map((comment) => (
                <div key={comment.id} className="border-t pt-4" data-testid={`comment-${comment.id}`}>
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
                        <button 
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[#1D1D1F]"
                          data-testid={`button-like-${comment.id}`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {comment.likes}
                        </button>
                        <button 
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[#1D1D1F]"
                          data-testid={`button-dislike-${comment.id}`}
                        >
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
