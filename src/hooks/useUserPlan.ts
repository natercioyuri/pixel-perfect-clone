import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserPlan() {
  const { user } = useAuth();

  return useQuery({
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
}
