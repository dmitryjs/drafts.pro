import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Moon, Smartphone, Shield, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your app preferences.</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Appearance</h3>
            <div className="bg-card border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Moon className="w-4 h-4" />
                  </div>
                  <Label className="font-medium">Dark Mode</Label>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notifications</h3>
            <div className="bg-card border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="font-medium block">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Daily reminders & streak alerts</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <Label className="font-medium">Haptic Feedback</Label>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account</h3>
            <div className="bg-card border rounded-xl p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                 <Shield className="mr-2 h-4 w-4" /> Privacy Policy
              </Button>
              <Link href="/auth">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                   <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="text-center pt-8">
            <p className="text-xs text-muted-foreground">CodeMaster v1.0.0</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
