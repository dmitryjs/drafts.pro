import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutGrid,
  Swords,
  BarChart3,
  Users,
  User,
  Settings,
  LogOut,
  LogIn,
  Plus,
  Bell,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import logoPath from "@assets/Logo_black_1767028620121.png";

interface MainLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  title?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  onCreateTask?: () => void;
  onCreateBattle?: () => void;
}

const navItems = [
  { href: "/", icon: LayoutGrid, label: "Задачи" },
  { href: "/battles", icon: Swords, label: "Батлы" },
  { href: "/assessment", icon: BarChart3, label: "Оценка навыков" },
  { href: "/mentors", icon: Users, label: "Менторы" },
];

export default function MainLayout({ 
  children, 
  rightPanel, 
  title,
  showCreateButton = true,
  onCreateClick,
  onCreateTask,
  onCreateBattle
}: MainLayoutProps) {
  const [location] = useLocation();
  const { user, profile, signOut, isConfigured, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex">
      {/* Left Sidebar - 238px white */}
      <aside className="w-[238px] bg-white border-r border-border flex flex-col h-screen sticky top-0">
        {/* Logo - 160x16 */}
        <div className="h-14 px-4 flex items-center border-b border-border">
          <Link href="/">
            <img 
              src={logoPath} 
              alt="Drafts" 
              className="cursor-pointer"
              style={{ width: '160px', height: '16px' }}
            />
          </Link>
        </div>

        {/* Navigation - 32px spacing from header */}
        <nav className="flex-1 px-3 pt-8 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.href === "/" && location === "/tasks");
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                    isActive
                      ? "bg-[#F4F4F5] text-foreground font-medium"
                      : "text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          {isLoading ? (
            <div className="h-10 bg-muted animate-pulse rounded-lg" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#F4F4F5] transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile?.username || "Пользователь"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {profile?.username || "Пользователь"}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
          ) : isConfigured ? (
            <Link href="/auth">
              <Button variant="default" className="w-full" data-testid="button-sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Button>
            </Link>
          ) : null}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - white background */}
        <header className="h-14 border-b border-border bg-white sticky top-0 z-40 flex items-center justify-end px-4 gap-3">
          {/* Create button with dropdown - always visible, redirects to login if not authenticated */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl" data-testid="button-create">
                  <Plus className="h-4 w-4" />
                  Создать
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem 
                  className="cursor-pointer py-2.5"
                  onClick={onCreateTask || onCreateClick}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Задача
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer py-2.5"
                  onClick={onCreateBattle || onCreateClick}
                >
                  <Swords className="mr-2 h-4 w-4" />
                  Батл
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button className="gap-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl" data-testid="button-create">
                <Plus className="h-4 w-4" />
                Создать
              </Button>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                data-testid="button-avatar"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {profile?.username || "Пользователь"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "Не авторизован"}
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
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Выйти
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Center Content - F9F9F9 background */}
          <main className="flex-1 p-6 overflow-auto bg-[#F9F9F9]">
            {children}
          </main>

          {/* Right Panel - white background */}
          {rightPanel && (
            <aside className="w-80 border-l border-border bg-white p-6 overflow-auto hidden lg:block">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
