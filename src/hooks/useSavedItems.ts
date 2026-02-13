import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useSavedItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_items")
        .select("*, viral_products(*), viral_videos(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useSavedItemIds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-item-ids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_items")
        .select("product_id, video_id")
        .eq("user_id", user!.id);

      if (error) throw error;

      const productIds = new Set(data.filter((d) => d.product_id).map((d) => d.product_id!));
      const videoIds = new Set(data.filter((d) => d.video_id).map((d) => d.video_id!));
      return { productIds, videoIds };
    },
  });
}

export function useToggleSave() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, videoId }: { productId?: string; videoId?: string }) => {
      if (!user) throw new Error("Não autenticado");

      // Check if already saved
      let query = supabase.from("saved_items").select("id").eq("user_id", user.id);
      if (productId) query = query.eq("product_id", productId);
      if (videoId) query = query.eq("video_id", videoId);

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        const { error } = await supabase.from("saved_items").delete().eq("id", existing.id);
        if (error) throw error;
        return { saved: false };
      } else {
        const { error } = await supabase.from("saved_items").insert({
          user_id: user.id,
          product_id: productId || null,
          video_id: videoId || null,
        });
        if (error) throw error;
        return { saved: true };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved-items"] });
      queryClient.invalidateQueries({ queryKey: ["saved-item-ids"] });
      toast({
        title: data.saved ? "Salvo!" : "Removido",
        description: data.saved ? "Item adicionado aos salvos." : "Item removido dos salvos.",
      });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar item.", variant: "destructive" });
    },
  });
}
