import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTracks } from "@/hooks/use-data";
import { LucideIcon } from "lucide-react";

export default function Tracks() {
  const { data: tracks, isLoading } = useTracks();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display">Learning Tracks</h1>
          <p className="text-muted-foreground text-sm">Curated paths to master specific topics.</p>
        </div>

        <motion.div 
          className="grid gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
            ))
          ) : (
            tracks?.map((track) => {
              // Dynamically resolve icon component
              const IconComponent = (Icons[track.icon as keyof typeof Icons] || Icons.Code) as LucideIcon;
              
              // Fake progress for visual interest
              const progress = Math.floor(Math.random() * 60) + 10;

              return (
                <Card key={track.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors group cursor-pointer">
                  <div className="h-1.5 w-full bg-muted">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{track.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{track.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{Math.floor(track.problemCount * (progress / 100))}/{track.problemCount} completed</span>
                      <span>{progress}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
