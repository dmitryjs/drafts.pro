import { useState, useRef } from "react";
import { X, Tag, Briefcase, Paperclip, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

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

const popularTags = [
  "retention",
  "onboarding",
  "лендинг",
  "брендинг",
  "мобильное приложение",
];

const popularSpheres = [
  "E-commerce",
  "Fintech",
  "EdTech",
  "HoReCa",
  "Мобильные приложения",
];

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-figma",
  "application/sketch",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export default function CreateTaskModal({ open, onOpenChange }: CreateTaskModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [spheres, setSpheres] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [sphereInput, setSphereInput] = useState("");
  const [tagsOpen, setTagsOpen] = useState(false);
  const [spheresOpen, setSpheresOpen] = useState(false);

  const saveDraftMutation = useMutation({
    mutationFn: async (data: {
      title?: string;
      description?: string;
      category?: string;
      level?: string;
      tags?: string[];
      spheres?: string[];
    }) => {
      const res = await apiRequest("POST", "/api/drafts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drafts"] });
      toast({
        title: "Черновик сохранён",
        description: "Вы можете найти его в разделе «Черновики» в профиле",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить черновик. Попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    console.log({ category, level, title, description, tags, spheres, attachments });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setCategory("");
    setLevel("");
    setTitle("");
    setDescription("");
    setTags([]);
    setSpheres([]);
    setAttachments([]);
    setTagInput("");
    setSphereInput("");
  };

  const handleSaveDraft = () => {
    const hasContent = title.trim() || description.trim() || category || level || tags.length > 0 || spheres.length > 0 || attachments.length > 0;
    
    if (!hasContent) {
      toast({
        title: "Невозможно сохранить",
        description: "Добавьте хотя бы одно поле для сохранения черновика",
        variant: "destructive",
      });
      return;
    }
    
    saveDraftMutation.mutate({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      category: category || undefined,
      level: level || undefined,
      tags: tags.length > 0 ? tags : undefined,
      spheres: spheres.length > 0 ? spheres : undefined,
    });
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addSphere = (sphere: string) => {
    const trimmed = sphere.trim();
    if (trimmed && !spheres.includes(trimmed)) {
      setSpheres([...spheres, trimmed]);
    }
    setSphereInput("");
  };

  const removeSphere = (sphereToRemove: string) => {
    setSpheres(spheres.filter(s => s !== sphereToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSphereKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSphere(sphereInput);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const availableSlots = MAX_FILES - attachments.length;
    
    if (availableSlots <= 0) {
      toast({
        title: "Лимит файлов",
        description: `Максимум ${MAX_FILES} файлов`,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    for (const file of files) {
      if (validFiles.length >= availableSlots) {
        toast({
          title: "Лимит файлов",
          description: `Добавлено ${validFiles.length} файлов. Максимум ${MAX_FILES} файлов`,
          variant: "destructive",
        });
        break;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Файл слишком большой",
          description: `${file.name} превышает лимит 10 МБ`,
          variant: "destructive",
        });
        continue;
      }
      
      if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.endsWith('.fig') && !file.name.endsWith('.sketch')) {
        toast({
          title: "Неподдерживаемый формат",
          description: `${file.name} - разрешены: JPG, PNG, GIF, WebP, PDF, ZIP, Figma, Sketch`,
          variant: "destructive",
        });
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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

  const buttonStyle = "bg-[#F0F0F0] hover:bg-[#E5E5E5] text-foreground border-0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideCloseButton
        className="max-w-4xl h-[90vh] flex flex-col gap-0 p-0"
      >
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between gap-4">
          <DialogTitle style={{ fontSize: "24px" }} className="font-semibold">Создать задачу</DialogTitle>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Category and Level selectors */}
          <div className="flex gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={`w-40 ${buttonStyle}`} data-testid="select-category">
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
              <SelectTrigger className={`w-32 ${buttonStyle}`} data-testid="select-level">
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
            style={{ fontSize: "24px" }}
            className="font-medium border-0 px-0 focus-visible:ring-0 bg-transparent h-auto py-2"
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

          {/* Tags chips */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 bg-[#F0F0F0] rounded-md py-2 px-4"
                  data-testid={`tag-chip-${tag}`}
                >
                  <span className="text-sm">{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid={`button-remove-tag-${tag}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Spheres chips */}
          {spheres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {spheres.map((sphere) => (
                <div
                  key={sphere}
                  className="flex items-center gap-2 bg-[#F0F0F0] rounded-md py-2 px-4"
                  data-testid={`sphere-chip-${sphere}`}
                >
                  <span className="text-sm">{sphere}</span>
                  <button
                    onClick={() => removeSphere(sphere)}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid={`button-remove-sphere-${sphere}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Attachments list */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 bg-[#F0F0F0] rounded-md py-2 px-4"
                  data-testid={`attachment-${index}`}
                >
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid={`button-remove-attachment-${index}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom toolbar */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button size="sm" className={buttonStyle}>
              ОТКРЫТЬ
            </Button>
            
            {/* Tags popover */}
            <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  className={`${buttonStyle} ${tagsOpen ? 'ring-2 ring-primary' : ''}`}
                  data-testid="button-tags"
                >
                  <Tag className="h-4 w-4 mr-1.5" />
                  Теги
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-64 p-3" align="start">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Добавить тег..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="text-sm"
                      data-testid="input-tag"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => addTag(tagInput)}
                      disabled={!tagInput.trim()}
                      data-testid="button-add-tag"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Популярные</p>
                    <div className="flex flex-wrap gap-1">
                      {popularTags.filter(t => !tags.includes(t)).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="text-xs px-2 py-1 bg-[#F0F0F0] rounded hover:bg-[#E5E5E5] transition-colors"
                          data-testid={`button-popular-tag-${tag}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Spheres popover */}
            <Popover open={spheresOpen} onOpenChange={setSpheresOpen}>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  className={`${buttonStyle} ${spheresOpen ? 'ring-2 ring-primary' : ''}`}
                  data-testid="button-spheres"
                >
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  Сфера
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-64 p-3" align="start">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Добавить сферу..."
                      value={sphereInput}
                      onChange={(e) => setSphereInput(e.target.value)}
                      onKeyDown={handleSphereKeyDown}
                      className="text-sm"
                      data-testid="input-sphere"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => addSphere(sphereInput)}
                      disabled={!sphereInput.trim()}
                      data-testid="button-add-sphere"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Популярные</p>
                    <div className="flex flex-wrap gap-1">
                      {popularSpheres.filter(s => !spheres.includes(s)).map((sphere) => (
                        <button
                          key={sphere}
                          onClick={() => addSphere(sphere)}
                          className="text-xs px-2 py-1 bg-[#F0F0F0] rounded hover:bg-[#E5E5E5] transition-colors"
                          data-testid={`button-popular-sphere-${sphere}`}
                        >
                          {sphere}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Attachments */}
            <Button 
              size="sm" 
              className={buttonStyle}
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= MAX_FILES}
              data-testid="button-attachments"
            >
              <Paperclip className="h-4 w-4 mr-1.5" />
              Вложения ({attachments.length}/{MAX_FILES})
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.zip,.fig,.sketch"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
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
