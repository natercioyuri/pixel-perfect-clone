import { Filter, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface VideoFilterState {
  viewsRange: string;
  hasTranscription: string;
  creator: string;
}

interface VideoFiltersProps {
  filters: VideoFilterState;
  onFiltersChange: (filters: VideoFilterState) => void;
  creators: string[];
}

const VideoFilters = ({ filters, onFiltersChange, creators }: VideoFiltersProps) => {
  const hasActiveFilter =
    filters.viewsRange !== "all" || filters.hasTranscription !== "all" || filters.creator !== "all";

  const resetFilters = () =>
    onFiltersChange({ viewsRange: "all", hasTranscription: "all", creator: "all" });

  return (
    <div className="glass rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Filtros Avançados</span>
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto text-xs text-muted-foreground">
            <X className="w-3 h-3 mr-1" /> Limpar
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Views</label>
          <Select value={filters.viewsRange} onValueChange={(v) => onFiltersChange({ ...filters, viewsRange: v })}>
            <SelectTrigger className="h-8 text-xs bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="1m+">1M+</SelectItem>
              <SelectItem value="500k+">500K+</SelectItem>
              <SelectItem value="100k+">100K+</SelectItem>
              <SelectItem value="10k+">10K+</SelectItem>
              <SelectItem value="<10k">&lt;10K</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Transcrição</label>
          <Select value={filters.hasTranscription} onValueChange={(v) => onFiltersChange({ ...filters, hasTranscription: v })}>
            <SelectTrigger className="h-8 text-xs bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="yes">
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Com transcrição</span>
              </SelectItem>
              <SelectItem value="no">Sem transcrição</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Criador</label>
          <Select value={filters.creator} onValueChange={(v) => onFiltersChange({ ...filters, creator: v })}>
            <SelectTrigger className="h-8 text-xs bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {creators.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default VideoFilters;

export function applyVideoFilters(
  videos: any[],
  filters: VideoFilterState
): any[] {
  let result = videos;

  if (filters.viewsRange !== "all") {
    const thresholds: Record<string, [number, number]> = {
      "1m+": [1000000, Infinity],
      "500k+": [500000, Infinity],
      "100k+": [100000, Infinity],
      "10k+": [10000, Infinity],
      "<10k": [0, 10000],
    };
    const [min, max] = thresholds[filters.viewsRange] || [0, Infinity];
    result = result.filter((v) => {
      const views = Number(v.views) || 0;
      return views >= min && views < max;
    });
  }

  if (filters.hasTranscription === "yes") {
    result = result.filter((v) => v.transcription);
  } else if (filters.hasTranscription === "no") {
    result = result.filter((v) => !v.transcription);
  }

  if (filters.creator !== "all") {
    result = result.filter((v) => v.creator_name === filters.creator);
  }

  return result;
}
