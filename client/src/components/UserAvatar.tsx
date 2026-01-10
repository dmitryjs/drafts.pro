import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
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

function getInitial(name?: string | null): string {
  if (!name) return "А";
  return name.charAt(0).toUpperCase();
}

export default function UserAvatar({ avatarUrl, name, size = "md", className }: UserAvatarProps) {
  const initial = getInitial(name);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={name || "Пользователь"} />
      ) : null}
      <AvatarFallback 
        className={cn(
          "bg-[#34C759] text-white font-medium",
          textSizeClasses[size]
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
