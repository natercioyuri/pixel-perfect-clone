import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PriceHistoryChart = () => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["product-ranking-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_ranking_history")
        .select("*, viral_products(product_name)")
        .order("snapshot_date", { ascending: true })
        .limit(200);

      if (error) throw error;
      return data;
    },
  });

  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, any>>();
    
    for (const entry of history) {
      const date = entry.snapshot_date;
      const existing = dateMap.get(date) || { date };
      const productName = (entry as any).viral_products?.product_name || `#${entry.rank_position}`;
      const shortName = productName.length > 20 ? productName.slice(0, 20) + "…" : productName;
      existing[shortName] = Number(entry.trending_score) || 0;
      dateMap.set(date, existing);
    }

    return Array.from(dateMap.values());
  }, [history]);

  const productNames = useMemo(() => {
    const names = new Set<string>();
    chartData.forEach((d) => {
      Object.keys(d).forEach((k) => {
        if (k !== "date") names.add(k);
      });
    });
    return Array.from(names).slice(0, 5);
  }, [chartData]);

  const COLORS = ["hsl(145, 80%, 50%)", "hsl(200, 70%, 50%)", "hsl(280, 70%, 60%)", "hsl(40, 80%, 50%)", "hsl(0, 60%, 50%)"];

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-display font-semibold mb-1">Sem histórico de tendências</h3>
        <p className="text-sm text-muted-foreground">
          O histórico será gerado automaticamente conforme novos dados forem coletados.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-sm">Evolução de Trending Score</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
          />
          <Legend />
          {productNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;
