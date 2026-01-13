import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6", // 24x24
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-16 w-16",
};

const textSizeClasses = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-lg",
};

const avatarColors = [
  "#34C759",
  "#FF6030",
  "#007AFF",
  "#AF52DE",
  "#FF9500",
  "#5856D6",
  "#FF2D55",
  "#00C7BE",
  "#32ADE6",
  "#FF3B30",
];

function getInitial(name?: string | null): string {
  if (!name) return "А";
  return name.charAt(0).toUpperCase();
}

function getColorFromName(name?: string | null): string {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}

export default function UserAvatar({ avatarUrl, name, size = "md", className }: UserAvatarProps) {
  const initial = getInitial(name);
  const bgColor = getColorFromName(name);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={name || "Пользователь"} />
      ) : null}
      <AvatarFallback 
        className={cn(
          "text-white font-medium",
          textSizeClasses[size]
        )}
        style={{ backgroundColor: bgColor }}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
