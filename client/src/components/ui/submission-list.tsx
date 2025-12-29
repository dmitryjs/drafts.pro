import { format } from "date-fns";
import { Check, X, Clock } from "lucide-react";
import type { Submission } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SubmissionListProps {
  submissions: Submission[];
  compact?: boolean;
}

export function SubmissionList({ submissions, compact = false }: SubmissionListProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
        No submissions yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => (
        <div 
          key={sub.id} 
          className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border",
              sub.status === "Accepted" ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" :
              sub.status === "Pending" ? "bg-yellow-100 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400" :
              "bg-red-100 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
            )}>
              {sub.status === "Accepted" ? <Check className="w-4 h-4" /> :
               sub.status === "Pending" ? <Clock className="w-4 h-4" /> :
               <X className="w-4 h-4" />}
            </div>
            
            <div className="flex flex-col">
              <span className={cn(
                "text-sm font-semibold",
                sub.status === "Accepted" ? "text-green-700 dark:text-green-400" : 
                sub.status === "Pending" ? "text-yellow-700 dark:text-yellow-400" : 
                "text-red-700 dark:text-red-400"
              )}>
                {sub.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {sub.createdAt ? format(new Date(sub.createdAt), "MMM d, h:mm a") : 'Just now'}
              </span>
            </div>
          </div>
          
          {!compact && (
             <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                JS
             </div>
          )}
        </div>
      ))}
    </div>
  );
}
