"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface RobustImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onError?: () => void;
  fallbackComponent?: React.ReactNode;
}

export const RobustImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  onError,
  fallbackComponent 
}: RobustImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  if (hasError) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <div 
        className={`${className} bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/20 relative`}
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
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div 
          className={`${className} bg-muted flex items-center justify-center absolute inset-0`}
        >
          <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};
