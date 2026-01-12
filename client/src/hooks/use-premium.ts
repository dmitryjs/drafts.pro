import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export function usePremium() {
  const { user } = useAuth();

  const { data: premiumStatus } = useQuery<{ isPro: boolean }>({
    queryKey: ['/api/premium/check', user?.id],
    queryFn: async () => {
      if (!user?.id) return { isPro: false };
      const response = await fetch(`/api/premium/check?userId=${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) return { isPro: false };
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  return {
    isPro: premiumStatus?.isPro ?? false,
    isLoading: !user || !premiumStatus,
  };
}
