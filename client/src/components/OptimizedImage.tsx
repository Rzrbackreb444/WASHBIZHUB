import { useState, useRef, useEffect, memo } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  sizes?: string;
  "data-testid"?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%231e293b' width='400' height='300'/%3E%3C/svg%3E`;

const BLUR_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect fill='%231e293b' width='400' height='300' filter='url(%23blur)'/%3E%3C/svg%3E`;

function OptimizedImageComponent({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  sizes = "100vw",
  "data-testid": testId,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`${className} flex items-center justify-center bg-slate-800 text-slate-400 text-sm`}
        style={{ width, height }}
        data-testid={testId}
      >
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={isInView ? src : PLACEHOLDER_SVG}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      sizes={sizes}
      onLoad={handleLoad}
      onError={handleError}
      data-testid={testId}
      style={{
        backgroundImage: isLoaded ? "none" : `url("${BLUR_PLACEHOLDER}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);
export default OptimizedImage;

export function OptimizedBackgroundImage({
  src,
  alt,
  className = "",
  children,
  priority = false,
  "data-testid": testId,
}: OptimizedImageProps & { children?: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [isInView, src]);

  return (
    <div
      ref={containerRef}
      className={`${className} transition-opacity duration-500`}
      style={{
        backgroundImage: isLoaded ? `url("${src}")` : `url("${BLUR_PLACEHOLDER}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      role="img"
      aria-label={alt}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
