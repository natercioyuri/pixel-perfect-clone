import { useState } from "react";
import { Music, Play, Clock, Users, TrendingUp, ShieldCheck, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useViralAudios, useAudioGenres, type ViralAudio } from "@/hooks/useViralAudios";
import ProxiedImage from "./ProxiedImage";

function formatNumber(n: number | null | undefined): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const AudioCard = ({ audio, index }: { audio: ViralAudio; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ delay: index * 0.03 }}
    className="glass rounded-xl p-4 hover:scale-[1.01] transition-all group"
  >
    <div className="flex gap-3">
      {/* Cover */}
      <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center relative">
        {audio.cover_image ? (
          <ProxiedImage src={audio.cover_image} alt={audio.audio_name} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-6 h-6 text-muted-foreground" />
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{audio.audio_name}</h3>
            {audio.author_name && (
              <p className="text-xs text-muted-foreground truncate">{audio.author_name}</p>
            )}
          </div>
          <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-400 flex-shrink-0 gap-1">
            <ShieldCheck className="w-3 h-3" />
            Aprovado
          </Badge>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-2 mt-3">
      <div className="bg-secondary/50 rounded-lg p-2 text-center">
        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
          <Users className="w-3 h-3" />
        </div>
        <p className="text-xs font-bold">{formatNumber(audio.usage_count)}</p>
        <p className="text-[10px] text-muted-foreground">Usos</p>
      </div>
      <div className="bg-secondary/50 rounded-lg p-2 text-center">
        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
          <TrendingUp className="w-3 h-3" />
        </div>
        <p className="text-xs font-bold">{audio.trending_score || 0}</p>
        <p className="text-[10px] text-muted-foreground">Score</p>
      </div>
      <div className="bg-secondary/50 rounded-lg p-2 text-center">
        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
          <Clock className="w-3 h-3" />
        </div>
        <p className="text-xs font-bold">{formatDuration(audio.duration_seconds)}</p>
        <p className="text-[10px] text-muted-foreground">Duração</p>
      </div>
    </div>

    {/* Tags */}
    <div className="flex items-center gap-2 mt-3">
      {audio.genre && (
        <Badge variant="secondary" className="text-[10px]">{audio.genre}</Badge>
      )}
      {audio.category && (
        <Badge variant="secondary" className="text-[10px]">{audio.category}</Badge>
      )}
      {audio.audio_url && (
        <a href={audio.audio_url} target="_blank" rel="noopener noreferrer" className="ml-auto">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary">
            <ExternalLink className="w-3 h-3 mr-1" />
            Ouvir
          </Button>
        </a>
      )}
    </div>
  </motion.div>
);

const ViralAudiosTab = () => {
  const [sortBy, setSortBy] = useState<"trending" | "usage" | "recent">("trending");
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");

  const { data: audios, isLoading } = useViralAudios({ sortBy, search, genre: selectedGenre });
  const { data: genres = ["Todos"] } = useAudioGenres();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Áudios Virais — TikTok Shop</h2>
          <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-400 gap-1">
            <ShieldCheck className="w-3 h-3" />
            Só aprovados
          </Badge>
        </div>
      </div>

      {/* Info banner */}
      <div className="glass rounded-xl p-4 border-l-4 border-green-500/60">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Apenas áudios aprovados para TikTok Shop</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os áudios listados aqui são seguros para uso em vídeos de produtos do TikTok Shop, evitando punições por direitos autorais.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedGenre === g
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-secondary border border-border rounded-lg text-xs px-3 py-1.5 text-foreground"
          >
            <option value="trending">Mais Viral</option>
            <option value="usage">Mais Usado</option>
            <option value="recent">Mais Recente</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-xl p-4 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((j) => <Skeleton key={j} className="h-14 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      ) : audios && audios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {audios.map((audio, i) => (
              <AudioCard key={audio.id} audio={audio} index={i} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 glass rounded-xl">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">Nenhum áudio encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Os áudios virais aprovados para TikTok Shop aparecerão aqui em breve.
          </p>
        </div>
      )}
    </div>
  );
};

export default ViralAudiosTab;
