import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Users,
  User,
  Settings,
  LogOut,
  LogIn,
  Plus,
  ChevronDown,
  ChevronRight,
  Shield,
  Menu
} from "lucide-react";
import MenuActivityIcon from "@assets/icons/Menu_Activity.svg";
import MenuBattleIcon from "@assets/icons/Menu_Battle.svg";
import MenuNavikiIcon from "@assets/icons/Menu_Naviki.svg";
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
import logoPath from "@assets/Drafts_Black.svg";
import NotificationsIcon from "@/components/NotificationsIcon";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MobileTabBar from "./MobileTabBar";

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
  { href: "/", icon: MenuActivityIcon, label: "Задачи" },
  { href: "/battles", icon: MenuBattleIcon, label: "Батлы" },
  { href: "/assessment", icon: MenuNavikiIcon, label: "Оценка навыков" },
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
    queryKey: ['/api/admin/check', user?.id],
    queryFn: async () => {
      if (!user?.id) return { isAdmin: false };
      // Передаем userId в query параметре
      const response = await fetch(`/api/admin/check?userId=${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) return { isAdmin: false };
      return response.json();
    },
    enabled: !!user?.id,
  });
  
  const isAdmin = adminCheck?.isAdmin === true;

  // Notifications
  const { data: notificationsList } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/notifications?userId=${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0 };
      const response = await fetch(`/api/notifications/unread-count?userId=${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) return { count: 0 };
      return response.json();
    },
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


  const renderNavItems = () => (
    <nav className="flex-1 px-3 pt-4 space-y-0.5">
      {navItems.map((item) => {
        const isActive =
          location === item.href || (item.href === "/" && location === "/tasks");

        return (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                isActive
                  ? "bg-[#F4F4F5] text-foreground font-medium"
                  : "text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground"
              )}
              data-testid={`nav-${item.label
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="h-4 w-4"
                style={{
                  filter: isActive
                    ? "brightness(0) saturate(100%) invert(8%) sepia(4%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)" // #141416
                    : "brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)", // #979797
                }}
              />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex overflow-x-hidden">
      {/* Left Sidebar - desktop */}
      <aside className="w-[238px] bg-white border-r border-border flex flex-col h-screen sticky top-0 hidden lg:flex">
        {/* Logo */}
        <div className="h-14 px-4 flex items-center border-b border-border">
          <Link href="/">
            <img
              src={logoPath}
              alt="Drafts"
              className="cursor-pointer"
              style={{ width: "160px", height: "16px" }}
            />
          </Link>
        </div>

        {/* Navigation */}
        {renderNavItems()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header - white background */}
        <header className="h-14 border-b border-border bg-white sticky top-0 z-40 flex items-center justify-between px-[15px] lg:px-4 gap-3 w-full max-w-full overflow-x-hidden">
          {/* Left: logo on mobile */}
          <div className="flex items-center gap-2">
            <Link href="/" className="lg:hidden">
              <img
                src={logoPath}
                alt="Drafts"
                className="cursor-pointer"
                style={{ width: "130px", height: "14px" }}
              />
            </Link>
          </div>

          {/* Right: actions / auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Create button with dropdown - only for authenticated users, hidden on mobile (shown in tab bar) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl hidden lg:flex" data-testid="button-create">
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
                      <img 
                        src={MenuActivityIcon} 
                        alt="Задача"
                        className="mr-2 h-4 w-4"
                        style={{ 
                          filter: 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
                        }}
                      />
                      Задача
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer py-2.5"
                      onClick={() => {
                        if (onCreateBattle) onCreateBattle();
                        else setIsBattleModalOpen(true);
                      }}
                    >
                      <img 
                        src={MenuBattleIcon} 
                        alt="Батл"
                        className="mr-2 h-4 w-4"
                        style={{ 
                          filter: 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
                        }}
                      />
                      Батл
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-[#E8E8E8] hover:bg-[#D7D7D7] rounded-xl relative hidden lg:flex"
                      data-testid="button-notifications"
                    >
                      <NotificationsIcon className="h-5 w-5" />
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
                          <NotificationsIcon className="h-8 w-8 mb-2 opacity-50" />
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
                      className="rounded-full hidden lg:flex"
                      data-testid="button-avatar"
                    >
                      <UserAvatar 
                        avatarUrl={profile?.avatarUrl} 
                        name={profile?.username || profile?.fullName || user?.email}
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

                {/* Mobile: Burger menu on the right */}
                <div className="flex lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-[#E8E8E8] hover:bg-[#D7D7D7] rounded-xl"
                        aria-label="Открыть меню"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                <SheetContent side="right" className="p-0 w-64">
                  <SheetHeader className="px-4 pt-4 pb-2 border-b border-border flex flex-row items-center justify-between space-y-0">
                    <SheetTitle className="text-sm font-medium">
                      Меню
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-60px)]">
                    <div className="pt-2 pb-4">
                      {/* Уведомления секция */}
                      {user && (
                        <div className="px-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Уведомления</span>
                            {unreadCount && unreadCount.count > 0 && (
                              <span className="bg-[#FF6030] text-white text-[10px] font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                                {unreadCount.count > 99 ? '99+' : unreadCount.count}
                              </span>
                            )}
                          </div>
                          {notificationsList && notificationsList.length > 0 ? (
                            <div className="space-y-2">
                              {notificationsList.slice(0, 3).map((notification) => (
                                <div 
                                  key={notification.id}
                                  className={cn(
                                    "p-2 rounded-lg cursor-pointer transition-colors text-xs",
                                    !notification.isRead && "bg-orange-50"
                                  )}
                                  onClick={() => {
                                    if (!notification.isRead) {
                                      markReadMutation.mutate(notification.id);
                                    }
                                  }}
                                >
                                  <p className="font-medium line-clamp-1">{notification.title}</p>
                                  <p className="text-muted-foreground line-clamp-1 mt-0.5">{notification.message}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Нет уведомлений</p>
                          )}
                        </div>
                      )}
                      
                      <div className="border-t border-border pt-4 px-4">
                        <Link href="/companies" className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors cursor-pointer">
                          <span className="text-sm font-medium">Задачи от компаний</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-xl" data-testid="button-login-header">
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Center Content - F9F9F9 background */}
          <main className="flex-1 p-[15px] lg:p-6 overflow-x-hidden overflow-y-auto bg-[#F9F9F9] pb-24 lg:pb-6 pt-8 lg:pt-6">
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

      {/* Mobile Tab Bar */}
      <MobileTabBar />
    </div>
  );
}
