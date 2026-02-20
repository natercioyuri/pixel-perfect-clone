import { useState, useEffect, useRef } from "react";
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
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const tryLoad = async () => {
      // If it's already a Supabase Storage URL or non-tiktok URL, use directly
      if (!src.includes('tiktokcdn')) {
        setDisplaySrc(src);
        setLoading(false);
        return;
      }

      // Strategy 1: Try direct URL (some CDN links work with no-referrer)
      const directOk = await testImageUrl(src);
      if (!cancelled && directOk) {
        setDisplaySrc(src);
        setLoading(false);
        return;
      }

      // Strategy 2: Use the proxy edge function
      const proxied = await fetchProxiedImage(src);
      if (!cancelled && proxied) {
        setDisplaySrc(proxied);
        if (proxied.startsWith("blob:")) blobRef.current = proxied;
        setLoading(false);
        return;
      }

      // Strategy 3: Try weserv.nl image proxy
      const weservUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&default=1`;
      const weservOk = await testImageUrl(weservUrl);
      if (!cancelled && weservOk) {
        setDisplaySrc(weservUrl);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setFailed(true);
        setLoading(false);
      }
    };

    tryLoad();

    return () => {
      cancelled = true;
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, [src]);

  if (!src || failed || (loading === false && !displaySrc)) {
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
      src={displaySrc!}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

/** Quick test if an image URL loads (timeout 4s) */
function testImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ""; resolve(false); }, 4000);
    img.referrerPolicy = "no-referrer";
    img.crossOrigin = "anonymous";
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

export default ProxiedImage;
