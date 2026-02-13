import { ShoppingCart, Video, BarChart3, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  productCount: number;
  videoCount: number;
  totalRevenue: number;
  trendingToday: number;
  isLoading: boolean;
}

const formatRevenue = (n: number) => {
  if (n >= 1000000) return `R$ ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(1)}K`;
  return `R$ ${n}`;
};

const StatsCards = ({ productCount, videoCount, totalRevenue, trendingToday, isLoading }: StatsCardsProps) => {
  const stats = [
    { label: "Produtos Rastreados", value: productCount.toLocaleString("pt-BR"), icon: ShoppingCart, change: "+12%" },
    { label: "Vídeos Analisados", value: videoCount.toLocaleString("pt-BR"), icon: Video, change: "+8%" },
    { label: "Receita Total", value: formatRevenue(totalRevenue), icon: BarChart3, change: "+23%" },
    { label: "Trending Hoje", value: trendingToday.toString(), icon: Flame, change: "+45%" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-xl p-4">
            <Skeleton className="h-5 w-5 mb-2" />
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <stat.icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-primary font-semibold">{stat.change}</span>
          </div>
          <p className="font-display text-2xl font-bold">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
