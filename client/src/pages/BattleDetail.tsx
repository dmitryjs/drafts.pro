import { useState, useEffect, useRef } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  MessageCircle,
  Upload,
  Check,
  Clock,
  Info,
  Send,
  Loader2
} from "lucide-react";
import LikeIcon from "@assets/icons/Like.svg";
import DislikeIcon from "@assets/icons/Dislike.svg";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getProfileIdByAuthUid, getUserIdByAuthUid } from "@/lib/supabase-helpers";
import type { BattleComment, Profile } from "@shared/schema";

type BattlePhase = "waiting" | "moderation" | "voting" | "completed";

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote?: "like" | "dislike" | null;
}

const mockBattlesByPhase: Record<BattlePhase, any> = {
  waiting: {
    id: 1,
    title: "Космический кот #4532",
    description: "Соревнование между двумя дизайнерами. Создайте свою работу и покажите мастерство.",
    category: "UX/UI",
    phase: "waiting" as BattlePhase,
    creator: {
      name: "Space cat #4532",
      avatar: "",
      image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&h=600&fit=crop",
      collection: "Space cats",
      owner: "Dizplazer",
      profileId: 2,
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
    category: "Графический",
    phase: "moderation" as BattlePhase,
    creator: {
      name: "Mountain Landscape",
      avatar: "",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
      collection: "Nature",
      owner: "Artist123",
      profileId: 3,
      votes: 0,
    },
    opponent: {
      name: "Tech Vision",
      avatar: "",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop",
      collection: "Tech Art",
      owner: "Designer456",
      profileId: 4,
      votes: 0,
    },
    timeRemaining: null,
    xpReward: 50,
  },
  voting: {
    id: 3,
    title: "Название батла крупным текстом",
    description: "Game kinda complicated at first but then you learn everything gets easier. It's not a game that needs to be played all day, so I think it's worth playing even more for the low investment. The only problem currently is the network rates, which are high, but I believe there will be a solution soon.",
    category: "Продукт",
    phase: "voting" as BattlePhase,
    creator: {
      name: "Space cat #4532",
      avatar: "",
      image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&h=600&fit=crop",
      collection: "Space cats",
      owner: "Dizplazer",
      profileId: 2,
      votes: 999999,
    },
    opponent: {
      name: "Samurai's Silent Vigil",
      avatar: "",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
      collection: "7Heaven",
      owner: "Dmitry Galkin",
      profileId: 1,
      votes: 900999,
    },
    timeRemaining: "23 часа 45 минут",
    xpReward: 50,
  },
  completed: {
    id: 4,
    title: "Абстракция #789 - Финал",
    description: "Финальный батл недели завершён. Поздравляем победителя!",
    category: "3D",
    phase: "completed" as BattlePhase,
    creator: {
      name: "Abstract Dreams",
      avatar: "",
      image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=600&fit=crop",
      collection: "Abstract Art",
      owner: "Winner",
      profileId: 5,
      votes: 1500000,
    },
    opponent: {
      name: "Color Explosion",
      avatar: "",
      image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=600&fit=crop",
      collection: "Colors",
      owner: "RunnerUp",
      profileId: 6,
      votes: 1200000,
    },
    timeRemaining: null,
    xpReward: 50,
  }
};

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Get user profile for display name
  const { data: profile } = useQuery<Profile>({
    queryKey: ['/api/profiles', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const response = await fetch(`/api/profiles/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });
  const [selectedVote, setSelectedVote] = useState<"creator" | "opponent" | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localCommentVotes, setLocalCommentVotes] = useState<Record<number, "like" | "dislike" | null>>({});
  const [timeRemaining, setTimeRemaining] = useState<string>("24 часа 00 минут");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live countdown timer - calculates from mock start time (simulating 24h countdown)
  useEffect(() => {
    // For demo purposes, simulate a countdown that started recently
    // In production, this would use the real battle.votingEndDate from the API
    const startTime = Date.now();
    const endTime = startTime + 24 * 60 * 60 * 1000; // 24 hours from now
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = endTime - now;
      
      if (remaining <= 0) {
        setTimeRemaining("Голосование завершено");
        return;
      }
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours} ч ${minutes} мин ${seconds} сек`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const phase = slugToPhase[slug] || "voting";
  const battle = mockBattlesByPhase[phase];
  const hasOpponent = !!battle.opponent?.image;
  const canVote = phase === "voting" && user;
  const isCompleted = phase === "completed";

  // Mock battle ID for now (in real app, would get from battle data)
  const battleId = battle?.id || 1;

  // Fetch comments from Supabase
  const { data: apiComments = [] } = useQuery<BattleComment[]>({
    queryKey: ["battle-comments", battleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("battle_comments")
        .select("*")
        .eq("battle_id", battleId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row) => ({
        ...row,
        battleId: row.battle_id,
        profileId: row.profile_id,
        createdAt: row.created_at,
      }));
    },
  });

  // Check if user has already voted
  const { data: voteStatus } = useQuery<{ hasVoted: boolean }>({
    queryKey: ["battle-vote-status", battleId, user?.id],
    queryFn: async () => {
      if (!user?.id) return { hasVoted: false };

      const userId = await getUserIdByAuthUid(user.id, user.email);
      if (!userId) return { hasVoted: false };

      const { data, error } = await supabase
        .from("battle_votes")
        .select("id")
        .eq("battle_id", battleId)
        .eq("voter_id", userId)
        .maybeSingle();

      if (error) throw error;

      return { hasVoted: !!data };
    },
    enabled: !!user,
  });

  const hasAlreadyVoted = voteStatus?.hasVoted || false;

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) {
        throw new Error("Необходима авторизация");
      }

      const profileId = await getProfileIdByAuthUid(user.id, user.email);
      if (!profileId) {
        throw new Error("Профиль не найден");
      }

      const { data, error } = await supabase
        .from("battle_comments")
        .insert({
          battle_id: battleId,
          profile_id: profileId,
          content,
        })
        .select("*")
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battle-comments", battleId] });
      setCommentText("");
      toast({ title: "Комментарий добавлен" });
    },
    onError: () => {
      toast({ title: "Ошибка при добавлении комментария", variant: "destructive" });
    },
  });

  // Vote on comment mutation
  const voteCommentMutation = useMutation({
    mutationFn: async ({ commentId, value }: { commentId: number; value: 1 | -1 }) => {
      if (!user?.id) {
        throw new Error("Необходима авторизация");
      }

      const profileId = await getProfileIdByAuthUid(user.id, user.email);
      if (!profileId) {
        throw new Error("Профиль не найден");
      }

      const { data: currentVote, error: voteError } = await supabase
        .from("battle_comment_votes")
        .select("value")
        .eq("comment_id", commentId)
        .eq("profile_id", profileId)
        .maybeSingle();

      if (voteError) throw voteError;

      const { data: commentRow, error: commentError } = await supabase
        .from("battle_comments")
        .select("likes,dislikes")
        .eq("id", commentId)
        .maybeSingle();

      if (commentError) throw commentError;

      let likes = commentRow?.likes ?? 0;
      let dislikes = commentRow?.dislikes ?? 0;

      if (currentVote?.value === value) {
        if (value === 1) likes = Math.max(0, likes - 1);
        if (value === -1) dislikes = Math.max(0, dislikes - 1);

        const { error: deleteError } = await supabase
          .from("battle_comment_votes")
          .delete()
          .eq("comment_id", commentId)
          .eq("profile_id", profileId);

        if (deleteError) throw deleteError;
      } else {
        if (currentVote?.value === 1) likes = Math.max(0, likes - 1);
        if (currentVote?.value === -1) dislikes = Math.max(0, dislikes - 1);

        if (value === 1) likes += 1;
        if (value === -1) dislikes += 1;

        const { error: upsertError } = await supabase
          .from("battle_comment_votes")
          .upsert({
            comment_id: commentId,
            profile_id: profileId,
            value,
          }, { onConflict: "comment_id,profile_id" });

        if (upsertError) throw upsertError;
      }

      const { error: updateError } = await supabase
        .from("battle_comments")
        .update({ likes, dislikes })
        .eq("id", commentId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battle-comments", battleId] });
    },
  });

  // Vote on battle mutation
  const voteBattleMutation = useMutation({
    mutationFn: async (entryId: number) => {
      if (!user?.id) {
        throw new Error("Необходима авторизация");
      }

      const userId = await getUserIdByAuthUid(user.id, user.email);
      if (!userId) {
        throw new Error("Пользователь не найден");
      }

      const { error: insertError } = await supabase
        .from("battle_votes")
        .insert({
          battle_id: battleId,
          entry_id: entryId,
          voter_id: userId,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battle-vote-status", battleId, user?.id] });
      toast({ title: "Голос засчитан!", description: "Вы получили 5 XP" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Ошибка при голосовании", variant: "destructive" });
    },
  });

  // Convert API comments to the local format with safe defaults
  const comments: Comment[] = apiComments.map((c) => {
    let formattedDate = "недавно";
    try {
      if (c.createdAt) {
        formattedDate = new Date(c.createdAt).toLocaleString("ru");
      }
    } catch {
      formattedDate = "недавно";
    }
    
    return {
      id: c.id,
      author: `Пользователь ${c.profileId}`,
      content: c.content || "",
      createdAt: formattedDate,
      likes: typeof c.likes === "number" ? c.likes : 0,
      dislikes: typeof c.dislikes === "number" ? c.dislikes : 0,
      userVote: localCommentVotes[c.id] || null,
    };
  });

  // Check if we should auto-open file picker
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("join") === "true" && phase === "waiting" && fileInputRef.current) {
      // Remove join param from URL to avoid repeated triggers
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 500);
    }
  }, [phase]);

  const handleVote = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!selectedVote) return;
    if (hasAlreadyVoted) {
      toast({ title: "Вы уже голосовали в этом батле", variant: "destructive" });
      return;
    }
    // In a real app, we'd use actual entry IDs
    const entryId = selectedVote === "creator" ? 1 : 2;
    voteBattleMutation.mutate(entryId);
  };

  const handleJoinBattle = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (selectedImage) {
      toast({ title: "Вы присоединились к батлу!", description: "Батл отправлен на модерацию" });
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

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    if (!user) {
      toast({ title: "Войдите, чтобы комментировать" });
      return;
    }
    createCommentMutation.mutate(commentText.trim());
  };

  const handleCommentVote = (commentId: number, voteType: "like" | "dislike") => {
    if (!user) {
      toast({ title: "Войдите, чтобы голосовать" });
      return;
    }

    const value = voteType === "like" ? 1 : -1;
    voteCommentMutation.mutate({ commentId, value: value as 1 | -1 });
    
    // Optimistic update for UI
    setLocalCommentVotes(prev => ({
      ...prev,
      [commentId]: prev[commentId] === voteType ? null : voteType,
    }));
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
        className="max-w-4xl mx-auto"
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
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0" data-testid="phase-progress">
          {phases.map((p, index) => {
            const isActive = p === phase;
            const isPassed = index < currentPhaseIndex;
            
            return (
              <Badge
                key={p}
                className={cn(
                  "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-1 flex-shrink-0",
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
                <span className="hidden sm:inline">{phaseLabels[p]}</span>
                <span className="sm:hidden">{phaseLabels[p].split(' ')[0]}</span>
              </Badge>
            );
          })}
        </div>

        {/* Two Column Layout for Participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Creator Side */}
          <div data-testid="creator-section">
            {/* Author with avatar ABOVE image */}
            <Link href={`/users/${battle.creator.profileId}`}>
              <div className="flex items-center gap-2 mb-3 cursor-pointer hover-elevate rounded-lg p-1 -ml-1">
                <UserAvatar name={battle.creator.owner} size="md" />
                <div>
                  <p className="text-xs text-muted-foreground">Создатель</p>
                  <p className="font-medium text-sm text-[#1D1D1F]">{battle.creator.owner}</p>
                </div>
              </div>
            </Link>
            
            {/* Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-[#2D2D2D] mb-3">
              <img 
                src={battle.creator.image} 
                alt={battle.creator.name}
                className="w-full h-full object-cover"
                data-testid="img-creator-work"
              />
            </div>

            {/* Title and category BELOW image */}
            <h2 className="text-base md:text-lg font-bold text-[#1D1D1F] mb-1 flex items-center gap-2 flex-wrap" data-testid="text-creator-name">
              <span className="break-words">{battle.creator.name}</span>
              {creatorWon && (
                <Badge className="bg-amber-100 text-amber-700 text-xs" data-testid="badge-winner-xp">+{battle.xpReward}XP</Badge>
              )}
            </h2>
          </div>
          
          {/* Opponent Side */}
          <div data-testid="opponent-section">
            {hasOpponent ? (
              <>
                {/* Author with avatar ABOVE image */}
                <Link href={`/users/${battle.opponent.profileId}`}>
                  <div className="flex items-center gap-2 mb-3 cursor-pointer hover-elevate rounded-lg p-1 -ml-1">
                    <UserAvatar name={battle.opponent.owner} size="md" />
                    <div>
                      <p className="text-xs text-muted-foreground">Оппонент</p>
                      <p className="font-medium text-sm text-[#1D1D1F]">{battle.opponent.owner}</p>
                    </div>
                  </div>
                </Link>
                
                {/* Image */}
                <div className="aspect-square rounded-xl overflow-hidden bg-[#2D2D2D] mb-3">
                  <img 
                    src={battle.opponent.image} 
                    alt={battle.opponent.name}
                    className="w-full h-full object-cover"
                    data-testid="img-opponent-work"
                  />
                </div>

                {/* Title BELOW image */}
                <h2 className="text-base md:text-lg font-bold text-[#1D1D1F] mb-1 flex items-center gap-2 flex-wrap" data-testid="text-opponent-name">
                  <span className="break-words">{battle.opponent.name}</span>
                  {opponentWon && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs" data-testid="badge-winner-xp">+{battle.xpReward}XP</Badge>
                  )}
                </h2>
              </>
            ) : (
              <>
                {/* Empty opponent slot */}
                <div className="flex items-center gap-2 mb-3 opacity-50">
                  <UserAvatar name="?" size="md" />
                  <div>
                    <p className="text-xs text-muted-foreground">Оппонент</p>
                    <p className="font-medium text-sm text-muted-foreground">Ожидаем...</p>
                  </div>
                </div>
                
                <Card className="aspect-square bg-[#F9F9F9] border-2 border-dashed flex flex-col items-center justify-center relative">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" data-testid="img-join-preview" />
                      <Button 
                        className="absolute bottom-4 left-4 right-4 bg-[#FF6030] hover:bg-[#E55528] text-white font-medium rounded-xl"
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
                          ref={fileInputRef}
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

                <h2 className="text-lg font-bold text-muted-foreground mt-3" data-testid="text-waiting-opponent">
                  Ожидаем оппонента
                </h2>
              </>
            )}
          </div>
        </div>

        {/* Battle Title, Category and Description */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-[#1D1D1F] mb-2" data-testid="text-battle-title">{battle.title}</h1>
          <Badge className="bg-[#E8E8EE] text-[#1D1D1F] mb-3 text-xs" data-testid="badge-category">
            {battle.category}
          </Badge>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-battle-description">
            {battle.description}
          </p>
        </div>

        {/* Moderation Notice */}
        {phase === "moderation" && (
          <Card className="p-4 md:p-6 mb-6 md:mb-8 bg-amber-50 border-amber-200" data-testid="card-moderation-notice">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              <span className="font-semibold text-sm md:text-base text-amber-800">На модерации</span>
            </div>
            <p className="text-xs md:text-sm text-amber-700">
              Ваш батл проходит проверку модераторами. После одобрения начнётся голосование длительностью 24 часа.
            </p>
          </Card>
        )}

        {/* Voting Section */}
        {phase === "voting" && (
          <Card className="p-4 md:p-6 mb-6 md:mb-8 bg-white border-0 shadow-sm" data-testid="card-voting-section">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <span className="font-semibold text-sm md:text-base text-[#1D1D1F]">Голосование</span>
            </div>
            
            <p className="text-xs md:text-sm text-muted-foreground mb-2">Оставшееся время (24 часа):</p>
            <p className="text-xl md:text-2xl font-bold text-[#1D1D1F] mb-4 md:mb-6" data-testid="text-time-remaining">{timeRemaining}</p>
            
            {/* Vote Options */}
            <div className="space-y-3 mb-4 md:mb-6">
              <button
                onClick={() => setSelectedVote("creator")}
                className={cn(
                  "w-full p-3 md:p-4 rounded-xl border-2 flex items-center gap-3 md:gap-4 transition-colors",
                  selectedVote === "creator" 
                    ? "border-[#2D2D2D] bg-[#F9F9F9]" 
                    : "border-border hover:border-muted-foreground"
                )}
                data-testid="button-vote-creator"
              >
                <img 
                  src={battle.creator.image} 
                  alt={battle.creator.name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm md:text-base text-[#1D1D1F] truncate">{battle.creator.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{battle.creator.owner}</p>
                </div>
                {selectedVote === "creator" && (
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-[#1D1D1F] flex-shrink-0" />
                )}
              </button>
              
              {hasOpponent && (
                <button
                  onClick={() => setSelectedVote("opponent")}
                  className={cn(
                    "w-full p-3 md:p-4 rounded-xl border-2 flex items-center gap-3 md:gap-4 transition-colors",
                    selectedVote === "opponent" 
                      ? "border-[#2D2D2D] bg-[#F9F9F9]" 
                      : "border-border hover:border-muted-foreground"
                  )}
                  data-testid="button-vote-opponent"
                >
                  <img 
                    src={battle.opponent.image} 
                    alt={battle.opponent.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm md:text-base text-[#1D1D1F] truncate">{battle.opponent.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{battle.opponent.owner}</p>
                  </div>
                  {selectedVote === "opponent" && (
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-[#1D1D1F] flex-shrink-0" />
                  )}
                </button>
              )}
            </div>
            
            {hasAlreadyVoted ? (
              <Button 
                className="w-full bg-muted text-muted-foreground rounded-xl cursor-not-allowed"
                disabled
                data-testid="button-already-voted"
              >
                <Check className="h-4 w-4 mr-2" />
                Вы уже голосовали
              </Button>
            ) : (
              <Button 
                className="w-full bg-[#FF6030] hover:bg-[#E55525] text-white rounded-xl"
                onClick={handleVote}
                disabled={!selectedVote || voteBattleMutation.isPending}
                data-testid="button-submit-vote"
              >
                {voteBattleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Голосование...
                  </>
                ) : (
                  <>
                    Голосовать и получить <Badge className="ml-2 bg-white/20 text-white">5XP</Badge>
                  </>
                )}
              </Button>
            )}
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
        <Card className="p-4 md:p-6 bg-white border-0 shadow-sm" data-testid="card-comments">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <span className="font-semibold text-sm md:text-base text-[#1D1D1F]">Комментарии</span>
            <span className="text-xs md:text-sm text-muted-foreground">({comments.length})</span>
          </div>
          
          {/* Comment Input */}
          <div className="flex gap-2 md:gap-3 mb-4">
            <UserAvatar 
              name={profile?.username || profile?.fullName || user?.email} 
              size="sm"
              className="flex-shrink-0 hidden sm:block" 
            />
            <div className="flex-1">
              <Textarea
                placeholder="Что вы думаете об этом батле?"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-2 rounded-xl resize-none min-h-[70px] md:min-h-[80px] text-sm"
                disabled={phase === "waiting" || phase === "moderation"}
                data-testid="input-comment"
              />
              
              {(phase === "waiting" || phase === "moderation") && (
                <p className="text-sm text-muted-foreground flex items-center gap-2" data-testid="text-comments-disabled">
                  <Info className="h-4 w-4" />
                  Комментарии будут доступны после прохождения модерации
                </p>
              )}
              
              {(phase === "voting" || phase === "completed") && (
                <Button 
                  className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl gap-2"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || createCommentMutation.isPending}
                  data-testid="button-submit-comment"
                >
                  <Send className="h-4 w-4" />
                  Отправить
                </Button>
              )}
            </div>
          </div>
          
          {/* Comments List */}
          {(phase === "voting" || phase === "completed") && (
            <div className="space-y-3 md:space-y-4" data-testid="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="border-t pt-3 md:pt-4" data-testid={`comment-${comment.id}`}>
                  <div className="flex items-start gap-2 md:gap-3">
                    <UserAvatar name={comment.author} size="sm" className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-xs md:text-sm text-[#1D1D1F] truncate">{comment.author}</span>
                        <span className="text-[10px] md:text-xs text-muted-foreground">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs md:text-sm text-[#1D1D1F] mb-2 break-words">{comment.content}</p>
                      <div className="flex items-center gap-3 md:gap-4">
                        <button 
                          className={cn(
                            "flex items-center gap-1 text-sm transition-colors",
                            comment.userVote === "like" 
                              ? "text-[#FF6030]" 
                              : "text-muted-foreground hover:text-[#1D1D1F]"
                          )}
                          onClick={() => handleCommentVote(comment.id, "like")}
                          data-testid={`button-like-comment-${comment.id}`}
                        >
                          <img 
                            src={LikeIcon} 
                            alt="Like" 
                            className="h-4 w-4"
                            style={{ 
                              filter: comment.userVote === "like" 
                                ? 'brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(7498%) hue-rotate(1deg) brightness(101%) contrast(101%)' // #FF6030
                                : 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
                            }}
                          />
                          {comment.likes}
                        </button>
                        <button 
                          className={cn(
                            "flex items-center gap-1 text-sm transition-colors",
                            comment.userVote === "dislike" 
                              ? "text-[#FF6030]" 
                              : "text-muted-foreground hover:text-[#1D1D1F]"
                          )}
                          onClick={() => handleCommentVote(comment.id, "dislike")}
                          data-testid={`button-dislike-comment-${comment.id}`}
                        >
                          <img 
                            src={DislikeIcon} 
                            alt="Dislike" 
                            className="h-4 w-4"
                            style={{ 
                              filter: comment.userVote === "dislike" 
                                ? 'brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(7498%) hue-rotate(1deg) brightness(101%) contrast(101%)' // #FF6030
                                : 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
                            }}
                          />
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
