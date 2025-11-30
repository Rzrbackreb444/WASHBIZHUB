import { useState, useRef, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  srcSet?: string;
  sizes?: string;
  "data-testid"?: string;
}

export function LazyImage({
  src,
  alt,
  className = "",
  width,
  height,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3C/svg%3E",
  srcSet,
  sizes,
  "data-testid": testId,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!alt || alt.trim() === "") {
      console.warn(
        `[LazyImage] Missing or empty alt text for image: ${src}. Please provide descriptive alt text for accessibility.`
      );
    }
  }, [alt, src]);

  useEffect(() => {
    if (!width || !height) {
      console.warn(
        `[LazyImage] Missing width or height for image: ${src}. Providing explicit dimensions prevents layout shift.`
      );
    }
  }, [width, height, src]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const generateSrcSet = (imageSrc: string): string | undefined => {
    if (srcSet) return srcSet;
    
    if (!imageSrc || imageSrc.startsWith("data:")) return undefined;
    
    if (imageSrc.includes("unsplash.com")) {
      return `${imageSrc}&w=400 400w, ${imageSrc}&w=800 800w, ${imageSrc}&w=1200 1200w`;
    }
    
    return undefined;
  };

  const computedSrcSet = isInView ? generateSrcSet(src) : undefined;

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      srcSet={computedSrcSet}
      sizes={sizes || (computedSrcSet ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : undefined)}
      alt={alt || ""}
      className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      data-testid={testId}
      style={{
        backgroundColor: isLoaded ? "transparent" : "#f3f4f6",
      }}
    />
  );
}

export default LazyImage;
