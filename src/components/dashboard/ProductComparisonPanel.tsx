import { X, Scale, TrendingUp, DollarSign, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViralProduct } from "@/hooks/useViralProducts";

interface ProductComparisonPanelProps {
  products: ViralProduct[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

const formatCurrency = (value: number | null) => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
  }).format(value);
};

const formatNumber = (value: number | null) => {
  if (!value) return "0";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const metricConfig = [
  {
    key: "price",
    label: "Preço",
    icon: DollarSign,
    getValue: (product: ViralProduct) => Number(product.price) || 0,
    format: (value: number) => formatCurrency(value),
  },
  {
    key: "revenue",
    label: "Receita",
    icon: TrendingUp,
    getValue: (product: ViralProduct) => Number(product.revenue) || 0,
    format: (value: number) => formatCurrency(value),
  },
  {
    key: "views",
    label: "Views",
    icon: Eye,
    getValue: (product: ViralProduct) => Number(product.video_views) || 0,
    format: (value: number) => formatNumber(value),
  },
  {
    key: "score",
    label: "Trending Score",
    icon: Scale,
    getValue: (product: ViralProduct) => Number(product.trending_score) || 0,
    format: (value: number) => value.toFixed(1),
  },
] as const;

const ProductComparisonPanel = ({ products, onRemove, onClear }: ProductComparisonPanelProps) => {
  if (products.length === 0) return null;

  return (
    <section className="glass rounded-xl p-5 space-y-4 mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-4 h-4 text-primary" />
            <h3 className="font-display text-lg font-bold">Comparador de Produtos</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Compare até 3 produtos lado a lado para validar preço, receita, alcance e força viral.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>
          Limpar comparação
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
        {products.map((product) => (
          <article key={product.id} className="rounded-xl border border-border bg-card/70 p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-display font-semibold text-sm leading-tight line-clamp-2">
                  {product.product_name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {product.shop_name || "Loja não informada"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onRemove(product.id)} aria-label="Remover produto da comparação">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {metricConfig.map((metric) => {
                const Icon = metric.icon;
                const rawValue = metric.getValue(product);
                const bestValue = Math.max(...products.map(metric.getValue));
                const isBest = rawValue === bestValue && bestValue > 0;

                return (
                  <div
                    key={metric.key}
                    className={`rounded-lg border p-3 ${isBest ? "border-primary bg-primary/5" : "border-border bg-secondary/40"}`}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[11px] uppercase tracking-wide">{metric.label}</span>
                    </div>
                    <p className="font-display text-base font-bold">{metric.format(rawValue)}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg bg-secondary/40 p-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Categoria</span>
                <span className="text-foreground">{product.category || "Sem categoria"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>País</span>
                <span className="text-foreground">{product.country || "Não informado"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Vendas</span>
                <span className="text-foreground">{formatNumber(product.sales_count)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductComparisonPanel;
