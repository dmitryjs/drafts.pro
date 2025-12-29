import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Trophy, Flame } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTracks, useProblems } from "@/hooks/use-data";
import { ProblemCard } from "@/components/ui/problem-card";
import { mockProblems } from "@/lib/mock";

export default function Home() {
  const { data: tracks, isLoading: tracksLoading } = useTracks();
  const { data: problems, isLoading: problemsLoading } = useProblems();

  // Get featured problems (just take first 2)
  const featuredProblems = problems ? problems.slice(0, 2) : mockProblems.slice(0, 2);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AppShell>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div variants={item} className="space-y-2">
          <h1 className="text-3xl font-bold font-display leading-tight">
            Ready to <span className="text-primary">level up</span> your coding skills?
          </h1>
          <p className="text-muted-foreground text-lg">
            Pick a track or jump straight into a daily challenge.
          </p>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 border-orange-200/50 dark:border-orange-800/30">
            <CardContent className="p-4 flex flex-col items-start gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold font-display text-orange-700 dark:text-orange-400">12</span>
                <p className="text-xs text-orange-600/80 dark:text-orange-400/70 font-medium">Day Streak</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/30">
            <CardContent className="p-4 flex flex-col items-start gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-bold font-display text-blue-700 dark:text-blue-400">45</span>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/70 font-medium">Problems Solved</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Continue Learning - Call to Action */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/25">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-xl">Daily Challenge</h3>
                <p className="text-primary-foreground/80 text-sm">Solve "Merge k Sorted Lists" to keep your streak alive!</p>
              </div>
              <Link href="/problems/merge-k-sorted-lists">
                <Button variant="secondary" className="w-full font-semibold shadow-sm hover:bg-white/95">
                  Start Coding <Zap className="w-4 h-4 ml-2 text-amber-500 fill-amber-500" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Featured Problems */}
        <motion.div variants={item} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Recommended for you</h2>
            <Link href="/problems">
              <span className="text-sm text-primary font-medium hover:underline cursor-pointer">View all</span>
            </Link>
          </div>
          
          <div className="space-y-3">
            {problemsLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))
            ) : (
              featuredProblems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
