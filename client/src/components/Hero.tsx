import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/IMG_5796_1763738809544.jpeg";
import aadvantageLogoUrl from "@assets/als_logo_1763778178009.png";
import londrLogoUrl from "@assets/Londr_1763778448894.png";
import serviceGuyAiLogoUrl from "@assets/Guy_1764032619732.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Premium stacked commercial laundromat washers and dryers in modern industrial facility - professional laundry equipment for enterprise-grade operations"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Strong dark gradient overlay - fades to white at bottom for logo visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/98 via-gray-900/96 to-white" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Main Heading - Brighter with gold accent */}
          <h1 
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl uppercase mb-6 text-white drop-shadow-2xl"
            data-testid="text-hero-title"
          >
            WashBizHub <span className="text-primary">Laundry Intelligence</span>
          </h1>
          
          {/* Subtitle - Much brighter */}
          <p 
            className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium drop-shadow-lg"
            data-testid="text-hero-subtitle"
          >
            The all-in-one platform for laundromat owners, buyers, and vendors
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <Link href="/templates">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/95 text-gray-900 border-2 border-white/30 hover:bg-white hover-elevate active-elevate-2 font-semibold"
                data-testid="button-get-templates"
              >
                Get Free Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/funding-matcher">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2 font-semibold shadow-xl shadow-primary/20"
                data-testid="button-start-funding"
              >
                Start Funding Application
              </Button>
            </Link>
          </div>

          {/* Trust Badges - Logo Grid */}
          <div className="border-t border-gray-300/30 pt-12 bg-white/95 backdrop-blur-sm rounded-lg px-8 py-10">
            <p 
              className="text-sm font-bold tracking-wider text-gray-700 uppercase mb-10"
              data-testid="text-trusted-by"
            >
              Trusted By Industry Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10">
              {/* AAdvantage Laundry Systems Logo - Clickable */}
              <a 
                href="https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-16 flex items-center opacity-90 hover:opacity-100 transition-all hover:scale-105 active-elevate-2"
                data-testid="brand-logo-aadvantage"
              >
                <img 
                  src={aadvantageLogoUrl} 
                  alt="AAdvantage Laundry Systems" 
                  className="h-full w-auto object-contain"
                />
              </a>
              
              {/* LONDR Logo - Clickable */}
              <a 
                href="https://londr.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-16 flex items-center opacity-90 hover:opacity-100 transition-all hover:scale-105 active-elevate-2"
                data-testid="brand-logo-londr"
              >
                <img 
                  src={londrLogoUrl} 
                  alt="LONDR" 
                  className="h-full w-auto object-contain"
                />
              </a>
              
              {/* Service Guy AI Logo - Clickable - Named after founder's father */}
              <Link href="/service-guy-ai">
                <div
                  className="h-20 flex items-center opacity-90 hover:opacity-100 transition-all hover:scale-105 active-elevate-2 cursor-pointer"
                  data-testid="brand-logo-service-guy-ai"
                >
                  <img 
                    src={serviceGuyAiLogoUrl} 
                    alt="Service Guy AI - AI-Powered Equipment Diagnostics" 
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
