import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProblemCard } from "@/components/ui/problem-card";
import { useProblems } from "@/hooks/use-data";

export default function Problems() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState<string>("All");
  
  const { data: problems, isLoading } = useProblems({ 
    difficulty: difficulty === "All" ? undefined : difficulty 
  });

  const filteredProblems = problems?.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display">Problems</h1>
          <p className="text-muted-foreground text-sm">Sharpen your skills with over 2000+ challenges.</p>
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search problems..." 
              className="pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[140px] rounded-xl border-border/60 bg-card">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        <motion.div 
          className="space-y-3 min-h-[50vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-xl" />
            ))
          ) : filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No problems found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
