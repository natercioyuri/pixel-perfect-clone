import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type ViralProduct = Tables<"viral_products">;
export type ViralVideo = Tables<"viral_videos">;

export function useViralProducts(options?: {
  category?: string;
  sortBy?: "trending" | "revenue" | "views";
  search?: string;
}) {
  const { category, sortBy = "trending", search } = options || {};

  return useQuery({
    queryKey: ["viral-products", category, sortBy, search],
    queryFn: async () => {
      let query = supabase
        .from("viral_products")
        .select("*");

      if (category && category !== "Todos") {
        query = query.eq("category", category);
      }

      if (search) {
        query = query.ilike("product_name", `%${search}%`);
      }

      if (sortBy === "trending") {
        query = query.order("trending_score", { ascending: false });
      } else if (sortBy === "revenue") {
        query = query.order("revenue", { ascending: false, nullsFirst: false });
      } else {
        query = query.order("video_views", { ascending: false, nullsFirst: false });
      }

      query = query.limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return data as ViralProduct[];
    },
  });
}

export function useViralVideos(options?: {
  sortBy?: "trending" | "revenue" | "views";
  search?: string;
}) {
  const { sortBy = "trending", search } = options || {};

  return useQuery({
    queryKey: ["viral-videos", sortBy, search],
    queryFn: async () => {
      let query = supabase
        .from("viral_videos")
        .select("*");

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      if (sortBy === "trending") {
        query = query.order("trending_score", { ascending: false });
      } else if (sortBy === "revenue") {
        query = query.order("revenue_estimate", { ascending: false, nullsFirst: false });
      } else {
        query = query.order("views", { ascending: false, nullsFirst: false });
      }

      query = query.limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return data as ViralVideo[];
    },
  });
}

export function useProductStats() {
  return useQuery({
    queryKey: ["product-stats"],
    queryFn: async () => {
      const [productsRes, videosRes] = await Promise.all([
        supabase.from("viral_products").select("id, revenue, trending_score", { count: "exact" }),
        supabase.from("viral_videos").select("id", { count: "exact" }),
      ]);

      const productCount = productsRes.count || 0;
      const videoCount = videosRes.count || 0;

      const totalRevenue = (productsRes.data || []).reduce(
        (sum, p) => sum + (Number(p.revenue) || 0),
        0
      );

      const trendingToday = (productsRes.data || []).filter(
        (p) => Number(p.trending_score) > 80
      ).length;

      return {
        productCount,
        videoCount,
        totalRevenue,
        trendingToday,
      };
    },
  });
}

export function useScrapeProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params?: { query?: string; category?: string }) => {
      const { data, error } = await supabase.functions.invoke("scrape-tiktok-products", {
        body: params || {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["viral-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      toast({
        title: "Scraping concluído!",
        description: data.message || "Produtos atualizados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro no scraping",
        description: error instanceof Error ? error.message : "Falha ao buscar produtos",
        variant: "destructive",
      });
    },
  });
}

export function useScrapeVideos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params?: { query?: string }) => {
      const { data, error } = await supabase.functions.invoke("scrape-tiktok-videos", {
        body: params || {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["viral-videos"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      toast({
        title: "Scraping de vídeos concluído!",
        description: data.message || "Vídeos atualizados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro no scraping",
        description: error instanceof Error ? error.message : "Falha ao buscar vídeos",
        variant: "destructive",
      });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viral_products")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      const uniqueCategories = [...new Set((data || []).map((d) => d.category).filter(Boolean))];
      return ["Todos", ...uniqueCategories.sort()] as string[];
    },
  });
}

export function useTranscribeVideo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const { data, error } = await supabase.functions.invoke("transcribe-videos", {
        body: { video_id: videoId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viral-videos"] });
      toast({
        title: "Transcrição gerada!",
        description: "A transcrição do vídeo foi gerada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na transcrição",
        description: error instanceof Error ? error.message : "Falha ao transcrever vídeo",
        variant: "destructive",
      });
    },
  });
}

export function useTranscribeAll() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (limit?: number) => {
      const { data, error } = await supabase.functions.invoke("transcribe-videos", {
        body: { limit: limit || 10 },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["viral-videos"] });
      toast({
        title: "Transcrição em lote concluída!",
        description: data.message || "Vídeos transcritos com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na transcrição",
        description: error instanceof Error ? error.message : "Falha ao transcrever vídeos",
        variant: "destructive",
      });
    },
  });
}
