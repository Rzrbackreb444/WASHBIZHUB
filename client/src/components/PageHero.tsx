import { cn } from "@/lib/utils";

import laundromatHero1 from "@assets/stock_images/modern_commercial_la_6265d953.jpg";
import laundromatHero2 from "@assets/stock_images/modern_commercial_la_00163675.jpg";
import laundromatHero3 from "@assets/stock_images/modern_commercial_la_a4c798d9.jpg";
import businessHero1 from "@assets/stock_images/professional_busines_50c2d465.jpg";
import businessHero2 from "@assets/stock_images/professional_busines_caca5117.jpg";
import cityHero1 from "@assets/stock_images/modern_city_skyline__f719cb12.jpg";
import cityHero2 from "@assets/stock_images/modern_city_skyline__50406b4f.jpg";

export type HeroVariant = "laundromat" | "business" | "city" | "funding" | "consulting";

const heroImages: Record<HeroVariant, string[]> = {
  laundromat: [laundromatHero1, laundromatHero2, laundromatHero3],
  business: [businessHero1, businessHero2],
  city: [cityHero1, cityHero2],
  funding: [cityHero1, cityHero2],
  consulting: [businessHero1, businessHero2],
};

interface PageHeroProps {
  title: string;
  subtitle?: string;
  variant?: HeroVariant;
  imageIndex?: number;
  className?: string;
  overlayColor?: "navy" | "dark" | "accent";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  variant = "laundromat",
  imageIndex = 0,
  className,
  overlayColor = "navy",
  size = "md",
  children,
}: PageHeroProps) {
  const images = heroImages[variant];
  const selectedImage = images[imageIndex % images.length];

  const overlayClasses = {
    navy: "bg-[#0A1628]/80",
    dark: "bg-black/70",
    accent: "bg-[#0A1628]/85",
  };

  const sizeClasses = {
    sm: "py-12 md:py-16",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${selectedImage})` }}
        aria-hidden="true"
      />
      
      <div
        className={cn(
          "absolute inset-0",
          overlayClasses[overlayColor]
        )}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl">
          <p className="text-xs md:text-sm font-semibold tracking-widest text-[#C8A661] uppercase mb-3">
            {subtitle && subtitle.toUpperCase()}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {title}
          </h1>
          {children && (
            <div className="mt-6 text-white/90 text-base md:text-lg max-w-2xl">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHero;
