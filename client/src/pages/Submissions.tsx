import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubmissions } from "@/hooks/use-data";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCode, Clock } from "lucide-react";

export default function Submissions() {
  const { data: submissions, isLoading } = useSubmissions();

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold font-display">My Submissions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your coding progress
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <Card key={submission.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileCode className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Problem #{submission.problemId}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {submission.createdAt
                              ? new Date(submission.createdAt).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        submission.status === "Accepted"
                          ? "default"
                          : submission.status === "Wrong Answer"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        submission.status === "Accepted"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : ""
                      }
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No submissions yet</h3>
              <p className="text-sm text-muted-foreground">
                Start solving problems to see your submissions here.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AppShell>
  );
}
