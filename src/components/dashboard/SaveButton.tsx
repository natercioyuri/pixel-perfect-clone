import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleSave, useSavedItemIds } from "@/hooks/useSavedItems";

interface SaveButtonProps {
  productId?: string;
  videoId?: string;
  size?: "sm" | "icon";
}

const SaveButton = ({ productId, videoId, size = "icon" }: SaveButtonProps) => {
  const { data: savedIds } = useSavedItemIds();
  const toggleSave = useToggleSave();

  const isSaved = productId
    ? savedIds?.productIds.has(productId)
    : videoId
    ? savedIds?.videoIds.has(videoId)
    : false;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        toggleSave.mutate({ productId, videoId });
      }}
      disabled={toggleSave.isPending}
      className={isSaved ? "text-red-500 hover:text-red-400" : "text-muted-foreground hover:text-red-500"}
    >
      <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
    </Button>
  );
};

export default SaveButton;
