import React, { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackIcon,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Extract size and shape info from className
  const sizeMatch = className?.match(/(w-\d+|h-\d+)/g) || [];
  const widthClass = sizeMatch.find((c) => c.startsWith("w-")) || "w-10";
  const heightClass = sizeMatch.find((c) => c.startsWith("h-")) || "h-10";
  const isRounded = className?.includes("rounded-full");

  // Default fallback icon
  const defaultFallback = (
    <div
      className={cn(
        "w-full h-full bg-muted flex items-center justify-center",
        isRounded ? "rounded-full" : "rounded"
      )}
    >
      <User className="h-[60%] w-[60%] text-muted-foreground" />
    </div>
  );

  const fallback = fallbackIcon || defaultFallback;

  return (
    <div
      className={cn(
        "relative inline-block",
        widthClass,
        heightClass,
        className?.includes("object-cover") ? "overflow-hidden" : ""
      )}
    >
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-muted",
            isRounded
              ? "rounded-full"
              : className?.match(/rounded[^\s]*/)?.[0] || "rounded"
          )}
        />
      )}

      {/* Actual image */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0 absolute inset-0" : "opacity-100",
            className
          )}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback}
        </div>
      )}
    </div>
  );
};
