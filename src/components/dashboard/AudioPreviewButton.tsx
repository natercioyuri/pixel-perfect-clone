import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { fetchProxiedAudio } from "@/lib/audioProxy";

interface AudioPreviewButtonProps {
  audioUrl: string | null;
  audioName: string;
}

let activeAudioElement: HTMLAudioElement | null = null;

const AudioPreviewButton = ({ audioUrl, audioName }: AudioPreviewButtonProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(!audioUrl);

  useEffect(() => {
    setResolvedUrl(null);
    setIsPlaying(false);
    setIsUnavailable(!audioUrl);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (resolvedUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(resolvedUrl);
      }

      if (activeAudioElement === audioRef.current) {
        activeAudioElement = null;
      }
    };
  }, [resolvedUrl]);

  const handleTogglePlayback = async () => {
    if (!audioUrl || isUnavailable) {
      toast({
        title: "Prévia indisponível",
        description: "Este áudio não possui um stream reproduzível no momento.",
        variant: "destructive",
      });
      return;
    }

    const audioElement = audioRef.current;
    if (!audioElement || isLoading) return;

    if (isPlaying) {
      audioElement.pause();
      return;
    }

    setIsLoading(true);

    try {
      const nextUrl = resolvedUrl ?? (await fetchProxiedAudio(audioUrl));

      if (!nextUrl) {
        throw new Error("Audio unavailable");
      }

      if (activeAudioElement && activeAudioElement !== audioElement) {
        activeAudioElement.pause();
      }

      if (audioElement.src !== nextUrl) {
        audioElement.src = nextUrl;
        audioElement.load();
      }

      activeAudioElement = audioElement;
      setResolvedUrl(nextUrl);
      await audioElement.play();
    } catch {
      setIsUnavailable(true);
      toast({
        title: "Não foi possível reproduzir",
        description: `A fonte de \"${audioName}\" não retornou um stream válido.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleTogglePlayback}
        disabled={isLoading || isUnavailable}
        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary disabled:text-muted-foreground/50"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-3 h-3 mr-1" />
        ) : (
          <Play className="w-3 h-3 mr-1" />
        )}
        {isUnavailable ? "Indisponível" : isLoading ? "Carregando" : isPlaying ? "Pausar" : "Ouvir"}
      </Button>
    </>
  );
};

export default AudioPreviewButton;
