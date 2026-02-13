import { Video, ExternalLink, Flame } from "lucide-react";
import { motion } from "framer-motion";
import type { ViralVideo } from "@/hooks/useViralProducts";

interface VideoRowProps {
  video: ViralVideo;
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

const VideoRow = ({ video, index }: VideoRowProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Video className="w-6 h-6 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-sm truncate">{video.title || "Sem título"}</h3>
        <p className="text-xs text-muted-foreground">{video.creator_name || "Criador desconhecido"}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {(video.hashtags || []).map((h) => (
            <span key={h} className="text-xs text-primary/70">
              {h.startsWith("#") ? h : `#${h}`}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
        <div className="text-center">
          <p className="font-semibold text-foreground">{formatNumber(video.views)}</p>
          <p>views</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{formatNumber(video.likes)}</p>
          <p>likes</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{formatNumber(video.shares)}</p>
          <p>shares</p>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-display font-bold text-primary text-sm">{formatCurrency(video.revenue_estimate)}</p>
        <div className="flex items-center gap-1 justify-end mt-1">
          <Flame className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold">{Number(video.trending_score || 0).toFixed(1)}</span>
        </div>
      </div>

      <a
        href={video.video_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
};

export default VideoRow;
