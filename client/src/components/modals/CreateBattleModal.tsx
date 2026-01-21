import { useState } from "react";
import { Upload, Info, X, Loader2 } from "lucide-react";
import CategoryIcon3D from "@assets/icons/CategoryIcons_3D.svg";
import CategoryIconGraphic from "@assets/icons/CategoryIcons_Graphic.svg";
import CategoryIconProducts from "@assets/icons/CategoryIcons_Products.svg";
import CategoryIconUXUI from "@assets/icons/CategoryIcons_UXUI.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { getProfileIdByAuthUid } from "@/lib/supabase-helpers";

interface CreateBattleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: "product", label: "Продукт", icon: CategoryIconProducts },
  { value: "graphic", label: "Графический", icon: CategoryIconGraphic },
  { value: "uxui", label: "UX/UI", icon: CategoryIconUXUI },
  { value: "3d", label: "3D", icon: CategoryIcon3D },
];

export default function CreateBattleModal({ open, onOpenChange }: CreateBattleModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createBattleMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: string; theme: string }) => {
      if (!user?.id) {
        throw new Error("Необходима авторизация");
      }

      const profileId = await getProfileIdByAuthUid(user.id);
      if (!profileId) {
        throw new Error("Профиль не найден");
      }

      const slugBase = data.title
        .toLowerCase()
        .replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50);
      const slug = `${slugBase}-${Date.now()}`;

      const { error } = await supabase
        .from("battles")
        .insert({
          slug,
          title: data.title,
          description: data.description,
          category: data.category,
          theme: data.theme,
          status: "moderation",
          created_by: profileId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battles"] });
      toast({ title: "Батл отправлен на модерацию!" });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error creating battle:", error);
      const errorMessage = error?.message || "Неизвестная ошибка";
      toast({ title: "Ошибка при создании батла", description: errorMessage, variant: "destructive" });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setCategory("");
  };

  const handleSubmit = () => {
    if (!selectedImage || !title.trim() || !category) return;
    createBattleMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      category,
      theme: category,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const isFormValid = selectedImage && title.trim() && category;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent hideCloseButton className="!max-w-3xl lg:!max-w-3xl p-0">
        <DialogHeader className="relative px-6 lg:px-6 pt-6 lg:pt-6 pb-0">
          <DialogTitle className="text-xl font-bold">Создать новый батл</DialogTitle>
          <DialogClose asChild>
            <button 
              className="absolute right-0 top-0 lg:right-5 lg:top-5 text-muted-foreground hover:text-foreground"
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Info Banner */}
        <div className="px-6 lg:px-6 pt-2">
          <h3 className="font-medium text-[#1D1D1F] mb-1">Как работает создание батла?</h3>
          <p className="text-sm text-muted-foreground">
            Выберите работу, загрузите её на батл, дождитесь оппонента и пройдите модерацию. После этого начнётся голосование.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">Победитель получит:</span>
            <Badge className="bg-[#E8E8EE] text-[#1D1D1F] border-0">
              +XP 50
            </Badge>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="px-6 lg:px-6">
          <div className="grid grid-cols-2 gap-6 mt-4">
            {/* Image Upload */}
            <div>
              <h3 className="font-semibold text-[#1D1D1F] mb-4">Выберите свою работу</h3>
              
              <Card className="aspect-square bg-[#F9F9F9] border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors relative overflow-hidden">
                {previewUrl ? (
                  <>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                        setPreviewUrl(null);
                      }}
                      data-testid="button-remove-image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                      data-testid="input-battle-image"
                    />
                    <Button variant="outline" className="rounded-xl mb-3" data-testid="button-select-image">
                      Выбрать файл
                    </Button>
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Загрузите свою работу для участия в батле
                    </p>
                  </label>
                )}
              </Card>
              
              {/* Important Notice */}
              <div className="flex items-start gap-2 mt-4 p-3 bg-[#F9F9F9] rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-[#1D1D1F]">Важно!</span>
                  <br />
                  Можно использовать только работы, созданные вами.
                </div>
              </div>
            </div>
            
            {/* Battle Info */}
            <div>
              <h3 className="font-semibold text-[#1D1D1F] mb-4">Информация о батле</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="battle-title" className="text-sm font-medium">
                    Название батла
                  </Label>
                  <Input
                    id="battle-title"
                    placeholder="Батл #12345"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 rounded-xl bg-[#E8E8E8] lg:bg-[#E8E8E8] border-0"
                    data-testid="input-battle-title"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Категория
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1.5 rounded-xl border-0" data-testid="select-battle-category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <img src={cat.icon} alt={cat.label} className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="battle-description" className="text-sm font-medium">
                    Описание
                  </Label>
                  <Textarea
                    id="battle-description"
                    placeholder="Опишите ваш батл..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 min-h-[120px] rounded-xl resize-none bg-[#E8E8E8] lg:bg-[#E8E8E8] border-0"
                    data-testid="input-battle-description"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl disabled:opacity-50"
              disabled={!isFormValid || createBattleMutation.isPending}
              onClick={handleSubmit}
              data-testid="button-create-battle"
            >
              {createBattleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать батл"
              )}
            </Button>
          </div>
        </div>
        <div className="px-6 lg:px-6 pb-6 lg:pb-6"></div>
      </DialogContent>
    </Dialog>
  );
}
