import { useState } from "react";
import { X, Maximize2, Tag, Briefcase, Paperclip } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: "cases", label: "Кейсы", icon: "circle-red" },
  { value: "product", label: "Продукты", icon: "circle-purple" },
  { value: "uxui", label: "UX/UI", icon: "circle-pink" },
  { value: "graphic", label: "Графический", icon: "circle-yellow" },
  { value: "3d", label: "3D", icon: "circle-blue" },
];

const levels = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

export default function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSubmit = () => {
    console.log({ category, level, title, description });
    onOpenChange(false);
  };

  const getCategoryDot = (cat: string) => {
    switch (cat) {
      case "cases": return "bg-red-500";
      case "product": return "bg-purple-500";
      case "uxui": return "bg-pink-500";
      case "graphic": return "bg-yellow-500";
      case "3d": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isFullscreen ? 'max-w-4xl h-[90vh]' : 'max-w-2xl'} flex flex-col gap-0 p-0`}
      >
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between gap-4">
          <DialogTitle className="text-lg font-semibold">Создать задачу</DialogTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              data-testid="button-fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Category and Level selectors */}
          <div className="flex gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40 bg-muted/50" data-testid="select-category">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getCategoryDot(cat.value)}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-32 bg-muted/50" data-testid="select-level">
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((lvl) => (
                  <SelectItem key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <Input
            placeholder="Название задачи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-medium border-0 px-0 focus-visible:ring-0 bg-transparent"
            data-testid="input-task-title"
          />

          {/* Description */}
          <Textarea
            placeholder="Опишите вашу задачу максимально подробно"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[200px] resize-none border-0 px-0 focus-visible:ring-0 bg-transparent text-muted-foreground"
            data-testid="input-task-description"
          />
        </div>

        {/* Bottom toolbar */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-muted-foreground">
              ОТКРЫТЬ
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Tag className="h-4 w-4 mr-1.5" />
              Теги
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-1.5" />
              Сфера
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Paperclip className="h-4 w-4 mr-1.5" />
              Вложения
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-save-draft"
            >
              Сохранить в черновик
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!title || !category || !level}
              data-testid="button-create-task"
            >
              Создать задачу
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
