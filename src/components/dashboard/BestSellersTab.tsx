import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, TrendingUp, DollarSign, Eye, Package } from "lucide-react";
import ProxiedImage from "./ProxiedImage";
import SaveButton from "./SaveButton";

function useBestSellers() {
  return useQuery({
    queryKey: ["best-sellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viral_products")
        .select("*")
        .not("sales_count", "is", null)
        .order("sales_count", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

const formatNumber = (n: number | null) => {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("pt-BR");
};

const formatCurrency = (n: number | null) => {
  if (!n) return "—";
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const BestSellersTab = () => {
  const { data: products, isLoading } = useBestSellers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Mais Vendidos Recentes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <Skeleton className="w-full h-40" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Mais Vendidos Recentes</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          {products?.length || 0} produtos
        </Badge>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-xl overflow-hidden hover:ring-1 hover:ring-primary/30 transition-all group"
            >
              <div className="relative">
                <div className="w-full h-40 bg-secondary/50 flex items-center justify-center overflow-hidden">
                  <ProxiedImage
                    src={product.product_image}
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackIconSize="w-10 h-10"
                  />
                </div>
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-display font-bold text-xs">
                  #{i + 1}
                </Badge>
                <div className="absolute top-2 right-2">
                  <SaveButton productId={product.id} />
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm font-medium truncate mb-1" title={product.product_name}>
                  {product.product_name}
                </p>

                {product.category && (
                  <Badge variant="outline" className="text-[10px] h-4 mb-3 border-border">
                    {product.category}
                  </Badge>
                )}

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Package className="w-3 h-3" /> Vendas
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {formatNumber(product.sales_count)}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" /> Receita
                    </p>
                    <p className="text-sm font-bold">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" /> Views
                    </p>
                    <p className="text-sm font-bold">
                      {formatNumber(product.video_views)}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Score
                    </p>
                    <p className="text-sm font-bold">
                      {product.trending_score?.toFixed(0) || "—"}
                    </p>
                  </div>
                </div>

                {product.shop_name && (
                  <p className="text-[10px] text-muted-foreground mt-3 truncate">
                    🏪 {product.shop_name}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass rounded-xl">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Nenhum produto com dados de vendas</h3>
          <p className="text-sm text-muted-foreground">
            Os dados de vendas serão exibidos assim que disponíveis.
          </p>
        </div>
      )}
    </div>
  );
};

export default BestSellersTab;
