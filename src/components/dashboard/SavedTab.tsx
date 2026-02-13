import { Heart, ShoppingCart, Video } from "lucide-react";
import { useSavedItems } from "@/hooks/useSavedItems";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "./ProductCard";
import VideoCard from "./VideoCard";

interface SavedTabProps {
  onTranscribe: (videoId: string) => void;
  transcribingIds: Set<string>;
}

const SavedTab = ({ onTranscribe, transcribingIds }: SavedTabProps) => {
  const { data: savedItems, isLoading } = useSavedItems();

  const savedProducts = (savedItems || [])
    .filter((s) => s.viral_products)
    .map((s) => s.viral_products!);

  const savedVideos = (savedItems || [])
    .filter((s) => s.viral_videos)
    .map((s) => s.viral_videos!);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!savedItems || savedItems.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-xl">
        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold mb-2">Nenhum item salvo</h3>
        <p className="text-sm text-muted-foreground">
          Clique no ❤️ em produtos ou vídeos para salvá-los aqui
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="bg-secondary mb-4">
        <TabsTrigger value="all">Todos ({savedItems.length})</TabsTrigger>
        <TabsTrigger value="products">
          <ShoppingCart className="w-3 h-3 mr-1" />
          Produtos ({savedProducts.length})
        </TabsTrigger>
        <TabsTrigger value="videos">
          <Video className="w-3 h-3 mr-1" />
          Vídeos ({savedVideos.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        {savedProducts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Produtos</h3>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {savedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
        {savedVideos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Vídeos</h3>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {savedVideos.map((v, i) => (
                <VideoCard
                  key={v.id}
                  video={v as any}
                  index={i}
                  onTranscribe={onTranscribe}
                  isTranscribing={transcribingIds.has(v.id)}
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="products">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {savedProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="videos">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {savedVideos.map((v, i) => (
            <VideoCard
              key={v.id}
              video={v as any}
              index={i}
              onTranscribe={onTranscribe}
              isTranscribing={transcribingIds.has(v.id)}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SavedTab;
