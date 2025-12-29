import { useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Send, ChevronRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProblem, useCreateSubmission } from "@/hooks/use-data";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ProblemDetail() {
  const [match, params] = useRoute("/problems/:slug");
  const slug = params?.slug || "";
  const { data: problem, isLoading } = useProblem(slug);
  const { mutate: submit, isPending } = useCreateSubmission();
  const { toast } = useToast();
  
  const [code, setCode] = useState("// Write your solution here\nfunction solution() {\n  \n}");

  const handleSubmit = () => {
    if (!problem) return;
    
    submit({
      userId: 1, // mocked user
      problemId: problem.id,
      code,
      status: Math.random() > 0.5 ? "Accepted" : "Wrong Answer", // Randomize result for demo
    }, {
      onSuccess: (data) => {
        toast({
          title: data.status === "Accepted" ? "Great Job!" : "Not quite right",
          description: data.status === "Accepted" ? "All test cases passed." : "Check your logic and try again.",
          variant: data.status === "Accepted" ? "default" : "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <AppShell hideNav>
        <div className="h-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!problem) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold">Problem not found</h2>
          <Link href="/problems">
            <Button className="mt-4">Back to problems</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/problems">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg line-clamp-1 flex-1">{problem.title}</h1>
          <Badge variant="outline">{problem.difficulty}</Badge>
        </div>

        <Tabs defaultValue="description" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-xl mb-4">
            <TabsTrigger value="description" className="rounded-lg">Description</TabsTrigger>
            <TabsTrigger value="code" className="rounded-lg">Solution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="flex-1 overflow-y-auto pr-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="prose dark:prose-invert prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                
                <h3 className="font-semibold text-foreground mt-6 mb-2">Examples</h3>
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50 font-mono text-xs space-y-2">
                  <div>
                    <span className="text-muted-foreground">Input:</span> nums = [2,7,11,15], target = 9
                  </div>
                  <div>
                    <span className="text-muted-foreground">Output:</span> [0,1]
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mt-6 mb-2">Constraints</h3>
                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                  <li>2 {"<="} nums.length {"<="} 104</li>
                  <li>-109 {"<="} nums[i] {"<="} 109</li>
                  <li>-109 {"<="} target {"<="} 109</li>
                </ul>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 flex flex-col h-full">
             <div className="relative flex-1 border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card">
               <div className="absolute top-0 left-0 right-0 h-8 bg-muted/30 border-b border-border/50 flex items-center px-3 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                  <span className="ml-2 text-[10px] font-mono text-muted-foreground">JavaScript</span>
               </div>
               <Textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full pt-10 font-mono text-sm resize-none border-none focus-visible:ring-0 bg-transparent"
                spellCheck={false}
               />
             </div>
             
             <div className="mt-4 flex gap-3">
               <Button variant="outline" className="flex-1" onClick={() => console.log('Run tests')}>
                 <Play className="w-4 h-4 mr-2" /> Run
               </Button>
               <Button 
                className="flex-1 bg-primary hover:bg-primary/90" 
                onClick={handleSubmit}
                disabled={isPending}
               >
                 {isPending ? "Evaluating..." : "Submit"} <Send className="w-4 h-4 ml-2" />
               </Button>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
