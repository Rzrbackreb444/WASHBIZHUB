import { Button } from "@/components/ui/button";
import { Chrome, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/IMG_5796_1763738809544.jpeg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Premium stacked commercial laundromat washers and dryers in modern industrial facility - professional laundry equipment for enterprise-grade operations"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-white drop-shadow-2xl"
            data-testid="text-hero-title"
          >
            The All-In-One Platform for the <span className="text-primary">Laundromat Industry</span>
          </h1>
          
          <p 
            className="text-lg sm:text-xl text-gray-200 mb-6 max-w-2xl mx-auto font-medium drop-shadow-lg"
            data-testid="text-hero-subtitle"
          >
            Whether you're dreaming, buying, operating, or partnering — we've got you covered
          </p>

          <p 
            className="text-sm text-accent font-semibold mb-10"
            data-testid="text-hero-trust-stat"
          >
            Trusted by 72,000+ laundromat professionals worldwide
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="https://chrome.google.com/webstore/detail/cleanbi-anywhere" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                className="bg-accent text-accent-foreground hover-elevate active-elevate-2 font-semibold shadow-xl shadow-accent/20"
                data-testid="button-hero-chrome-extension"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Install Free Chrome Extension
              </Button>
            </a>
            <Link href="/cleanbi">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover-elevate active-elevate-2 font-semibold backdrop-blur-sm"
                data-testid="button-hero-try-cleanbi"
              >
                Try CLEANBI Score Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
