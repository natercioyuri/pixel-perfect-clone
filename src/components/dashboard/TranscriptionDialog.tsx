import { Copy, Check, Zap, AlertTriangle, Lightbulb, FileText, Clapperboard } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface TranscriptionData {
  gancho: string;
  dor: string;
  solucao: string;
  descricao: string;
}

interface TranscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle: string;
  transcription: string | null;
}

function parseTranscription(raw: string | null): TranscriptionData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.gancho && parsed.dor && parsed.solucao && parsed.descricao) {
      return parsed as TranscriptionData;
    }
  } catch {
    return {
      gancho: "🔥 Gancho do vídeo",
      dor: "",
      solucao: "",
      descricao: raw,
    };
  }
  return null;
}

const TranscriptionDialog = ({
  open,
  onOpenChange,
  videoTitle,
  transcription,
}: TranscriptionDialogProps) => {
  const [copied, setCopied] = useState(false);
  const data = parseTranscription(transcription);

  const handleCopyAll = () => {
    if (!data) return;
    const text = `🎯 GANCHO:\n${data.gancho}\n\n😫 DOR:\n${data.dor}\n\n💡 SOLUÇÃO:\n${data.solucao}\n\n📝 ROTEIRO COMPLETO:\n${data.descricao}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base leading-tight pr-8">
            {videoTitle || "Transcrição do Vídeo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm text-primary">Gancho</h4>
            </div>
            <p className="text-sm leading-relaxed">{data.gancho}</p>
          </div>

          {data.dor && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h4 className="font-semibold text-sm text-destructive">Dor</h4>
              </div>
              <p className="text-sm leading-relaxed">{data.dor}</p>
            </div>
          )}

          {data.solucao && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-sm text-green-600">Solução</h4>
              </div>
              <p className="text-sm leading-relaxed">{data.solucao}</p>
            </div>
          )}

          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Roteiro Completo</h4>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {data.descricao}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              onClick={handleCopyAll}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-primary" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copiado!" : "Copiar Tudo"}
            </Button>

            <Link to="/dashboard" className="w-full" onClick={() => onOpenChange(false)}>
              <Button variant="default" className="w-full">
                <Clapperboard className="w-4 h-4 mr-2" />
                Usar em Roteiros IA
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranscriptionDialog;
