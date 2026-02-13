import { Eye, Heart, Share2, ExternalLink, Flame, ShoppingBag, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import type { ViralProduct } from "@/hooks/useViralProducts";
import SaveButton from "./SaveButton";
import ProductDetailDialog from "./ProductDetailDialog";

interface ProductCardProps {
  product: ViralProduct;
  index: number;
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

const ProductCard = ({ product, index }: ProductCardProps) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasImage = !!product.product_image;
  const hasValidLink = product.tiktok_url && product.tiktok_url.includes("tiktok.com");
  const buyLink = product.shop_url || (hasValidLink ? product.tiktok_url! : null);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!buyLink) return;
    navigator.clipboard.writeText(buyLink).then(() => {
      setCopied(true);
      toast({ title: "Link copiado!", description: "O link foi copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden group hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => setDetailOpen(true)}
    >
      <div className="relative">
        {hasImage ? (
          <img
            src={product.product_image!}
            alt={product.product_name}
            className="w-full h-40 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center ${hasImage ? "hidden" : "flex"}`}
        >
          <ShoppingBag className="w-12 h-12 text-primary/40" />
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
          <Flame className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold">{Number(product.trending_score || 0).toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">{product.product_name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {product.category && (
              <span className="text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">
                {product.category}
              </span>
            )}
            <SaveButton productId={product.id} />
          </div>
        </div>

        {product.shop_name && (
          <p className="text-xs text-muted-foreground mb-3">{product.shop_name}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-secondary rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Preço</p>
            <p className="font-display font-semibold text-sm">{formatCurrency(product.price)}</p>
          </div>
          <div className="bg-secondary rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="font-display font-semibold text-sm text-primary">{formatCurrency(product.revenue)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {formatNumber(product.video_views)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {formatNumber(product.video_likes)}
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="w-3 h-3" /> {formatNumber(product.video_shares)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {buyLink && (
              <button
                onClick={handleCopy}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Copiar link de compra"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            {product.shop_url && (
              <a
                href={product.shop_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Comprar produto"
              >
                <ShoppingBag className="w-4 h-4" />
              </a>
            )}
            {hasValidLink ? (
              <a
                href={product.tiktok_url!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Ver no TikTok"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span className="text-muted-foreground/30">
                <ExternalLink className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    <ProductDetailDialog open={detailOpen} onOpenChange={setDetailOpen} product={product} />
    </>
  );
};

export default ProductCard;
