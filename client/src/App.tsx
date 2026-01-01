import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

import Tasks from "@/pages/Tasks";
import TaskDetail from "@/pages/TaskDetail";
import Auth from "@/pages/Auth";
import Battles from "@/pages/Battles";
import BattleDetail from "@/pages/BattleDetail";
import Assessment from "@/pages/Assessment";
import Mentors from "@/pages/Mentors";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Tasks} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/tasks/:slug" component={TaskDetail} />
      <Route path="/auth" component={Auth} />
      <Route path="/battles" component={Battles} />
      <Route path="/battles/:slug" component={BattleDetail} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/mentors" component={Mentors} />
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
