import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SubmissionList } from "@/components/ui/submission-list";
import { useSubmissions } from "@/hooks/use-data";
import { Activity, Zap, Award } from "lucide-react";

// Mock data for chart
const activityData = [
  { day: "Mon", solved: 2 },
  { day: "Tue", solved: 5 },
  { day: "Wed", solved: 3 },
  { day: "Thu", solved: 8 },
  { day: "Fri", solved: 4 },
  { day: "Sat", solved: 1 },
  { day: "Sun", solved: 6 },
];

export default function Dashboard() {
  const { data: submissions, isLoading } = useSubmissions();

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your progress and recent activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-card border rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
             <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
               <Award className="w-4 h-4" />
             </div>
             <span className="text-lg font-bold">128</span>
             <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Points</span>
           </div>
           
           <div className="bg-card border rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
             <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
               <Zap className="w-4 h-4" />
             </div>
             <span className="text-lg font-bold">12</span>
             <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Streak</span>
           </div>
           
           <div className="bg-card border rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
             <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
               <Activity className="w-4 h-4" />
             </div>
             <span className="text-lg font-bold">85%</span>
             <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Acceptance</span>
           </div>
        </div>

        {/* Activity Chart */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] w-full pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="solved" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSolved)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Recent Submissions</h2>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <SubmissionList submissions={submissions || []} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
