import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/hooks/useUserPlan";
import { canAccessFeature } from "@/lib/plans";
import { toast } from "@/hooks/use-toast";

interface ExportCSVButtonProps {
  data: Record<string, any>[];
  filename: string;
  columns: { key: string; label: string }[];
}

const ExportCSVButton = ({ data, filename, columns }: ExportCSVButtonProps) => {
  const { data: userPlan } = useUserPlan();
  const hasAccess = canAccessFeature(userPlan || "free", "aiScripts"); // Pro+ feature

  const handleExport = () => {
    if (!hasAccess) {
      toast({
        title: "Recurso Premium",
        description: "Exportação CSV disponível a partir do plano Pro.",
        variant: "destructive",
      });
      return;
    }

    if (data.length === 0) {
      toast({ title: "Sem dados para exportar", variant: "destructive" });
      return;
    }

    const header = columns.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const val = row[c.key];
          if (val === null || val === undefined) return "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportado com sucesso! 📥" });
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      className={hasAccess ? "border-primary text-primary" : "text-muted-foreground"}
    >
      {hasAccess ? (
        <Download className="w-4 h-4 mr-2" />
      ) : (
        <Lock className="w-4 h-4 mr-2" />
      )}
      Exportar CSV
    </Button>
  );
};

export default ExportCSVButton;
