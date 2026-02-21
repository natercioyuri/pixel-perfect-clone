import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, ShoppingBag, DollarSign, Eye, TrendingUp, ExternalLink } from "lucide-react";

interface ShopData {
  shop_name: string;
  productCount: number;
  totalRevenue: number;
  totalViews: number;
  avgTrending: number;
  topCategories: string[];
  shop_url?: string;
}

interface ShopDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: ShopData | null;
  rank: number;
}

const formatCurrency = (n: number) => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(1)}K`;
  return `R$ ${n.toFixed(0)}`;
};

const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const ShopDetailDialog = ({ open, onOpenChange, shop, rank }: ShopDetailDialogProps) => {
  if (!shop) return null;

  // Try to build a TikTok shop search link
  const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(shop.shop_name)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-sm"
              style={{
                background: rank < 3 ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                color: rank < 3 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              }}
            >
              {rank + 1}
            </div>
            <div>
              <p className="text-base font-bold">{shop.shop_name}</p>
              {rank < 3 && (
                <Badge className="text-[10px] bg-blue-500/20 text-blue-300 hover:bg-blue-500/20 mt-1">
                  TOP {rank + 1}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <DollarSign className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-primary">{formatCurrency(shop.totalRevenue)}</p>
              <p className="text-[10px] text-muted-foreground">Receita estimada</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <ShoppingBag className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{shop.productCount}</p>
              <p className="text-[10px] text-muted-foreground">Produtos</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Eye className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{formatViews(shop.totalViews)}</p>
              <p className="text-[10px] text-muted-foreground">Views totais</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <TrendingUp className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{shop.avgTrending.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">Trending médio</p>
            </div>
          </div>

          {/* Categories */}
          {shop.topCategories.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Categorias</p>
              <div className="flex flex-wrap gap-1.5">
                {shop.topCategories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs border-border">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            {shop.shop_url && (
              <Button asChild className="w-full gap-2" variant="default">
                <a href={shop.shop_url} target="_blank" rel="noopener noreferrer">
                  <Store className="w-4 h-4" />
                  Visitar loja
                </a>
              </Button>
            )}
            <Button asChild className="w-full gap-2" variant={shop.shop_url ? "outline" : "default"}>
              <a href={tiktokSearchUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Buscar no TikTok
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShopDetailDialog;
