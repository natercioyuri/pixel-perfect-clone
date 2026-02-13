import { Eye, Heart, Share2, Flame, ShoppingBag, ExternalLink, DollarSign, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SaveButton from "./SaveButton";
import type { ViralProduct } from "@/hooks/useViralProducts";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ViralProduct | null;
}

const formatNumber = (n: number | null) => {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const formatCurrency = (n: number | null) => {
  if (!n) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
};

const ProductDetailDialog = ({ open, onOpenChange, product }: ProductDetailDialogProps) => {
  if (!product) return null;

  const hasValidLink = product.tiktok_url && product.tiktok_url.includes("tiktok.com");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base leading-tight pr-8 flex items-center gap-2">
            {product.product_name}
            <SaveButton productId={product.id} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {product.product_image ? (
            <img
              src={product.product_image}
              alt={product.product_name}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-primary/30" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Preço</span>
              </div>
              <p className="font-display font-bold text-lg">{formatCurrency(product.price)}</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Receita</span>
              </div>
              <p className="font-display font-bold text-lg text-primary">{formatCurrency(product.revenue)}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Trending Score</span>
              </div>
              <span className="font-display font-bold text-primary text-lg">
                {Number(product.trending_score || 0).toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(Number(product.trending_score) || 0, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="font-display font-semibold text-sm">{formatNumber(product.video_views)}</p>
              <p className="text-[10px] text-muted-foreground">views</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Heart className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="font-display font-semibold text-sm">{formatNumber(product.video_likes)}</p>
              <p className="text-[10px] text-muted-foreground">likes</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Share2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="font-display font-semibold text-sm">{formatNumber(product.video_shares)}</p>
              <p className="text-[10px] text-muted-foreground">shares</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {product.shop_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loja</span>
                <span className="font-medium">{product.shop_name}</span>
              </div>
            )}
            {product.category && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria</span>
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{product.category}</span>
              </div>
            )}
            {product.sales_count != null && product.sales_count > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vendas</span>
                <span className="font-medium">{formatNumber(product.sales_count)}</span>
              </div>
            )}
            {product.country && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">País</span>
                <span className="font-medium">{product.country}</span>
              </div>
            )}
          </div>

          {hasValidLink && (
            <Button asChild variant="outline" className="w-full">
              <a href={product.tiktok_url!} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver no TikTok
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
