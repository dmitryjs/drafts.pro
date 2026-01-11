import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Building2, Briefcase } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const countryFlags: Record<string, string> = {
  "RU": "🇷🇺",
  "BY": "🇧🇾",
  "UA": "🇺🇦",
  "KZ": "🇰🇿",
  "UZ": "🇺🇿",
  "US": "🇺🇸",
  "GB": "🇬🇧",
  "DE": "🇩🇪",
};

const getLevelColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "intern": return "text-gray-500";
    case "junior": return "text-green-600";
    case "middle": return "text-blue-600";
    case "senior": return "text-purple-600";
    case "lead": return "text-orange-600";
    default: return "text-gray-600";
  }
};

const getCategoryDot = (category: string) => {
  switch (category) {
    case "Продукт": return "bg-purple-500";
    case "Графический": return "bg-blue-500";
    case "UX/UI": return "bg-green-500";
    case "3D": return "bg-orange-500";
    case "Кейсы": return "bg-pink-500";
    default: return "bg-gray-500";
  }
};

export default function CompanyProfile() {
  const [, params] = useRoute("/companies/:slug");
  const slug = params?.slug || "";

  const { data: company, isLoading: companyLoading } = useQuery<any>({
    queryKey: ["/api/companies", slug],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${slug}`);
      if (!res.ok) throw new Error("Company not found");
      return res.json();
    },
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/companies", slug, "tasks"],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${slug}/tasks`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!company,
  });

  if (companyLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6030]" />
        </div>
      </MainLayout>
    );
  }

  if (!company) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">Компания не найдена</h1>
          <Link href="/">
            <span className="text-[#FF6030] hover:underline cursor-pointer">Вернуться на главную</span>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const flagEmoji = company.country ? countryFlags[company.country] || "" : "";

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <button 
              className="h-9 w-9 rounded-full flex items-center justify-center bg-[#E8E8EE] hover:bg-[#DCDCE4] transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 text-[#1D1D1F]" />
            </button>
          </Link>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-start gap-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: company.logoUrl ? 'transparent' : '#FF6030' }}
            >
              {company.logoUrl ? (
                <img 
                  src={company.logoUrl} 
                  alt={company.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                company.name?.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2" data-testid="text-company-name">
                {company.name}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {company.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {flagEmoji} {company.country === "RU" ? "Россия" : company.country}
                  </span>
                )}
                {company.industry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {company.industry}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {tasks.length} задач
                </span>
              </div>
              
              {company.description && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Задачи от компании</h2>
        </div>

        {tasksLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6030]" />
          </div>
        ) : tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">У этой компании пока нет задач</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task: any) => (
              <Link key={task.id} href={`/tasks/${task.slug}`}>
                <Card 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`card-task-${task.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("w-2 h-2 rounded-full", getCategoryDot(task.category))} />
                        <span className="text-xs text-muted-foreground">{task.category}</span>
                        <Badge variant="outline" className={cn("text-xs", getLevelColor(task.level))}>
                          {task.level}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-[#1D1D1F] truncate">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{task.solutionsCount || 0} решений</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
