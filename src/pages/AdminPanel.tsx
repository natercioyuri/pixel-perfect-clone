import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Zap, Users, ShoppingCart, Video, Settings, LogOut,
  Trash2, RefreshCw, Shield, Search, BarChart3, TrendingUp, DollarSign, Eye,
} from "lucide-react";

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass rounded-xl p-8">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground mb-4">Você não tem permissão de administrador.</p>
          <Link to="/dashboard">
            <Button className="bg-primary text-primary-foreground">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        onSignOut={async () => {
          await signOut();
          navigate("/");
        }}
      />
      <main className="lg:ml-64 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Gerencie a plataforma Vyral</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="bg-secondary mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="w-4 h-4 mr-2" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="scraping" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <RefreshCw className="w-4 h-4 mr-2" />
              Scraping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab search={search} />
          </TabsContent>
          <TabsContent value="products">
            <ProductsTab search={search} />
          </TabsContent>
          <TabsContent value="videos">
            <VideosTab search={search} />
          </TabsContent>
          <TabsContent value="scraping">
            <ScrapingTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const AdminSidebar = ({ onSignOut }: { onSignOut: () => void }) => (
  <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-border p-6 hidden lg:flex flex-col z-40">
    <Link to="/" className="flex items-center gap-2 mb-8">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <Zap className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="font-display text-xl font-bold">Vyral</span>
      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">Admin</span>
    </Link>
    <nav className="space-y-1 flex-1">
      <Link to="/admin" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
        <Settings className="w-4 h-4" />
        Painel Admin
      </Link>
      <Link to="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary text-sm transition-colors">
        <BarChart3 className="w-4 h-4" />
        Dashboard
      </Link>
    </nav>
    <button onClick={onSignOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
      <LogOut className="w-4 h-4" />
      Sair
    </button>
  </aside>
);

const OverviewTab = () => {
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("plan, created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: productCount } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("viral_products")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: videoCount } = useQuery({
    queryKey: ["admin-video-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("viral_videos")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const totalUsers = profiles?.length || 0;
  const planBreakdown = (profiles || []).reduce<Record<string, number>>((acc, p) => {
    acc[p.plan] = (acc[p.plan] || 0) + 1;
    return acc;
  }, {});
  const recentUsers = (profiles || []).filter((p) => {
    const d = new Date(p.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Usuários", value: totalUsers, icon: Users, color: "text-primary" },
          { label: "Novos (7 dias)", value: recentUsers, icon: TrendingUp, color: "text-primary" },
          { label: "Total Produtos", value: productCount || 0, icon: ShoppingCart, color: "text-blue-400" },
          { label: "Total Vídeos", value: videoCount || 0, icon: Video, color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Distribuição por Plano</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(planBreakdown).sort().map(([plan, count]) => (
            <div key={plan} className="bg-secondary rounded-xl p-4 text-center">
              <p className="font-display text-xl font-bold text-primary">{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{plan}</p>
              <p className="text-[10px] text-muted-foreground/60">
                {totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(0) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UsersTab = ({ search }: { search: string }) => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-profiles", search],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (search) query = query.ilike("full_name", `%${search}%`);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-2">
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground">Total de usuários: <span className="font-bold text-foreground">{profiles?.length || 0}</span></p>
      </div>
      {profiles?.map((profile) => {
        const userRoles = roles?.filter((r) => r.user_id === profile.user_id) || [];
        return (
          <div key={profile.id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {(profile.full_name || "U")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm">{profile.full_name || "Sem nome"}</p>
                <p className="text-xs text-muted-foreground">ID: {profile.user_id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">{profile.plan}</span>
              {userRoles.map((r) => (
                <span key={r.id} className="text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
                  {r.role}
                </span>
              ))}
              <span className="text-xs text-muted-foreground">{new Date(profile.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProductsTab = ({ search }: { search: string }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: async () => {
      let query = supabase.from("viral_products").select("*").order("trending_score", { ascending: false });
      if (search) query = query.ilike("product_name", `%${search}%`);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("viral_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["viral-products"] });
      toast({ title: "Produto removido" });
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  const formatCurrency = (n: number | null) =>
    n ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n) : "—";

  return (
    <div className="space-y-2">
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground">Total de produtos: <span className="font-bold text-foreground">{products?.length || 0}</span></p>
      </div>
      {products?.map((p) => (
        <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={p.product_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=48&h=48&fit=crop"}
              alt={p.product_name}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{p.product_name}</p>
              <p className="text-xs text-muted-foreground">{p.category} • {p.shop_name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold">{formatCurrency(p.price)}</p>
              <p className="text-xs text-primary">{formatCurrency(p.revenue)}</p>
            </div>
            <span className="text-xs bg-secondary rounded-full px-2 py-0.5">{Number(p.trending_score || 0).toFixed(1)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteProduct.mutate(p.id)}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const VideosTab = ({ search }: { search: string }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["admin-videos", search],
    queryFn: async () => {
      let query = supabase.from("viral_videos").select("*").order("trending_score", { ascending: false });
      if (search) query = query.ilike("title", `%${search}%`);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("viral_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["viral-videos"] });
      toast({ title: "Vídeo removido" });
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  const formatNumber = (n: number | null) => {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="space-y-2">
      <div className="glass rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground">Total de vídeos: <span className="font-bold text-foreground">{videos?.length || 0}</span></p>
      </div>
      {videos?.map((v) => (
        <div key={v.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{v.title || "Sem título"}</p>
            <p className="text-xs text-muted-foreground">{v.creator_name || "—"}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatNumber(v.views)} views</span>
              <span>{formatNumber(v.likes)} likes</span>
            </div>
            <span className="text-xs bg-secondary rounded-full px-2 py-0.5">{Number(v.trending_score || 0).toFixed(1)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteVideo.mutate(v.id)}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ScrapingTab = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isScrapingProducts, setIsScrapingProducts] = useState(false);
  const [isScrapingVideos, setIsScrapingVideos] = useState(false);
  const queryClient = useQueryClient();

  const handleScrapeProducts = async () => {
    setIsScrapingProducts(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-tiktok-products", {
        body: { query: query || undefined },
      });
      if (error) throw error;
      toast({ title: "Scraping de produtos concluído!", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["viral-products"] });
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Falha", variant: "destructive" });
    } finally {
      setIsScrapingProducts(false);
    }
  };

  const handleScrapeVideos = async () => {
    setIsScrapingVideos(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-tiktok-videos", {
        body: { query: query || undefined },
      });
      if (error) throw error;
      toast({ title: "Scraping de vídeos concluído!", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["viral-videos"] });
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Falha", variant: "destructive" });
    } finally {
      setIsScrapingVideos(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Scraping Manual</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Execute o scraping manualmente para buscar novos produtos e vídeos virais do TikTok Shop.
        </p>
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="Busca personalizada (opcional)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleScrapeProducts}
            disabled={isScrapingProducts}
            className="bg-primary text-primary-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isScrapingProducts ? "animate-spin" : ""}`} />
            {isScrapingProducts ? "Buscando produtos..." : "Scrape Produtos"}
          </Button>
          <Button
            onClick={handleScrapeVideos}
            disabled={isScrapingVideos}
            variant="outline"
            className="border-primary text-primary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isScrapingVideos ? "animate-spin" : ""}`} />
            {isScrapingVideos ? "Buscando vídeos..." : "Scrape Vídeos"}
          </Button>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-semibold text-lg mb-2">Sobre o Scraping</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• O scraping usa a RapidAPI para buscar dados públicos de produtos virais</li>
          <li>• Dados são extraídos via TikTok API (primária) com fallback automático</li>
          <li>• Produtos duplicados são automaticamente filtrados</li>
          <li>• Rate limiting ativo: máx. 30 requests/minuto por função</li>
          <li>• Os dados são salvos no banco e ficam disponíveis para todos os usuários</li>
        </ul>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export default AdminPanel;
