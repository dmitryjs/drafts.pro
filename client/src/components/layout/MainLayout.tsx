import { ReactNode } from "react";
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
  Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface MainLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  title?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const navItems = [
  { href: "/", icon: LayoutGrid, label: "Задачи" },
  { href: "/battles", icon: Swords, label: "Батлы" },
  { href: "/assessment", icon: BarChart3, label: "Оценка" },
  { href: "/mentors", icon: Users, label: "Менторы" },
];

export default function MainLayout({ 
  children, 
  rightPanel, 
  title,
  showCreateButton = true,
  onCreateClick 
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
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                D
              </div>
              <span className="font-display font-bold text-lg">Drafts</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.href === "/" && location === "/tasks");
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover-elevate"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          {isLoading ? (
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover-elevate">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
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
        {/* Header */}
        <header className="h-16 border-b border-border bg-background sticky top-0 z-40 flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-4 flex-1">
            {title && (
              <h1 className="text-xl font-semibold font-display">{title}</h1>
            )}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск задач..."
                className="pl-9 bg-muted/50 border-0"
                data-testid="input-search"
              />
            </div>
          </div>
          
          {showCreateButton && (
            <Button onClick={onCreateClick} data-testid="button-create-task">
              <Plus className="mr-2 h-4 w-4" />
              Создать задачу
            </Button>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Center Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>

          {/* Right Panel */}
          {rightPanel && (
            <aside className="w-80 border-l border-border bg-card p-6 overflow-auto hidden lg:block">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
