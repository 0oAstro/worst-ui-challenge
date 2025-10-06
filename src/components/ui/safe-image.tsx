"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onError?: () => void;
}

export const SafeImage = ({ src, alt, width, height, className, onError }: SafeImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [useDirectSrc, setUseDirectSrc] = useState(false);

  const proxiedSrc = useMemo(() => {
    // Check if the URL is external and needs proxying
    if (src.startsWith('http://') || src.startsWith('https://')) {
      try {
        const url = new URL(src);
        // Only proxy external domains, not localhost or same origin
        if (url.hostname !== 'localhost' && url.hostname !== window.location.hostname) {
          return `/api/image-proxy?url=${encodeURIComponent(src)}`;
        }
      } catch (error) {
        console.warn('Invalid URL:', src);
      }
    }
    return src;
  }, [src]);

  const handleError = () => {
    // If proxy failed, try direct source as fallback
    if (!useDirectSrc && proxiedSrc !== src) {
      setUseDirectSrc(true);
      return;
    }
    
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={`${className} bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/20`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-muted-foreground text-sm mb-1">Image unavailable</div>
          <div className="text-xs text-muted-foreground/60">External image blocked</div>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={useDirectSrc ? src : proxiedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
};
