import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, TrendingDown, Minus, Calendar, Crown, Medal, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { ViralProduct } from "@/hooks/useViralProducts";

type Period = "today" | "week";

interface RankingEntry {
  product: ViralProduct;
  currentRank: number;
  previousRank: number | null;
  rankChange: number | null;
  trendingScore: number;
}

function useRankingData(period: Period) {
  return useQuery({
    queryKey: ["product-ranking", period],
    queryFn: async () => {
      const { data: topProducts, error: prodError } = await supabase
        .from("viral_products")
        .select("*")
        .order("trending_score", { ascending: false })
        .limit(10);

      if (prodError) throw prodError;
      if (!topProducts || topProducts.length === 0) return [];

      const compareDate = period === "today"
        ? format(subDays(new Date(), 1), "yyyy-MM-dd")
        : format(subDays(new Date(), 7), "yyyy-MM-dd");

      const { data: previousRanking } = await supabase
        .from("product_ranking_history")
        .select("product_id, rank_position")
        .eq("snapshot_date", compareDate);

      const prevMap = new Map(
        (previousRanking || []).map((r) => [r.product_id, r.rank_position])
      );

      return topProducts.map((product, index): RankingEntry => {
        const currentRank = index + 1;
        const previousRank = prevMap.get(product.id) ?? null;
        const rankChange = previousRank !== null ? previousRank - currentRank : null;

        return {
          product,
          currentRank,
          previousRank,
          rankChange,
          trendingScore: Number(product.trending_score) || 0,
        };
      });
    },
  });
}

const podiumIcons = [Crown, Medal, Award];
const podiumColors = [
  "text-yellow-400",
  "text-gray-300",
  "text-amber-600",
];

const RankingTab = () => {
  const [period, setPeriod] = useState<Period>("today");
  const { data: ranking = [], isLoading } = useRankingData(period);

  const maxScore = useMemo(
    () => Math.max(...ranking.map((r) => r.trendingScore), 1),
    [ranking]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Ranking de Produtos Virais</h2>
            <p className="text-xs text-muted-foreground">
              Top 10 produtos com maior trending score
            </p>
          </div>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="today" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Diário
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Semanal
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-16 glass rounded-xl">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Nenhum ranking disponível</h3>
          <p className="text-sm text-muted-foreground">
            Execute o scraping para começar a gerar rankings de produtos
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {ranking.map((entry, i) => {
              const PodiumIcon = i < 3 ? podiumIcons[i] : null;
              const barWidth = (entry.trendingScore / maxScore) * 100;

              return (
                <motion.div
                  key={entry.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass rounded-xl p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors ${
                    i < 3 ? "border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg"
                    style={{
                      background: i === 0
                        ? "linear-gradient(135deg, hsl(45 90% 50%), hsl(35 90% 40%))"
                        : i === 1
                        ? "linear-gradient(135deg, hsl(0 0% 70%), hsl(0 0% 50%))"
                        : i === 2
                        ? "linear-gradient(135deg, hsl(25 70% 45%), hsl(25 60% 35%))"
                        : "hsl(var(--secondary))",
                      color: i < 3 ? "hsl(220 20% 4%)" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {entry.currentRank}
                  </div>

                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-secondary">
                    {entry.product.product_image ? (
                      <img
                        src={entry.product.product_image}
                        alt={entry.product.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {PodiumIcon ? <PodiumIcon className={`w-5 h-5 ${podiumColors[i]}`} /> : <TrendingUp className="w-4 h-4" />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{entry.product.product_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {entry.product.category && (
                        <Badge variant="outline" className="text-[10px] h-5 border-border">
                          {entry.product.category}
                        </Badge>
                      )}
                      {entry.product.price && (
                        <span className="text-[10px] text-muted-foreground">
                          R$ {Number(entry.product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 w-32">
                    <span className="text-xs font-semibold text-primary">
                      {entry.trendingScore.toFixed(1)}
                    </span>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="w-16 shrink-0 flex items-center justify-end gap-1">
                    {entry.rankChange === null ? (
                      <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                        NOVO
                      </Badge>
                    ) : entry.rankChange > 0 ? (
                      <div className="flex items-center gap-0.5 text-green-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">+{entry.rankChange}</span>
                      </div>
                    ) : entry.rankChange < 0 ? (
                      <div className="flex items-center gap-0.5 text-destructive">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">{entry.rankChange}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 text-muted-foreground">
                        <Minus className="w-3.5 h-3.5" />
                        <span className="text-xs">—</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground glass rounded-lg px-4 py-2">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span>Subiu posições</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-destructive" />
          <span>Caiu posições</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus className="w-3 h-3" />
          <span>Mesma posição</span>
        </div>
        <span className="ml-auto">
          Comparando com {period === "today" ? "ontem" : "semana passada"}
        </span>
      </div>
    </div>
  );
};

export default RankingTab;
