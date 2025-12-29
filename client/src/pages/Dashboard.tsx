import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award, Target, TrendingUp } from "lucide-react";

const activityData = [
  { day: "Пн", solved: 2 },
  { day: "Вт", solved: 5 },
  { day: "Ср", solved: 3 },
  { day: "Чт", solved: 8 },
  { day: "Пт", solved: 4 },
  { day: "Сб", solved: 1 },
  { day: "Вс", solved: 6 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Статистика</h1>
          <p className="text-muted-foreground text-sm">Ваш прогресс и активность</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
            <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold">12</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Задач</span>
          </div>
           
          <div className="bg-card border rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold">3</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Батла</span>
          </div>
           
          <div className="bg-card border rounded-2xl p-3 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold">Middle</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold">Уровень</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Активность за неделю</CardTitle>
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
      </motion.div>
    </div>
  );
}
