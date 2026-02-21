import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, TrendingUp, ShoppingBag, DollarSign, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ShopDetailDialog from "./ShopDetailDialog";

interface ShopData {
  shop_name: string;
  productCount: number;
  totalRevenue: number;
  totalViews: number;
  avgTrending: number;
  topCategories: string[];
  shop_url?: string;
}

function useShopAnalysis() {
  return useQuery({
    queryKey: ["shop-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viral_products")
        .select("shop_name, shop_url, revenue, video_views, trending_score, category");

      if (error) throw error;
      if (!data) return [];

      const shopMap = new Map<string, {
        count: number;
        revenue: number;
        views: number;
        trending: number[];
        categories: Set<string>;
        shop_url?: string;
      }>();

      for (const p of data) {
        const name = p.shop_name || "Desconhecida";
        const existing = shopMap.get(name) || {
          count: 0,
          revenue: 0,
          views: 0,
          trending: [],
          categories: new Set<string>(),
        };
        existing.count++;
        existing.revenue += Number(p.revenue) || 0;
        existing.views += Number(p.video_views) || 0;
        existing.trending.push(Number(p.trending_score) || 0);
        if (p.category) existing.categories.add(p.category);
        if (p.shop_url && !existing.shop_url) existing.shop_url = p.shop_url;
        shopMap.set(name, existing);
      }

      const shops: ShopData[] = Array.from(shopMap.entries())
        .map(([name, data]) => ({
          shop_name: name,
          productCount: data.count,
          totalRevenue: data.revenue,
          totalViews: data.views,
          avgTrending: data.trending.reduce((a, b) => a + b, 0) / data.trending.length,
          topCategories: Array.from(data.categories).slice(0, 3),
          shop_url: data.shop_url,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 20);

      return shops;
    },
  });
}

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(1)}K`;
  return `R$ ${n.toFixed(0)}`;
};

const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const ShopAnalysisTab = () => {
  const { data: shops = [], isLoading } = useShopAnalysis();
  const [selectedShop, setSelectedShop] = useState<{ data: ShopData; rank: number } | null>(null);

  const maxRevenue = useMemo(
    () => Math.max(...shops.map((s) => s.totalRevenue), 1),
    [shops]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Store className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Análise de Lojas</h2>
          <p className="text-xs text-muted-foreground">
            Top lojas do TikTok Shop por receita estimada
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16 glass rounded-xl">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Sem dados de lojas</h3>
          <p className="text-sm text-muted-foreground">
            Execute o scraping para popular os dados de lojas
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {shops.map((shop, i) => {
              const barWidth = (shop.totalRevenue / maxRevenue) * 100;
              return (
                <motion.div
                  key={shop.shop_name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedShop({ data: shop, rank: i })}
                  className={`glass rounded-xl p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                    i < 3 ? "border-l-2 border-l-blue-400" : ""
                  }`}
                >
                  <div
                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-sm"
                    style={{
                      background: i < 3 ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                      color: i < 3 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{shop.shop_name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <ShoppingBag className="w-3 h-3" /> {shop.productCount} produtos
                      </span>
                      {shop.topCategories.map((cat) => (
                        <Badge key={cat} variant="outline" className="text-[10px] h-4 border-border">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Receita</p>
                      <p className="text-sm font-bold text-primary flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        {formatNumber(shop.totalRevenue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="text-sm font-semibold flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {formatViews(shop.totalViews)}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 w-28">
                    <span className="text-[10px] text-muted-foreground">Trending</span>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-400 rounded-full"
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

      <ShopDetailDialog
        open={!!selectedShop}
        onOpenChange={(open) => !open && setSelectedShop(null)}
        shop={selectedShop?.data ?? null}
        rank={selectedShop?.rank ?? 0}
      />
    </div>
  );
};

export default ShopAnalysisTab;
