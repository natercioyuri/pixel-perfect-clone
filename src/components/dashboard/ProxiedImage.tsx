import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";

interface ProxiedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackIconSize?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const buildAttempts = (src: string): string[] => {
  const attempts: string[] = [];
  // For tiktokcdn URLs, prefer weserv (most reliable) first
  if (src.includes("tiktokcdn")) {
    attempts.push(`https://images.weserv.nl/?url=${encodeURIComponent(src.replace(/^https?:\/\//, ""))}&n=-1`);
    attempts.push(`https://wsrv.nl/?url=${encodeURIComponent(src)}&n=-1`);
    attempts.push(src);
  } else {
    attempts.push(src);
    attempts.push(`https://images.weserv.nl/?url=${encodeURIComponent(src.replace(/^https?:\/\//, ""))}&n=-1`);
  }
  return attempts;
};

const ProxiedImage = ({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  fallbackIconSize = "w-12 h-12",
}: ProxiedImageProps) => {
  const [attemptIdx, setAttemptIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempts, setAttempts] = useState<string[]>([]);

  useEffect(() => {
    if (!src) {
      setFailed(true);
      return;
    }
    setAttempts(buildAttempts(src));
    setAttemptIdx(0);
    setFailed(false);
  }, [src]);

  if (!src || failed || attempts.length === 0) {
    return (
      <div
        className={
          fallbackClassName ||
          `${className} bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center`
        }
      >
        <ShoppingBag className={`${fallbackIconSize} text-primary/40`} />
      </div>
    );
  }

  return (
    <img
      src={attempts[attemptIdx]}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (attemptIdx < attempts.length - 1) {
          setAttemptIdx(attemptIdx + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
};

export default ProxiedImage;
