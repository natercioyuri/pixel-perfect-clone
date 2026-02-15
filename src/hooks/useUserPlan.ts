import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserPlan() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["user-plan", user?.id],
    queryFn: async () => {
      if (!user) return "free";
      const { data, error } = await supabase
        .from("profiles")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) return "free";
      return data.plan;
    },
    enabled: !!user,
  });

  // Also check stripe subscription on mount and periodically
  useQuery({
    queryKey: ["check-subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        const { data, error } = await supabase.functions.invoke("check-subscription");
        if (error || data?.error) return null;
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!user,
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: true,
  });

  return profileQuery;
}
