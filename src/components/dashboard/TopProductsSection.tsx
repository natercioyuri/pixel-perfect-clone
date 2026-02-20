import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Eye, DollarSign } from "lucide-react";
import ProxiedImage from "./ProxiedImage";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function useTopProducts() {
  return useQuery({
    queryKey: ["top-products-explore"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viral_products")
        .select("*")
        .order("trending_score", { ascending: false })
        .limit(20);
      if (error) throw error;
      // Pick 5 random products from top 20 for rotation
      return shuffleArray(data || []).slice(0, 5);
    },
  });
}

const formatNumber = (n: number | null) => {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("pt-BR");
};

const podiumColors = [
  "from-yellow-500/30 to-yellow-600/10 border-yellow-500/40",
  "from-gray-300/20 to-gray-400/5 border-gray-400/30",
  "from-amber-600/20 to-amber-700/5 border-amber-600/30",
  "from-secondary/50 to-secondary/20 border-border",
  "from-secondary/50 to-secondary/20 border-border",
];

const TopProductsSection = () => {
  const { data: products, isLoading } = useTopProducts();

  if (isLoading) {
    return (
      <div>
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" /> Top Produtos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <Skeleton className="w-full h-36" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" /> Top Produtos
        </h2>
        <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl overflow-hidden border bg-gradient-to-b ${podiumColors[i]} hover:scale-[1.02] transition-transform`}
          >
            {/* Rank Badge */}
            <div className="relative">
              <div className="w-full h-36 bg-secondary/50 flex items-center justify-center overflow-hidden">
                <ProxiedImage
                  src={product.product_image}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  fallbackIconSize="w-10 h-10"
                />
              </div>
              <Badge
                className={`absolute top-2 left-2 font-display font-bold text-xs ${
                  i === 0
                    ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-500"
                    : i === 1
                    ? "bg-gray-300 text-gray-800 hover:bg-gray-300"
                    : i === 2
                    ? "bg-amber-600 text-amber-50 hover:bg-amber-600"
                    : "bg-secondary text-muted-foreground hover:bg-secondary"
                }`}
              >
                TOP {i + 1}
              </Badge>
            </div>

            <div className="p-3">
              <p className="text-xs font-medium truncate mb-2" title={product.product_name}>
                {product.product_name}
              </p>

              {product.category && (
                <Badge variant="outline" className="text-[10px] h-4 mb-2 border-border">
                  {product.category}
                </Badge>
              )}

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Receita</p>
                  <p className="text-xs font-bold flex items-center justify-center gap-0.5">
                    <DollarSign className="w-3 h-3" />
                    {formatNumber(product.revenue)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Views</p>
                  <p className="text-xs font-bold flex items-center justify-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {formatNumber(product.video_views)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsSection;
