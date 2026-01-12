// Adapter for backward compatibility with old useAuth hook
// Maps Supabase AuthContext to old API format
import { useAuth as useSupabaseAuth } from "@/contexts/AuthContext";

export function useAuth() {
  const { user, isLoading, signOut } = useSupabaseAuth();

  return {
    user: user ? {
      id: user.id,
      email: user.email,
      // Map Supabase user to old format
    } : null,
    isLoading,
    isAuthenticated: !!user,
    logout: async () => {
      await signOut();
      window.location.href = "/";
    },
  };
}
