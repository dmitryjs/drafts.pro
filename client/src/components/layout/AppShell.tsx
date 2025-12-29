import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Layers, 
  Code, 
  LayoutDashboard, 
  User, 
  Settings,
  LogOut,
  Moon,
  Sun
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
import { useHealth } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function AppShell({ children, hideNav = false }: AppShellProps) {
  const [location] = useLocation();
  const { data: health } = useHealth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/problems", icon: Code, label: "Problems" },
    { href: "/tracks", icon: Layers, label: "Tracks" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Stats" },
  ];

  const isDark = true; // Simplified theme toggle for now

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black flex justify-center w-full">
      {/* Mobile-first centered container */}
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl overflow-hidden flex flex-col border-x border-border/40">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg font-display">
              C
            </div>
            <span className="font-display font-bold text-lg tracking-tight">CodeMaster</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Sun className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/auth">
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 px-4 py-6 scroll-smooth">
          {children}
        </main>

        {/* Bottom Navigation */}
        {!hideNav && (
          <nav className="fixed bottom-0 z-50 w-full max-w-md bg-background/90 backdrop-blur-lg border-t border-border/50 pb-safe">
            <div className="flex items-center justify-around h-16">
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.href} href={item.href} className="w-full">
                    <div className={cn(
                      "flex flex-col items-center justify-center gap-1 h-full w-full py-2 transition-all duration-200 cursor-pointer",
                      isActive 
                        ? "text-primary scale-105" 
                        : "text-muted-foreground hover:text-foreground active:scale-95"
                    )}>
                      <Icon className={cn("h-6 w-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[10px] font-medium">{item.label}</span>
                      {isActive && (
                        <div className="absolute top-0 h-0.5 w-8 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* Health Indicator (Hidden but functionally present for debugging) */}
        {health && (
          <div className="fixed bottom-20 right-4 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] pointer-events-none opacity-50" />
        )}
      </div>
    </div>
  );
}
