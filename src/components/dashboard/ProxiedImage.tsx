import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { fetchProxiedImage } from "@/lib/imageProxy";

interface ProxiedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackIconSize?: string;
}

const ProxiedImage = ({ src, alt, className = "", fallbackClassName = "", fallbackIconSize = "w-12 h-12" }: ProxiedImageProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    let revoke: string | null = null;

    fetchProxiedImage(src).then((url) => {
      if (url) {
        setImgSrc(url);
        // Track blob URLs for cleanup
        if (url.startsWith("blob:")) revoke = url;
      } else {
        setFailed(true);
      }
      setLoading(false);
    });

    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [src]);

  if (!src || failed || (loading === false && !imgSrc)) {
    return (
      <div className={fallbackClassName || `${className} bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center`}>
        <ShoppingBag className={`${fallbackIconSize} text-primary/40`} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={fallbackClassName || `${className} bg-muted animate-pulse`} />
    );
  }

  return (
    <img
      src={imgSrc!}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default ProxiedImage;
