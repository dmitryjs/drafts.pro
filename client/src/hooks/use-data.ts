import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { mapTaskRow, mapBattleRow } from "@/lib/supabase-helpers";

// --- Health Check ---
export function useHealth() {
  return useQuery({
    queryKey: [api.health.check.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.health.check.path);
        if (!res.ok) throw new Error("Health check failed");
        return api.health.check.responses[200].parse(await res.json());
      } catch (e) {
        return null;
      }
    },
    refetchInterval: 30000 
  });
}

// --- Tasks (Задачи) ---
export function useTasks(filters?: { category?: string; level?: string }) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.level) query = query.eq("level", filters.level);

      // По умолчанию показываем только опубликованные задачи
      query = query.eq("status", "published");

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(mapTaskRow);
    },
  });
}

export function useTask(slug: string) {
  return useQuery({
    queryKey: ["task", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return mapTaskRow(data);
    },
    enabled: !!slug,
  });
}

// --- Battles (Дизайн батлы) ---
export function useBattles(filters?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: ["battles", filters],
    queryFn: async () => {
      let query = supabase
        .from("battles")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.category) query = query.eq("category", filters.category);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(mapBattleRow);
    },
  });
}

export function useBattle(slug: string) {
  return useQuery({
    queryKey: ["battle", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("battles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return mapBattleRow(data);
    },
    enabled: !!slug,
  });
}

// --- Mentors (Менторы) ---
export function useMentors(filters?: { specialization?: string; isAvailable?: boolean }) {
  return useQuery({
    queryKey: [api.mentors.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.specialization) params.append("specialization", filters.specialization);
      if (filters?.isAvailable !== undefined) params.append("isAvailable", String(filters.isAvailable));
      
      const url = `${api.mentors.list.path}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch mentors");
      return await res.json();
    },
  });
}

export function useMentor(slug: string) {
  return useQuery({
    queryKey: [api.mentors.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.mentors.get.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch mentor");
      return await res.json();
    },
    enabled: !!slug,
  });
}

// --- Skill Assessment (Оценка навыков) ---
export function useAssessment(userId: number) {
  return useQuery({
    queryKey: [api.assessments.get.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.assessments.get.path, { userId });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch assessment");
      return await res.json();
    },
    enabled: !!userId,
  });
}

// --- Task Solutions (Решения) ---
export function useUserSolutions(userId: number) {
  return useQuery({
    queryKey: [api.taskSolutions.listByUser.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.taskSolutions.listByUser.path, { userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch solutions");
      return await res.json();
    },
    enabled: !!userId,
  });
}

// --- Task Interactions (Likes/Dislikes/Bookmarks) ---
export function useTaskInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, action }: { taskId: number; action: 'upvote' | 'downvote' | 'bookmark' }) => {
      const res = await fetch(`/api/tasks/${taskId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to interact with task");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
  });
}
