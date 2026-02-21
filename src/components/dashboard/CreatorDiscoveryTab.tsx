import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Eye, Heart, Share2, TrendingUp, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CreatorDetailDialog from "./CreatorDetailDialog";

interface CreatorData {
  name: string;
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgEngagement: number;
  avgTrending: number;
  topHashtags: string[];
}

function useCreatorDiscovery() {
  return useQuery({
    queryKey: ["creator-discovery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viral_videos")
        .select("creator_name, views, likes, shares, engagement_rate, trending_score, hashtags");

      if (error) throw error;
      if (!data) return [];

      const creatorMap = new Map<string, {
        count: number;
        views: number;
        likes: number;
        shares: number;
        engagement: number[];
        trending: number[];
        hashtags: Set<string>;
      }>();

      for (const v of data) {
        const name = v.creator_name || "Desconhecido";
        if (name === "Desconhecido") continue;
        const existing = creatorMap.get(name) || {
          count: 0,
          views: 0,
          likes: 0,
          shares: 0,
          engagement: [],
          trending: [],
          hashtags: new Set<string>(),
        };
        existing.count++;
        existing.views += Number(v.views) || 0;
        existing.likes += Number(v.likes) || 0;
        existing.shares += Number(v.shares) || 0;
        if (v.engagement_rate) existing.engagement.push(Number(v.engagement_rate));
        if (v.trending_score) existing.trending.push(Number(v.trending_score));
        if (v.hashtags) v.hashtags.slice(0, 5).forEach((h) => existing.hashtags.add(h));
        creatorMap.set(name, existing);
      }

      const creators: CreatorData[] = Array.from(creatorMap.entries())
        .map(([name, d]) => ({
          name,
          videoCount: d.count,
          totalViews: d.views,
          totalLikes: d.likes,
          totalShares: d.shares,
          avgEngagement: d.engagement.length
            ? d.engagement.reduce((a, b) => a + b, 0) / d.engagement.length
            : 0,
          avgTrending: d.trending.length
            ? d.trending.reduce((a, b) => a + b, 0) / d.trending.length
            : 0,
          topHashtags: Array.from(d.hashtags).slice(0, 4),
        }))
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 20);

      return creators;
    },
  });
}

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const CreatorDiscoveryTab = () => {
  const { data: creators = [], isLoading } = useCreatorDiscovery();
  const [selectedCreator, setSelectedCreator] = useState<{ data: CreatorData; rank: number } | null>(null);

  const maxViews = useMemo(
    () => Math.max(...creators.map((c) => c.totalViews), 1),
    [creators]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Descoberta de Criadores</h2>
          <p className="text-xs text-muted-foreground">
            Top criadores do TikTok por alcance e engajamento
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-16 glass rounded-xl">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Sem dados de criadores</h3>
          <p className="text-sm text-muted-foreground">
            Execute o scraping de vídeos para descobrir criadores
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {creators.map((creator, i) => {
              const barWidth = (creator.totalViews / maxViews) * 100;
              return (
                <motion.div
                  key={creator.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedCreator({ data: creator, rank: i })}
                  className={`glass rounded-xl p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                    i < 3 ? "border-l-2 border-l-purple-400" : ""
                  }`}
                >
                  {/* Avatar placeholder */}
                  <div
                    className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg"
                    style={{
                      background: `hsl(${(i * 40 + 260) % 360} 60% 30%)`,
                      color: `hsl(${(i * 40 + 260) % 360} 60% 80%)`,
                    }}
                  >
                    {creator.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{creator.name.startsWith("@") ? creator.name : `@${creator.name}`}</p>
                      {i < 3 && (
                        <Badge className="text-[10px] bg-purple-500/20 text-purple-300 hover:bg-purple-500/20">
                          TOP {i + 1}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Video className="w-3 h-3" /> {creator.videoCount} vídeos
                      </span>
                      {creator.topHashtags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] h-4 border-border">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">Views</p>
                      <p className="text-xs font-bold flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {formatNumber(creator.totalViews)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">Likes</p>
                      <p className="text-xs font-bold flex items-center gap-0.5">
                        <Heart className="w-3 h-3" />
                        {formatNumber(creator.totalLikes)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">Shares</p>
                      <p className="text-xs font-bold flex items-center gap-0.5">
                        <Share2 className="w-3 h-3" />
                        {formatNumber(creator.totalShares)}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 w-28">
                    <span className="text-[10px] text-muted-foreground">Alcance</span>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-purple-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ delay: i * 0.04 + 0.2, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <CreatorDetailDialog
        open={!!selectedCreator}
        onOpenChange={(open) => !open && setSelectedCreator(null)}
        creator={selectedCreator?.data ?? null}
        rank={selectedCreator?.rank ?? 0}
      />
    </div>
  );
};

export default CreatorDiscoveryTab;
