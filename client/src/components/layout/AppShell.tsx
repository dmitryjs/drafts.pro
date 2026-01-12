import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  FileText, 
  Swords, 
  BarChart3, 
  Users, 
  User, 
  Settings,
  LogOut,
  LogIn
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useHealth } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { Profile } from "@shared/schema";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function AppShell({ children, hideNav = false }: AppShellProps) {
  const [location] = useLocation();
  const { data: health } = useHealth();
  const { user, isLoading, logout } = useAuth();

  // Fetch profile to get avatar
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profiles", user?.id],
    enabled: !!user?.id,
  });

  // Use profile avatar
  const avatarUrl = profile?.avatarUrl || undefined;

  const navItems = [
    { href: "/", icon: Home, label: "Главная" },
    { href: "/tasks", icon: FileText, label: "Задачи" },
    { href: "/battles", icon: Swords, label: "Батлы" },
    { href: "/assessment", icon: BarChart3, label: "Оценка" },
    { href: "/mentors", icon: Users, label: "Менторы" },
  ];

  const handleSignOut = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 px-4 h-14 flex items-center justify-between gap-2">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <span className="font-bold text-lg tracking-tight">DesignHub</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <UserAvatar 
                    avatarUrl={avatarUrl} 
                    name={profile?.username || profile?.fullName || user?.email}
                    size="md"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.username || profile?.fullName || "Пользователь"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Профиль
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Настройки
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="default" size="sm" data-testid="button-sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {!hideNav && (
        <nav className="sticky bottom-0 z-50 w-full bg-background/90 backdrop-blur-lg border-t border-border/50">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} className="w-full">
                  <div className={cn(
                    "flex flex-col items-center justify-center gap-1 h-full w-full py-2 transition-all duration-200 cursor-pointer",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}>
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {health && (
        <div className="fixed bottom-20 right-4 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] pointer-events-none opacity-50" />
      )}
    </div>
  );
}
