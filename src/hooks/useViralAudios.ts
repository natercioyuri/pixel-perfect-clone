import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ViralAudio = {
  id: string;
  audio_name: string;
  author_name: string | null;
  tiktok_audio_id: string | null;
  audio_url: string | null;
  cover_image: string | null;
  duration_seconds: number | null;
  usage_count: number | null;
  video_count: number | null;
  trending_score: number | null;
  is_shop_approved: boolean;
  category: string | null;
  genre: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export function useViralAudios(options?: {
  sortBy?: "trending" | "usage" | "recent";
  search?: string;
  genre?: string;
}) {
  const { sortBy = "trending", search, genre } = options || {};

  return useQuery({
    queryKey: ["viral-audios", sortBy, search, genre],
    queryFn: async () => {
      let query = supabase
        .from("viral_audios")
        .select("*")
        .eq("is_shop_approved", true);

      if (search) {
        query = query.or(`audio_name.ilike.%${search}%,author_name.ilike.%${search}%`);
      }

      if (genre && genre !== "Todos") {
        query = query.eq("genre", genre);
      }

      if (sortBy === "trending") {
        query = query.order("trending_score", { ascending: false });
      } else if (sortBy === "usage") {
        query = query.order("usage_count", { ascending: false, nullsFirst: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      query = query.limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return data as ViralAudio[];
    },
  });
}

export function useAudioGenres() {
  return useQuery({
    queryKey: ["audio-genres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viral_audios")
        .select("genre")
        .eq("is_shop_approved", true)
        .not("genre", "is", null);

      if (error) throw error;

      const unique = [...new Set((data || []).map((d: any) => d.genre).filter(Boolean))];
      return ["Todos", ...unique.sort()] as string[];
    },
  });
}
