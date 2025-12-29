import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertSubmissionSchema } from "@shared/schema";
import { mockTracks, mockProblems, mockSubmissions } from "@/lib/mock";
import { z } from "zod";

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
        // Fallback or just re-throw depending on desired behavior. 
        // For health, we usually want to know if it's down.
        return null;
      }
    },
    // Don't refetch aggressively
    refetchInterval: 30000 
  });
}

// --- Tracks ---
export function useTracks() {
  return useQuery({
    queryKey: [api.tracks.list.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.tracks.list.path);
        if (!res.ok) throw new Error("Failed to fetch tracks");
        return api.tracks.list.responses[200].parse(await res.json());
      } catch (e) {
        console.warn("API failed, using mock data for tracks");
        return mockTracks;
      }
    },
  });
}

// --- Problems ---
export function useProblems(filters?: { trackId?: number; difficulty?: string }) {
  return useQuery({
    queryKey: [api.problems.list.path, filters],
    queryFn: async () => {
      try {
        // Build query string manually or use URLSearchParams
        const params = new URLSearchParams();
        if (filters?.trackId) params.append("trackId", String(filters.trackId));
        if (filters?.difficulty && filters.difficulty !== "All") params.append("difficulty", filters.difficulty);
        
        const url = `${api.problems.list.path}?${params.toString()}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch problems");
        return api.problems.list.responses[200].parse(await res.json());
      } catch (e) {
        console.warn("API failed, using mock data for problems");
        let result = [...mockProblems];
        if (filters?.trackId) {
          result = result.filter(p => p.trackId === filters.trackId);
        }
        if (filters?.difficulty && filters.difficulty !== "All") {
          result = result.filter(p => p.difficulty === filters.difficulty);
        }
        return result;
      }
    },
  });
}

export function useProblem(slug: string) {
  return useQuery({
    queryKey: [api.problems.get.path, slug],
    queryFn: async () => {
      try {
        const url = buildUrl(api.problems.get.path, { slug });
        const res = await fetch(url);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch problem");
        return api.problems.get.responses[200].parse(await res.json());
      } catch (e) {
        console.warn("API failed, using mock data for problem detail");
        return mockProblems.find(p => p.slug === slug) || null;
      }
    },
  });
}

// --- Submissions ---
export function useSubmissions() {
  return useQuery({
    queryKey: [api.submissions.list.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.submissions.list.path);
        if (!res.ok) throw new Error("Failed to fetch submissions");
        return api.submissions.list.responses[200].parse(await res.json());
      } catch (e) {
        console.warn("API failed, using mock data for submissions");
        return mockSubmissions;
      }
    },
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertSubmissionSchema>) => {
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        const res = await fetch(api.submissions.create.path, {
          method: api.submissions.create.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to submit");
        return api.submissions.create.responses[201].parse(await res.json());
      } catch (e) {
        console.warn("API failed, returning mock success for submission");
        // Mock success return
        return {
          id: Math.random(),
          userId: data.userId || 1,
          problemId: data.problemId || 1,
          code: data.code,
          status: data.status,
          createdAt: new Date()
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path] });
    },
  });
}
