import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Problem } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProblemCardProps {
  problem: Problem;
  isSolved?: boolean;
}

const difficultyColor = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

export function ProblemCard({ problem, isSolved = false }: ProblemCardProps) {
  return (
    <Link href={`/problems/${problem.slug}`}>
      <Card className="group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden relative">
        {isSolved && (
          <div className="absolute top-0 right-0 p-3">
            <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10" />
          </div>
        )}
        <CardHeader className="p-4 pb-2 space-y-1">
          <div className="flex justify-between items-start">
            <Badge 
              variant="outline" 
              className={cn("text-[10px] uppercase tracking-wider font-bold border", difficultyColor[problem.difficulty as keyof typeof difficultyColor])}
            >
              {problem.difficulty}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-mono">#{problem.order}</span>
          </div>
          <CardTitle className="text-base font-semibold font-display group-hover:text-primary transition-colors line-clamp-1">
            {problem.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md">
            {problem.category}
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
