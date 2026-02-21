import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Share2, Video, TrendingUp, ExternalLink, BarChart3 } from "lucide-react";

interface CreatorData {
  name: string;
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgEngagement: number;
  avgTrending: number;
  topHashtags: string[];
}

interface CreatorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: CreatorData | null;
  rank: number;
}

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const CreatorDetailDialog = ({ open, onOpenChange, creator, rank }: CreatorDetailDialogProps) => {
  if (!creator) return null;

  const handle = creator.name.startsWith("@") ? creator.name : `@${creator.name}`;
  const cleanName = creator.name.replace(/^@/, "");
  const tiktokUrl = `https://www.tiktok.com/@${encodeURIComponent(cleanName)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg"
              style={{
                background: `hsl(${(rank * 40 + 260) % 360} 60% 30%)`,
                color: `hsl(${(rank * 40 + 260) % 360} 60% 80%)`,
              }}
            >
              {creator.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold">{handle}</p>
              {rank < 3 && (
                <Badge className="text-[10px] bg-purple-500/20 text-purple-300 hover:bg-purple-500/20 mt-1">
                  TOP {rank + 1}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Video className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{creator.videoCount}</p>
              <p className="text-[10px] text-muted-foreground">Vídeos</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Eye className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{formatNumber(creator.totalViews)}</p>
              <p className="text-[10px] text-muted-foreground">Views totais</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Heart className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{formatNumber(creator.totalLikes)}</p>
              <p className="text-[10px] text-muted-foreground">Likes totais</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Share2 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{formatNumber(creator.totalShares)}</p>
              <p className="text-[10px] text-muted-foreground">Shares totais</p>
            </div>
          </div>

          {/* Engagement & Trending */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <p className="text-xs text-muted-foreground">Engajamento médio</p>
              </div>
              <p className="text-sm font-bold">{creator.avgEngagement.toFixed(2)}%</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <p className="text-xs text-muted-foreground">Trending médio</p>
              </div>
              <p className="text-sm font-bold">{creator.avgTrending.toFixed(1)}</p>
            </div>
          </div>

          {/* Hashtags */}
          {creator.topHashtags.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Hashtags populares</p>
              <div className="flex flex-wrap gap-1.5">
                {creator.topHashtags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-border">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Button asChild className="w-full gap-2" variant="default">
            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Visitar perfil no TikTok
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorDetailDialog;
