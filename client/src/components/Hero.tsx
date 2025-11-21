import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=2070')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Main Heading */}
          <h1 
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl uppercase mb-6"
            data-testid="text-hero-title"
          >
            WashBizHub Laundry Intelligence
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            data-testid="text-hero-subtitle"
          >
            The all-in-one platform for laundromat owners, buyers, and vendors
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/templates">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-card/80 backdrop-blur-sm hover-elevate active-elevate-2"
                data-testid="button-get-templates"
              >
                Get Free Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/funding-matcher">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                data-testid="button-start-funding"
              >
                Start Funding Application
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="border-t border-border pt-12">
            <p 
              className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-8"
              data-testid="text-trusted-by"
            >
              Trusted By Industry Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-60">
              {[
                "Dexter Laundry",
                "Speed Queen",
                "Alliance Laundry Systems",
                "Electrolux Professional",
                "Potronix",
                "Ecolab",
                "Maytag Commercial"
              ].map((brand, idx) => (
                <div 
                  key={idx}
                  className="text-xs sm:text-sm font-medium text-foreground/70 uppercase tracking-wide"
                  data-testid={`brand-${idx}`}
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
