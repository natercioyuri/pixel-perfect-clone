import { useMemo, useState } from "react";
import { Clapperboard, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useViralVideos } from "@/hooks/useViralProducts";
import type { Tables } from "@/integrations/supabase/types";

interface TranscriptionScriptGeneratorProps {
  onGenerated: (script: string) => void;
  onGeneratingChange: (value: boolean) => void;
}

type ViralVideo = Tables<"viral_videos">;

const parseTranscriptionText = (raw: string | null) => {
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed) {
      return [parsed.gancho, parsed.dor, parsed.solucao, parsed.descricao]
        .filter(Boolean)
        .join("\n\n");
    }
  } catch {
    return raw;
  }

  return raw;
};

const TranscriptionScriptGenerator = ({ onGenerated, onGeneratingChange }: TranscriptionScriptGeneratorProps) => {
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: videos } = useViralVideos({ sortBy: "trending", search: "" });

  const transcribedVideos = useMemo(
    () => (videos || []).filter((video) => video.transcription),
    [videos]
  );

  const selectedVideo = useMemo(
    () => transcribedVideos.find((video) => video.id === selectedVideoId) || null,
    [transcribedVideos, selectedVideoId]
  );

  const handleGenerateFromVideo = async () => {
    if (!selectedVideo?.transcription) {
      toast({ title: "Selecione um vídeo transcrito", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    onGeneratingChange(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          action: "generate",
          mode: "transcription",
          videoTitle: selectedVideo.title,
          transcription: parseTranscriptionText(selectedVideo.transcription),
          productName: selectedVideo.product_name,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      onGenerated(data.script || data.message || "Script gerado com sucesso!");
      toast({ title: "Roteiro gerado a partir da transcrição! 🎬" });
    } catch (e: any) {
      toast({
        title: "Erro na geração",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      onGeneratingChange(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div>
        <h3 className="font-display font-semibold text-lg">Gerar roteiro de vídeo viral</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Reaproveite transcrições já salvas para transformar um vídeo vencedor em um novo roteiro comercial.
        </p>
      </div>

      <select
        value={selectedVideoId}
        onChange={(e) => setSelectedVideoId(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        <option value="">Selecione um vídeo transcrito</option>
        {transcribedVideos.map((video: ViralVideo) => (
          <option key={video.id} value={video.id}>
            {(video.title || "Vídeo viral").slice(0, 80)}
          </option>
        ))}
      </select>

      {selectedVideo && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{selectedVideo.title || "Vídeo viral"}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedVideo.creator_name || "Criador não informado"}
            {selectedVideo.product_name ? ` • Produto: ${selectedVideo.product_name}` : ""}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-4">
            {parseTranscriptionText(selectedVideo.transcription).slice(0, 320)}
          </p>
        </div>
      )}

      <Button onClick={handleGenerateFromVideo} disabled={!selectedVideo || isGenerating} className="w-full">
        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Clapperboard className="w-4 h-4 mr-2" />}
        {isGenerating ? "Gerando roteiro..." : "Gerar roteiro com base na transcrição"}
      </Button>
    </div>
  );
};

export default TranscriptionScriptGenerator;
