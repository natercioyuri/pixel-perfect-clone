import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ExportPDFButtonProps {
  products: any[];
  videos: any[];
}

const ExportPDFButton = ({ products, videos }: ExportPDFButtonProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const topProducts = products.slice(0, 20);
      const topVideos = videos.slice(0, 20);

      const formatCurrency = (n: number | null) =>
        n ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n) : "R$ 0,00";

      const formatNumber = (n: number | null) => {
        if (!n) return "0";
        if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
        if (n >= 1000) return (n / 1000).toFixed(1) + "K";
        return n.toString();
      };

      const now = new Date().toLocaleDateString("pt-BR");

      let html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Relatório Vyral - ${now}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
  h1 { color: #10b981; font-size: 28px; border-bottom: 3px solid #10b981; padding-bottom: 8px; }
  h2 { color: #333; margin-top: 32px; font-size: 20px; }
  .stats { display: flex; gap: 16px; margin: 16px 0; }
  .stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; flex: 1; text-align: center; }
  .stat-value { font-size: 24px; font-weight: bold; color: #10b981; }
  .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th { background: #10b981; color: white; padding: 10px 8px; text-align: left; }
  td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) { background: #f9fafb; }
  .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; }
</style></head><body>
<h1>📊 Relatório Vyral</h1>
<p style="color:#666">Gerado em ${now}</p>

<div class="stats">
  <div class="stat-card"><div class="stat-value">${products.length}</div><div class="stat-label">Produtos</div></div>
  <div class="stat-card"><div class="stat-value">${videos.length}</div><div class="stat-label">Vídeos</div></div>
  <div class="stat-card"><div class="stat-value">${formatCurrency(products.reduce((s: number, p: any) => s + (Number(p.revenue) || 0), 0))}</div><div class="stat-label">Receita Total</div></div>
  <div class="stat-card"><div class="stat-value">${products.filter((p: any) => Number(p.trending_score) > 80).length}</div><div class="stat-label">Em Alta</div></div>
</div>

<h2>🏆 Top ${topProducts.length} Produtos</h2>
<table>
  <tr><th>#</th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Receita</th><th>Views</th><th>Score</th></tr>
  ${topProducts.map((p: any, i: number) => `<tr>
    <td>${i + 1}</td>
    <td>${p.product_name?.substring(0, 50) || "-"}</td>
    <td>${p.category || "-"}</td>
    <td>${formatCurrency(p.price)}</td>
    <td>${formatCurrency(p.revenue)}</td>
    <td>${formatNumber(p.video_views)}</td>
    <td>${Number(p.trending_score || 0).toFixed(1)}</td>
  </tr>`).join("")}
</table>

<h2>🎬 Top ${topVideos.length} Vídeos</h2>
<table>
  <tr><th>#</th><th>Título</th><th>Criador</th><th>Views</th><th>Likes</th><th>Engajamento</th><th>Score</th></tr>
  ${topVideos.map((v: any, i: number) => `<tr>
    <td>${i + 1}</td>
    <td>${v.title?.substring(0, 50) || "-"}</td>
    <td>${v.creator_name || "-"}</td>
    <td>${formatNumber(v.views)}</td>
    <td>${formatNumber(v.likes)}</td>
    <td>${v.engagement_rate ? Number(v.engagement_rate).toFixed(1) + "%" : "-"}</td>
    <td>${Number(v.trending_score || 0).toFixed(1)}</td>
  </tr>`).join("")}
</table>

<div class="footer">Vyral — Inteligência para TikTok Shop • ${now}</div>
</body></html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      toast({ title: "Relatório gerado!", description: "Use Ctrl+P / Cmd+P para salvar como PDF." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm">
      {exporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileText className="w-4 h-4 mr-2" />
      )}
      Exportar PDF
    </Button>
  );
};

export default ExportPDFButton;
