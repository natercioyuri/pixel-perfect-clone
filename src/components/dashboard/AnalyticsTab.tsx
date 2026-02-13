import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Users, DollarSign, Eye } from "lucide-react";
import type { ViralProduct, ViralVideo } from "@/hooks/useViralProducts";

interface AnalyticsTabProps {
  products: ViralProduct[];
  videos: ViralVideo[];
}

const COLORS = ["hsl(142, 76%, 50%)", "hsl(142, 76%, 40%)", "hsl(142, 76%, 30%)", "hsl(200, 60%, 50%)", "hsl(40, 80%, 50%)", "hsl(0, 60%, 50%)", "hsl(280, 60%, 50%)", "hsl(180, 50%, 45%)"];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(n);

const formatNumber = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const AnalyticsTab = ({ products, videos }: AnalyticsTabProps) => {
  const categoryData = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number; views: number }>();
    products.forEach((p) => {
      const cat = p.category || "Sem categoria";
      const cur = map.get(cat) || { count: 0, revenue: 0, views: 0 };
      cur.count++;
      cur.revenue += Number(p.revenue) || 0;
      cur.views += Number(p.video_views) || 0;
      map.set(cat, cur);
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [products]);

  const topCreators = useMemo(() => {
    const map = new Map<string, { videos: number; totalViews: number; totalLikes: number }>();
    videos.forEach((v) => {
      const name = v.creator_name || "Desconhecido";
      const cur = map.get(name) || { videos: 0, totalViews: 0, totalLikes: 0 };
      cur.videos++;
      cur.totalViews += Number(v.views) || 0;
      cur.totalLikes += Number(v.likes) || 0;
      map.set(name, cur);
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, ...d }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10);
  }, [videos]);

  const engagementDistribution = useMemo(() => {
    const buckets = [
      { name: "0-1%", min: 0, max: 1, count: 0 },
      { name: "1-3%", min: 1, max: 3, count: 0 },
      { name: "3-5%", min: 3, max: 5, count: 0 },
      { name: "5-10%", min: 5, max: 10, count: 0 },
      { name: "10%+", min: 10, max: Infinity, count: 0 },
    ];
    videos.forEach((v) => {
      const rate = Number(v.engagement_rate) || 0;
      const bucket = buckets.find((b) => rate >= b.min && rate < b.max);
      if (bucket) bucket.count++;
    });
    return buckets;
  }, [videos]);

  const trendingScoreDistribution = useMemo(() => {
    const buckets = [
      { name: "0-20", min: 0, max: 20, products: 0, videos: 0 },
      { name: "20-40", min: 20, max: 40, products: 0, videos: 0 },
      { name: "40-60", min: 40, max: 60, products: 0, videos: 0 },
      { name: "60-80", min: 60, max: 80, products: 0, videos: 0 },
      { name: "80-100", min: 80, max: 100, products: 0, videos: 0 },
    ];
    products.forEach((p) => {
      const score = Number(p.trending_score) || 0;
      const bucket = buckets.find((b) => score >= b.min && score < b.max);
      if (bucket) bucket.products++;
    });
    videos.forEach((v) => {
      const score = Number(v.trending_score) || 0;
      const bucket = buckets.find((b) => score >= b.min && score < b.max);
      if (bucket) bucket.videos++;
    });
    return buckets;
  }, [products, videos]);

  const totalRevenue = products.reduce((s, p) => s + (Number(p.revenue) || 0), 0);
  const totalViews = videos.reduce((s, v) => s + (Number(v.views) || 0), 0);
  const avgEngagement = videos.length
    ? videos.reduce((s, v) => s + (Number(v.engagement_rate) || 0), 0) / videos.length
    : 0;
  const uniqueCreators = new Set(videos.map((v) => v.creator_name).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Receita Total", value: formatCurrency(totalRevenue), icon: DollarSign },
          { label: "Views Totais", value: formatNumber(totalViews), icon: Eye },
          { label: "Engajamento Médio", value: avgEngagement.toFixed(1) + "%", icon: TrendingUp },
          { label: "Criadores Únicos", value: uniqueCreators.toString(), icon: Users },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-sm mb-4">Receita por Categoria</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-sm mb-4">Distribuição por Categoria</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={10}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-sm mb-4">Top Criadores por Views</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCreators} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={formatNumber} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip formatter={(v: number) => formatNumber(v)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="totalViews" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-sm mb-4">Distribuição de Trending Score</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendingScoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="products" name="Produtos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="videos" name="Vídeos" fill="hsl(200, 60%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-4 md:col-span-2">
          <h3 className="font-display font-semibold text-sm mb-4">Distribuição de Engajamento dos Vídeos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={engagementDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="count" name="Vídeos" fill="hsl(142, 76%, 40%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
