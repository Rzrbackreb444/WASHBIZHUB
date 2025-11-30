import { useState, useRef, useEffect, memo } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
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
  srcSet,
  "data-testid": testId,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!alt || alt.trim() === "") {
      console.warn(
        `[OptimizedImage] Missing or empty alt text for image: ${src}. Please provide descriptive alt text for accessibility.`
      );
    }
  }, [alt, src]);

  useEffect(() => {
    if (!width || !height) {
      console.warn(
        `[OptimizedImage] Missing width or height for image: ${src}. Providing explicit dimensions prevents layout shift.`
      );
    }
  }, [width, height, src]);

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

  const generateSrcSet = (imageSrc: string): string | undefined => {
    if (srcSet) return srcSet;
    
    if (!imageSrc || imageSrc.startsWith("data:")) return undefined;
    
    if (imageSrc.includes("unsplash.com")) {
      return `${imageSrc}&w=400 400w, ${imageSrc}&w=800 800w, ${imageSrc}&w=1200 1200w`;
    }
    
    return undefined;
  };

  const computedSrcSet = isInView ? generateSrcSet(src) : undefined;

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`${className} flex items-center justify-center bg-slate-800 text-slate-400 text-sm`}
        style={{ width, height }}
        data-testid={testId}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={isInView ? src : PLACEHOLDER_SVG}
      srcSet={computedSrcSet}
      alt={alt || ""}
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
    if (!alt || alt.trim() === "") {
      console.warn(
        `[OptimizedBackgroundImage] Missing or empty alt text for image: ${src}. Please provide descriptive alt text for accessibility.`
      );
    }
  }, [alt, src]);

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
      aria-label={alt || "Background image"}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
