import { Link, useLocation } from "wouter";
import { Plus } from "lucide-react";
import MenuActivityIcon from "@assets/icons/Menu_Activity.svg";
import MenuBattleIcon from "@assets/icons/Menu_Battle.svg";
import MenuNavikiIcon from "@assets/icons/Menu_Naviki.svg";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Profile } from "@shared/schema";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import CreateBattleModal from "@/components/modals/CreateBattleModal";
import { useState, useEffect, useRef } from "react";

const tabItems = [
  { href: "/", icon: MenuActivityIcon, label: "Задачи" },
  { href: "/battles", icon: MenuBattleIcon, label: "Батлы" },
  { href: "/assessment", icon: MenuNavikiIcon, label: "Оценка навыков" },
];

export default function MobileTabBar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState(false);
  const [activeCreateMenu, setActiveCreateMenu] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setActiveCreateMenu(false);
      }
    };

    if (activeCreateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeCreateMenu]);

  const { data: profile } = useQuery<Profile>({
    queryKey: ['/api/profiles', user?.id],
    enabled: !!user?.id,
  });

  const handleCreateClick = () => {
    setActiveCreateMenu(true);
  };

  const handleTaskClick = () => {
    setIsTaskModalOpen(true);
    setActiveCreateMenu(false);
  };

  const handleBattleClick = () => {
    setIsBattleModalOpen(true);
    setActiveCreateMenu(false);
  };

  return (
    <>
      {/* Mobile Tab Bar - только на мобилке */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Tab 1: Задачи */}
          <Link href="/" className="flex-1 min-w-0">
            <div className={cn(
              "flex flex-col items-center justify-center h-full transition-colors",
              (location === "/" || location === "/tasks") 
                ? "text-[#1D1D1F]" 
                : "text-muted-foreground"
            )}>
              <img 
                src={MenuActivityIcon} 
                alt="Задачи"
                className="h-7 w-7"
                style={{ 
                  filter: (location === "/" || location === "/tasks")
                    ? 'brightness(0) saturate(100%) invert(8%) sepia(4%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #141416
                    : 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
                }}
              />
            </div>
          </Link>

          {/* Tab 2: Батлы */}
          <Link href="/battles" className="flex-1 min-w-0">
            <div className={cn(
              "flex flex-col items-center justify-center h-full transition-colors",
              location === "/battles" 
                ? "text-[#1D1D1F]" 
                : "text-muted-foreground"
            )}>
              <img 
                src={MenuBattleIcon} 
                alt="Батлы"
                className="h-7 w-7"
                style={{ 
                  filter: location === "/battles"
                    ? 'brightness(0) saturate(100%) invert(8%) sepia(4%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #141416
                    : 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
                }}
              />
            </div>
          </Link>

          {/* Tab 3: Создать (кружок с плюсиком) */}
          {user ? (
            <div className="relative flex-shrink-0" ref={createMenuRef}>
              <button
                onClick={handleCreateClick}
                className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full bg-[#2D2D2D] text-white transition-colors",
                  activeCreateMenu && "bg-[#3D3D3D]"
                )}
              >
                <Plus className="h-6 w-6" />
              </button>
              {activeCreateMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-border p-2 min-w-[140px] z-50">
                  <button
                    onClick={handleTaskClick}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#E8E8E8] transition-colors text-sm text-left"
                  >
                    <img 
                      src={MenuActivityIcon} 
                      alt="Задача"
                      className="h-4 w-4"
                      style={{ 
                        filter: 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)'
                      }}
                    />
                    Задача
                  </button>
                  <button
                    onClick={handleBattleClick}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#E8E8E8] transition-colors text-sm text-left"
                  >
                    <img 
                      src={MenuBattleIcon} 
                      alt="Батл"
                      className="h-4 w-4"
                      style={{ 
                        filter: 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)'
                      }}
                    />
                    Батл
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="flex-shrink-0">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#2D2D2D] text-white">
                <Plus className="h-6 w-6" />
              </div>
            </Link>
          )}

          {/* Tab 4: Оценка навыков */}
          <Link href="/assessment" className="flex-1 min-w-0">
            <div className={cn(
              "flex flex-col items-center justify-center h-full transition-colors",
              location === "/assessment" 
                ? "text-[#1D1D1F]" 
                : "text-muted-foreground"
            )}>
              <img 
                src={MenuNavikiIcon} 
                alt="Оценка навыков"
                className="h-7 w-7"
                style={{ 
                  filter: location === "/assessment"
                    ? 'brightness(0) saturate(100%) invert(8%) sepia(4%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #141416
                    : 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(95%)' // #979797
                }}
              />
            </div>
          </Link>

          {/* Tab 5: Профиль */}
          <Link href={user ? "/profile" : "/auth"} className="flex-1 min-w-0">
            <div className={cn(
              "flex flex-col items-center justify-center h-full transition-colors",
              location === "/profile" 
                ? "text-[#1D1D1F]" 
                : "text-muted-foreground"
            )}>
              <UserAvatar 
                avatarUrl={profile?.avatarUrl} 
                name={profile?.username || profile?.fullName || user?.email || "?"}
                size="sm"
              />
            </div>
          </Link>
        </div>
      </nav>

      {/* Модалки */}
      <CreateTaskModal 
        open={isTaskModalOpen} 
        onOpenChange={setIsTaskModalOpen} 
      />
      <CreateBattleModal 
        open={isBattleModalOpen} 
        onOpenChange={setIsBattleModalOpen} 
      />
    </>
  );
}
