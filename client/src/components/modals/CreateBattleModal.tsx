import { useState } from "react";
import { Upload, Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface CreateBattleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateBattleModal({ open, onOpenChange }: CreateBattleModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = () => {
    if (!selectedImage || !title.trim()) return;
    onOpenChange(false);
    setSelectedImage(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
  };

  const isFormValid = selectedImage && title.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Создать новый батл</DialogTitle>
        </DialogHeader>

        {/* Info Banner */}
        <Card className="p-4 bg-[#F9F9F9] border-0">
          <div className="flex items-start justify-between gap-4">
            <div>
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
            <button 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {}}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* Left: Image Upload */}
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
          
          {/* Right: Battle Info */}
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
                  className="mt-1.5 rounded-xl"
                  data-testid="input-battle-title"
                />
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
                  className="mt-1.5 min-h-[120px] rounded-xl resize-none"
                  data-testid="input-battle-description"
                />
              </div>
            </div>
            
            <Button 
              className="w-full mt-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl disabled:opacity-50"
              disabled={!isFormValid}
              onClick={handleSubmit}
              data-testid="button-create-battle"
            >
              Создать батл
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
