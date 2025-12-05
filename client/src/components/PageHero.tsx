import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import laundromatHero1 from "@assets/stock_images/modern_commercial_la_6265d953.jpg";
import laundromatHero2 from "@assets/stock_images/modern_commercial_la_00163675.jpg";
import laundromatHero3 from "@assets/stock_images/modern_commercial_la_a4c798d9.jpg";
import businessHero1 from "@assets/stock_images/professional_busines_50c2d465.jpg";
import businessHero2 from "@assets/stock_images/professional_busines_caca5117.jpg";
import cityHero1 from "@assets/stock_images/modern_city_skyline__f719cb12.jpg";
import cityHero2 from "@assets/stock_images/modern_city_skyline__50406b4f.jpg";

export type HeroVariant = "laundromat" | "business" | "city" | "funding" | "consulting" | "premium";
export type HeroLayout = "centered" | "split";

const heroImages: Record<HeroVariant, string[]> = {
  laundromat: [laundromatHero1, laundromatHero2, laundromatHero3],
  business: [businessHero1, businessHero2],
  city: [cityHero1, cityHero2],
  funding: [cityHero1, cityHero2],
  consulting: [businessHero1, businessHero2],
  premium: [cityHero1, businessHero1],
};

interface PageHeroProps {
  title: string;
  subtitle?: string;
  variant?: HeroVariant;
  imageIndex?: number;
  className?: string;
  overlay?: "mesh" | "gradient" | "solid" | "light";
  size?: "sm" | "md" | "lg";
  layout?: HeroLayout;
  showBadge?: boolean;
  badgeText?: string;
  mediaContent?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  variant = "laundromat",
  imageIndex = 0,
  className,
  overlay = "mesh",
  size = "md",
  layout = "centered",
  showBadge = false,
  badgeText,
  mediaContent,
  children,
}: PageHeroProps) {
  const images = heroImages[variant];
  const selectedImage = images[imageIndex % images.length];

  const sizeClasses = {
    sm: "py-12 md:py-16",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
  };

  const textColorClass = overlay === "light" ? "text-[#1e3a5f]" : "text-white";
  const subtextColorClass = overlay === "light" ? "text-slate-600" : "text-white/85";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        sizeClasses[size],
        className
      )}
      data-testid="page-hero"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${selectedImage})` }}
        aria-hidden="true"
      />
      
      {overlay === "mesh" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f]/95 to-[#0f1d30]" aria-hidden="true" />
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 80% 50% at 20% 40%, rgba(200, 166, 97, 0.25) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 60%, rgba(184, 134, 11, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse 40% 30% at 50% 80%, rgba(212, 160, 48, 0.1) 0%, transparent 50%)
              `
            }}
            aria-hidden="true"
          />
        </>
      )}
      
      {overlay === "gradient" && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/90 via-[#1e3a5f]/85 to-[#0A1628]/90"
          aria-hidden="true" 
        />
      )}
      
      {overlay === "solid" && (
        <div className="absolute inset-0 bg-[#0A1628]/85" aria-hidden="true" />
      )}
      
      {overlay === "light" && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-white/90" aria-hidden="true" />
      )}

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        {layout === "centered" ? (
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-4">
            {showBadge && badgeText && (
              <Badge 
                className="w-fit bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/40 backdrop-blur-sm"
                data-testid="badge-hero"
              >
                {badgeText}
              </Badge>
            )}
            
            {subtitle && (
              <p className="text-xs md:text-sm font-semibold tracking-widest text-[#C8A661] uppercase">
                {subtitle}
              </p>
            )}
            
            <h1 
              className={cn(
                "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
                textColorClass
              )}
              data-testid="text-hero-title"
            >
              {title}
            </h1>
            
            {children && (
              <div className={cn("mt-2 text-base md:text-lg max-w-2xl", subtextColorClass)}>
                {children}
              </div>
            )}
            
            {mediaContent && (
              <div className="mt-8 w-full max-w-3xl">
                {mediaContent}
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col gap-4 text-center lg:text-left items-center lg:items-start">
              {showBadge && badgeText && (
                <Badge 
                  className="w-fit bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/40 backdrop-blur-sm"
                  data-testid="badge-hero"
                >
                  {badgeText}
                </Badge>
              )}
              
              {subtitle && (
                <p className="text-xs md:text-sm font-semibold tracking-widest text-[#C8A661] uppercase">
                  {subtitle}
                </p>
              )}
              
              <h1 
                className={cn(
                  "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
                  textColorClass
                )}
                data-testid="text-hero-title"
              >
                {title}
              </h1>
              
              {children && (
                <div className={cn("mt-2 text-base md:text-lg max-w-xl", subtextColorClass)}>
                  {children}
                </div>
              )}
            </div>
            
            {mediaContent && (
              <div className="relative flex items-center justify-center">
                <div className="relative z-10 transform lg:translate-x-4 lg:translate-y-2 shadow-2xl rounded-xl overflow-hidden">
                  {mediaContent}
                </div>
                <div 
                  className="absolute inset-0 opacity-20 blur-3xl"
                  style={{
                    background: "radial-gradient(circle at center, rgba(200, 166, 97, 0.3) 0%, transparent 70%)"
                  }}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHero;
