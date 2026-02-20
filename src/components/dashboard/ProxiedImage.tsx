import { useState } from "react";
import { ShoppingBag } from "lucide-react";

interface ProxiedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackIconSize?: string;
}

const ProxiedImage = ({ src, alt, className = "", fallbackClassName = "", fallbackIconSize = "w-12 h-12" }: ProxiedImageProps) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={fallbackClassName || `${className} bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center`}>
        <ShoppingBag className={`${fallbackIconSize} text-primary/40`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default ProxiedImage;
