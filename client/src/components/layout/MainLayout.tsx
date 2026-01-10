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
  ChevronDown,
  Shield
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
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Profile, Notification } from "@shared/schema";
import { cn } from "@/lib/utils";
import logoPath from "@assets/Logo_black_1767028620121.png";
import CreateBattleModal from "@/components/modals/CreateBattleModal";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { user, isLoading, logout } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { data: profile } = useQuery<Profile>({
    queryKey: ['/api/profiles', user?.id],
    enabled: !!user?.id,
  });

  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ['/api/admin/check'],
    enabled: !!user?.id,
  });
  
  const isAdmin = adminCheck?.isAdmin === true;

  // Notifications
  const { data: notificationsList } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const handleSignOut = () => {
    logout();
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

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - white background */}
        <header className="h-14 border-b border-border bg-white sticky top-0 z-40 flex items-center justify-end px-4 gap-3">
          {user ? (
            <>
              {/* Create button with dropdown - only for authenticated users */}
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
                    onClick={() => {
                      if (onCreateTask) onCreateTask();
                      else setIsTaskModalOpen(true);
                    }}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Задача
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer py-2.5"
                    onClick={() => {
                      if (onCreateBattle) onCreateBattle();
                      else setIsBattleModalOpen(true);
                    }}
                  >
                    <Swords className="mr-2 h-4 w-4" />
                    Батл
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-foreground relative"
                    data-testid="button-notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount && unreadCount.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF6030] text-white text-[10px] font-medium rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                        {unreadCount.count > 99 ? '99+' : unreadCount.count}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-medium">Уведомления</span>
                    {notificationsList && notificationsList.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-muted-foreground h-auto py-1 px-2"
                        onClick={() => markAllReadMutation.mutate()}
                      >
                        Прочитать все
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    {notificationsList && notificationsList.length > 0 ? (
                      <div className="divide-y">
                        {notificationsList.map((notification) => (
                          <div 
                            key={notification.id}
                            className={cn(
                              "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                              !notification.isRead && "bg-orange-50"
                            )}
                            onClick={() => {
                              if (!notification.isRead) {
                                markReadMutation.mutate(notification.id);
                              }
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                                !notification.isRead ? "bg-[#FF6030]" : "bg-transparent"
                              )} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                                {notification.createdAt && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ru })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Нет уведомлений</p>
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    data-testid="button-avatar"
                  >
                    <UserAvatar 
                      avatarUrl={profile?.avatarUrl} 
                      name={profile?.username || user?.firstName || user?.email}
                      size="md"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                  {isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" /> Админ панель
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl" data-testid="button-login-header">
                Войти
              </Button>
            </Link>
          )}
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

      {/* Global Modals */}
      <CreateTaskModal 
        open={isTaskModalOpen} 
        onOpenChange={setIsTaskModalOpen} 
      />
      <CreateBattleModal 
        open={isBattleModalOpen} 
        onOpenChange={setIsBattleModalOpen} 
      />
    </div>
  );
}
