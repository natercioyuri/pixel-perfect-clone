import { Video, ExternalLink, Flame, Eye, Heart, Share2, MessageSquare, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import TranscriptionDialog from "@/components/dashboard/TranscriptionDialog";
import SaveButton from "./SaveButton";
import type { Tables } from "@/integrations/supabase/types";

type ViralVideo = Tables<"viral_videos"> & {
  transcription?: string | null;
  product_name?: string | null;
  duration_seconds?: number | null;
  engagement_rate?: number | null;
};

interface VideoCardProps {
  video: ViralVideo;
  index: number;
  onTranscribe?: (videoId: string) => void;
  isTranscribing?: boolean;
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

const isValidTikTokUrl = (url: string | null): boolean => {
  if (!url) return false;
  return /^https?:\/\/(?:www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/.test(url);
};

const VideoCard = ({ video, index, onTranscribe, isTranscribing }: VideoCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTranscribeClick = () => {
    if (video.transcription) {
      setDialogOpen(true);
    } else if (onTranscribe) {
      onTranscribe(video.id);
    }
  };

  const validUrl = isValidTikTokUrl(video.video_url);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="glass rounded-xl overflow-hidden group hover:border-primary/30 transition-all"
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title || ""}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full absolute inset-0 items-center justify-center ${video.thumbnail_url ? "hidden" : "flex"}`}
              >
                <Video className="w-7 h-7 text-primary" />
              </div>
              <div className="absolute bottom-0 right-0 bg-background/90 px-1 py-0.5 rounded-tl text-[10px] font-semibold">
                {video.duration_seconds
                  ? `${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, "0")}`
                  : "0:30"}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">
                {video.title || "Vídeo viral"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {video.creator_name || "Criador TikTok"}
              </p>
              {video.product_name && (
                <p className="text-xs text-primary mt-0.5 truncate">
                  🛍️ {video.product_name}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-1 flex-shrink-0">
              <Flame className="w-3 h-3 text-primary" />
              <span className="text-xs font-bold text-primary">
                {Number(video.trending_score || 0).toFixed(1)}
              </span>
            </div>
          </div>

          {video.hashtags && video.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {video.hashtags.slice(0, 5).map((h) => (
                <span key={h} className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {h.startsWith("#") ? h : `#${h}`}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="bg-secondary rounded-lg p-2 text-center">
              <Eye className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
              <p className="text-xs font-semibold">{formatNumber(video.views)}</p>
              <p className="text-[10px] text-muted-foreground">views</p>
            </div>
            <div className="bg-secondary rounded-lg p-2 text-center">
              <Heart className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
              <p className="text-xs font-semibold">{formatNumber(video.likes)}</p>
              <p className="text-[10px] text-muted-foreground">likes</p>
            </div>
            <div className="bg-secondary rounded-lg p-2 text-center">
              <Share2 className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
              <p className="text-xs font-semibold">{formatNumber(video.shares)}</p>
              <p className="text-[10px] text-muted-foreground">shares</p>
            </div>
            <div className="bg-secondary rounded-lg p-2 text-center">
              <MessageSquare className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
              <p className="text-xs font-semibold">{formatNumber(video.comments)}</p>
              <p className="text-[10px] text-muted-foreground">comments</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground">Receita estimada</p>
              <p className="font-display font-bold text-primary text-sm">
                {formatCurrency(video.revenue_estimate)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <SaveButton videoId={video.id} />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTranscribeClick}
                disabled={isTranscribing}
                className={`text-xs ${
                  video.transcription
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground"
                }`}
              >
                <FileText className={`w-4 h-4 mr-1 ${isTranscribing ? "animate-pulse" : ""}`} />
                {isTranscribing
                  ? "Gerando..."
                  : video.transcription
                  ? "Ver Roteiro"
                  : "Transcrever"}
              </Button>

              {validUrl ? (
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="Abrir vídeo no TikTok"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="text-muted-foreground/30" title="Link indisponível">
                  <ExternalLink className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <TranscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        videoTitle={video.title || "Vídeo viral"}
        transcription={video.transcription || null}
      />
    </>
  );
};

export default VideoCard;
