import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Building2, FileText, Swords, ChevronRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import UserAvatar from "@/components/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile, Task, Battle } from "@shared/schema";

interface PublicProfileData {
  profile: Profile;
  tasks: Task[];
  battles: Battle[];
}

export default function UserProfile() {
  const [, params] = useRoute("/users/:id");
  const profileId = params?.id;

  const { data, isLoading, error } = useQuery<PublicProfileData>({
    queryKey: ["/api/profiles", profileId, "public"],
    queryFn: async () => {
      if (!profileId) throw new Error("Profile ID is required");
      const response = await fetch(`/api/profiles/${profileId}/public`);
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!profileId,
  });

  if (!profileId) {
    return (
      <MainLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Профиль не найден</p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="p-6">
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <p className="text-muted-foreground">Профиль не найден</p>
        </div>
      </MainLayout>
    );
  }

  const { profile, tasks, battles } = data;
  const displayName = profile.fullName || profile.username || "Аноним";

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 max-w-4xl"
      >
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к задачам
          </Button>
        </Link>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <UserAvatar 
                avatarUrl={profile.avatarUrl} 
                name={displayName}
                size="xl"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2" data-testid="text-profile-name">
                  {displayName}
                </h1>
                
                {profile.profession && (
                  <p className="text-muted-foreground mb-3">{profile.profession}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profile.company && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p className="mt-4 text-[#1D1D1F]">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Созданные задачи
              <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
            </h2>
            
            {tasks.length > 0 ? (
              <div className="grid gap-3">
                {tasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.slug}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-task-${task.id}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-[#1D1D1F]">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{task.category}</Badge>
                            <Badge variant="outline" className="text-xs">{task.level}</Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Пользователь пока не создал задач
                </CardContent>
              </Card>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
              <Swords className="h-5 w-5" />
              Участие в батлах
              <Badge variant="secondary" className="ml-2">{battles.length}</Badge>
            </h2>
            
            {battles.length > 0 ? (
              <div className="grid gap-3">
                {battles.map((battle) => (
                  <Link key={battle.id} href={`/battles/${battle.slug || battle.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-battle-${battle.id}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-[#1D1D1F]">{battle.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{battle.category}</Badge>
                            <Badge 
                              className={
                                battle.status === "active" ? "bg-green-100 text-green-700" :
                                battle.status === "voting" ? "bg-amber-100 text-amber-700" :
                                battle.status === "finished" ? "bg-gray-100 text-gray-700" :
                                "bg-blue-100 text-blue-700"
                              }
                            >
                              {battle.status === "active" ? "Активен" :
                               battle.status === "voting" ? "Голосование" :
                               battle.status === "finished" ? "Завершён" :
                               battle.status === "upcoming" ? "Скоро" :
                               battle.status}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Пользователь пока не участвовал в батлах
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </motion.div>
    </MainLayout>
  );
}
