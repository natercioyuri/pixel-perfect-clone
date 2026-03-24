import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/hooks/useUserPlan";
import { canAccessFeature } from "@/lib/plans";
import {
  ShoppingCart, Video, Filter, ArrowUpDown, RefreshCw, FileText, Lock,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import ProductCard from "@/components/dashboard/ProductCard";
import VideoCard from "@/components/dashboard/VideoCard";
import SavedTab from "@/components/dashboard/SavedTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import RankingTab from "@/components/dashboard/RankingTab";
import VideoGenerationTab from "@/components/dashboard/VideoGenerationTab";
import ExploreTab from "@/components/dashboard/ExploreTab";
import ShopAnalysisTab from "@/components/dashboard/ShopAnalysisTab";
import CreatorDiscoveryTab from "@/components/dashboard/CreatorDiscoveryTab";
import ViralAudiosTab from "@/components/dashboard/ViralAudiosTab";
import BestSellersTab from "@/components/dashboard/BestSellersTab";
import WeeklyTrendingTab from "@/components/dashboard/WeeklyTrendingTab";
import VideoFilters, { applyVideoFilters, type VideoFilterState } from "@/components/dashboard/VideoFilters";
import OnboardingModal from "@/components/dashboard/OnboardingModal";
import CheckoutFeedback from "@/components/dashboard/CheckoutFeedback";
import PaginationControls, { usePagination } from "@/components/dashboard/PaginationControls";
import PlanGate from "@/components/dashboard/PlanGate";
import ExportCSVButton from "@/components/dashboard/ExportCSVButton";
import ExportPDFButton from "@/components/dashboard/ExportPDFButton";
import PriceHistoryChart from "@/components/dashboard/PriceHistoryChart";
import ProductFilters, { applyProductFilters, defaultProductFilters, type ProductFilterState } from "@/components/dashboard/ProductFilters";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  useViralProducts,
  useViralVideos,
  useProductStats,
  useScrapeProducts,
  useScrapeVideos,
  useCategories,
  useTranscribeVideo,
  useTranscribeAll,
} from "@/hooks/useViralProducts";

const PRODUCTS_PER_PAGE = 12;
const VIDEOS_PER_PAGE = 12;

const productCsvColumns = [
  { key: "product_name", label: "Produto" },
  { key: "category", label: "Categoria" },
  { key: "price", label: "Preço" },
  { key: "revenue", label: "Receita" },
  { key: "sales_count", label: "Vendas" },
  { key: "video_views", label: "Views" },
  { key: "trending_score", label: "Trending Score" },
  { key: "shop_name", label: "Loja" },
];

const videoCsvColumns = [
  { key: "title", label: "Título" },
  { key: "creator_name", label: "Criador" },
  { key: "views", label: "Views" },
  { key: "likes", label: "Likes" },
  { key: "shares", label: "Shares" },
  { key: "engagement_rate", label: "Engajamento %" },
  { key: "trending_score", label: "Trending Score" },
  { key: "revenue_estimate", label: "Receita Estimada" },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: userPlan } = useUserPlan();
  const hasTranscriptionAccess = canAccessFeature(userPlan || "free", "transcriptions");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState<"trending" | "revenue" | "views">("trending");
  const [transcribingIds, setTranscribingIds] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState("explore");
  const [productsPage, setProductsPage] = useState(1);
  const [videosPage, setVideosPage] = useState(1);
  const [videoFilters, setVideoFilters] = useState<VideoFilterState>({
    viewsRange: "all",
    hasTranscription: "all",
    creator: "all",
  });
  const [productFilters, setProductFilters] = useState<ProductFilterState>(defaultProductFilters);

  useEffect(() => { setProductsPage(1); }, [search, selectedCategory, sortBy, productFilters]);
  useEffect(() => { setVideosPage(1); }, [search, sortBy, videoFilters]);

  const { data: products, isLoading: productsLoading } = useViralProducts({
    category: selectedCategory,
    sortBy,
    search,
  });

  const { data: videos, isLoading: videosLoading } = useViralVideos({
    sortBy,
    search,
  });

  const { data: stats, isLoading: statsLoading } = useProductStats();
  const { data: categories = ["Todos"] } = useCategories();

  const scrapeProducts = useScrapeProducts();
  const scrapeVideos = useScrapeVideos();
  const transcribeVideo = useTranscribeVideo();
  const transcribeAll = useTranscribeAll();

  const filteredProducts = useMemo(
    () => applyProductFilters(products || [], productFilters),
    [products, productFilters]
  );

  const uniqueCountries = useMemo(
    () => [...new Set((products || []).map((p) => p.country).filter(Boolean))] as string[],
    [products]
  );

  const filteredVideos = useMemo(
    () => applyVideoFilters(videos || [], videoFilters),
    [videos, videoFilters]
  );

  const isBrazilianVideo = (video: { title?: string | null; creator_name?: string | null }) => {
    const text = `${video.title || ""} ${video.creator_name || ""}`.toLowerCase();
    const ptPatterns = [
      /\b(que|como|para|com|uma|esse|essa|isso|está|não|mais|muito|aqui|você|vocês|ela|dele|dela|comprei|amei|gente|meninas|olha|achei|demais|tudo|melhor|pele|cabelo|ficou|fica|produto|chegou|precinho|kit|blusinha|vestido|short|look)\b/,
      /[ãõçáéíóúâêô]/,
      /#(brasil|br|tiktokshopbrasil|dicasde)/i,
    ];
    return ptPatterns.some((p) => p.test(text));
  };

  const nationalVideos = useMemo(
    () => filteredVideos.filter(isBrazilianVideo),
    [filteredVideos]
  );

  const internationalVideos = useMemo(
    () => filteredVideos.filter((v) => !isBrazilianVideo(v)),
    [filteredVideos]
  );

  const { paginatedItems: paginatedProducts, totalPages: productsTotalPages } = usePagination(
    filteredProducts, PRODUCTS_PER_PAGE, productsPage
  );

  const { paginatedItems: paginatedVideos, totalPages: videosTotalPages } = usePagination(
    filteredVideos, VIDEOS_PER_PAGE, videosPage
  );

  const uniqueCreators = useMemo(
    () => [...new Set((videos || []).map((v) => v.creator_name).filter(Boolean))] as string[],
    [videos]
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleScrapeAll = () => {
    scrapeProducts.mutate({});
    scrapeVideos.mutate({});
  };

  const handleTranscribe = (videoId: string) => {
    setTranscribingIds((prev) => new Set(prev).add(videoId));
    transcribeVideo.mutate(videoId, {
      onSettled: () => {
        setTranscribingIds((prev) => {
          const next = new Set(prev);
          next.delete(videoId);
          return next;
        });
      },
    });
  };

  const isScraping = scrapeProducts.isPending || scrapeVideos.isPending;

  const tabValue =
    activeSection === "explore" ? "explore"
    : activeSection === "saved" ? "saved"
    : activeSection === "analytics" ? "analytics"
    : activeSection === "ranking" ? "ranking"
    : activeSection === "videos" ? "videos"
    : activeSection === "generate" ? "generate"
    : activeSection === "shops" ? "shops"
    : activeSection === "creators" ? "creators"
    : activeSection === "audios" ? "audios"
    : activeSection === "bestsellers" ? "bestsellers"
    : activeSection === "weekly" ? "weekly"
    : "products";

  return (
    <div className="min-h-screen bg-background">
      <OnboardingModal />
      <CheckoutFeedback />
      <DashboardSidebar onSignOut={handleSignOut} activeTab={activeSection} onTabChange={setActiveSection} />

      <main className="lg:ml-64">
        <DashboardHeader user={user} search={search} onSearchChange={setSearch} onNavigate={setActiveSection} />

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Produtos e vídeos virais do TikTok Shop</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleScrapeAll}
                disabled={isScraping}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isScraping ? "animate-spin" : ""}`} />
                {isScraping ? "Buscando..." : "Atualizar Dados"}
              </Button>
            </div>
          </div>

          <ErrorBoundary>
            <StatsCards
              productCount={stats?.productCount || 0}
              videoCount={stats?.videoCount || 0}
              totalRevenue={stats?.totalRevenue || 0}
              trendingToday={stats?.trendingToday || 0}
              isLoading={statsLoading}
            />
          </ErrorBoundary>

          {(tabValue === "products" || tabValue === "videos") && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-secondary border border-border rounded-lg text-xs px-3 py-1.5 text-foreground"
                >
                  <option value="trending">Mais Viral</option>
                  <option value="revenue">Maior Receita</option>
                  <option value="views">Mais Views</option>
                </select>
              </div>
            </div>
          )}

          <Tabs value={tabValue} onValueChange={(v) => setActiveSection(v)}>
            <TabsList className="bg-secondary mb-6 flex-wrap h-auto gap-1 overflow-x-auto max-w-full">
              <TabsTrigger value="explore" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Explorar
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Produtos</span> ({products?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Video className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Vídeos</span> ({videos?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="shops" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Lojas
              </TabsTrigger>
              <TabsTrigger value="creators" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Criadores
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explore">
              <ErrorBoundary>
                <ExploreTab onNavigate={setActiveSection} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="products">
              <ErrorBoundary>
                <ProductFilters
                  filters={productFilters}
                  onFiltersChange={setProductFilters}
                  countries={uniqueCountries}
                />
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} produtos encontrados
                  </p>
                  <ExportCSVButton
                    data={filteredProducts}
                    filename="vyral-produtos"
                    columns={productCsvColumns}
                  />
                </div>
                {productsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
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
                ) : products && products.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      <AnimatePresence>
                        {paginatedProducts.map((product, i) => (
                          <ProductCard key={product.id} product={product} index={i} />
                        ))}
                      </AnimatePresence>
                    </div>
                    <PaginationControls currentPage={productsPage} totalPages={productsTotalPages} onPageChange={setProductsPage} />
                  </>
                ) : (
                  <div className="text-center py-16 glass rounded-xl">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Clique em "Atualizar Dados" para buscar produtos virais do TikTok Shop
                    </p>
                    <Button
                      onClick={() => scrapeProducts.mutate({})}
                      disabled={scrapeProducts.isPending}
                      className="bg-primary text-primary-foreground"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${scrapeProducts.isPending ? "animate-spin" : ""}`} />
                      Buscar Produtos
                    </Button>
                  </div>
                )}
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="videos">
              <ErrorBoundary>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredVideos.length} vídeos encontrados
                  </p>
                  <ExportCSVButton
                    data={filteredVideos}
                    filename="vyral-videos"
                    columns={videoCsvColumns}
                  />
                </div>

                <VideoFilters
                  filters={videoFilters}
                  onFiltersChange={setVideoFilters}
                  creators={uniqueCreators}
                />

                {videos && videos.length > 0 && (
                  <div className="flex items-center justify-between mb-4 glass rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        <span className="font-semibold text-foreground">
                          {videos.filter((v) => v.transcription).length}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}de {videos.length} vídeos transcritos
                        </span>
                      </span>
                    </div>
                    {hasTranscriptionAccess ? (
                      <Button
                        onClick={() => transcribeAll.mutate(10)}
                        disabled={transcribeAll.isPending}
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary"
                      >
                        <FileText className={`w-4 h-4 mr-2 ${transcribeAll.isPending ? "animate-pulse" : ""}`} />
                        {transcribeAll.isPending ? "Transcrevendo..." : "Transcrever Todos"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Plano Pro
                      </span>
                    )}
                  </div>
                )}

                {videosLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="glass rounded-xl p-4 space-y-3">
                        <div className="flex gap-3">
                          <Skeleton className="w-16 h-16 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((j) => (
                            <Skeleton key={j} className="h-12 rounded-lg" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredVideos.length > 0 ? (
                  <Tabs defaultValue="national" className="w-full">
                    <TabsList className="bg-secondary mb-4">
                      <TabsTrigger value="national">🇧🇷 Nacionais ({nationalVideos.length})</TabsTrigger>
                      <TabsTrigger value="international">🌎 Internacionais ({internationalVideos.length})</TabsTrigger>
                      <TabsTrigger value="all-videos">Todos ({filteredVideos.length})</TabsTrigger>
                    </TabsList>

                    {[
                      { value: "national", items: nationalVideos },
                      { value: "international", items: internationalVideos },
                      { value: "all-videos", items: filteredVideos },
                    ].map(({ value, items }) => (
                      <TabsContent key={value} value={value}>
                        {items.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <AnimatePresence>
                              {items.map((video, i) => (
                                <VideoCard
                                  key={video.id}
                                  video={video as any}
                                  index={i}
                                  onTranscribe={handleTranscribe}
                                  isTranscribing={transcribingIds.has(video.id)}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="text-center py-12 glass rounded-xl">
                            <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Nenhum vídeo nesta categoria</p>
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center py-16 glass rounded-xl">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">
                      {videos && videos.length > 0 ? "Nenhum vídeo com esses filtros" : "Nenhum vídeo encontrado"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {videos && videos.length > 0
                        ? "Tente ajustar os filtros avançados"
                        : 'Clique em "Atualizar Dados" para buscar vídeos virais'}
                    </p>
                    {(!videos || videos.length === 0) && (
                      <Button
                        onClick={() => scrapeVideos.mutate({})}
                        disabled={scrapeVideos.isPending}
                        className="bg-primary text-primary-foreground"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${scrapeVideos.isPending ? "animate-spin" : ""}`} />
                        Buscar Vídeos
                      </Button>
                    )}
                  </div>
                )}
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="shops">
              <ErrorBoundary>
                <PlanGate feature="transcriptions" featureName="Análise de Lojas" minPlan="Pro">
                  <ShopAnalysisTab />
                </PlanGate>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="creators">
              <ErrorBoundary>
                <PlanGate feature="transcriptions" featureName="Descoberta de Criadores" minPlan="Pro">
                  <CreatorDiscoveryTab />
                </PlanGate>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="audios">
              <ErrorBoundary>
                <ViralAudiosTab />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="bestsellers">
              <ErrorBoundary>
                <BestSellersTab />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="weekly">
              <ErrorBoundary>
                <WeeklyTrendingTab />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="saved">
              <ErrorBoundary>
                <SavedTab onTranscribe={handleTranscribe} transcribingIds={transcribingIds} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="analytics">
              <ErrorBoundary>
                <PlanGate feature="aiScripts" featureName="Análises & Insights" minPlan="Pro">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-bold">Análises & Insights</h2>
                    <ExportPDFButton products={products || []} videos={videos || []} />
                  </div>
                  <AnalyticsTab products={products || []} videos={videos || []} />
                  <div className="mt-6">
                    <PriceHistoryChart />
                  </div>
                </PlanGate>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="ranking">
              <ErrorBoundary>
                <RankingTab />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="generate">
              <ErrorBoundary>
                <VideoGenerationTab />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
