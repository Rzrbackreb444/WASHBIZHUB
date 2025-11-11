import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Palette, Brain, ShoppingBag, TrendingUp, MapPin, FileText, Wrench } from "lucide-react";
import logoUrl from "@assets/LOGO REAL_1762809085350.png";

export default function Home() {
  const features = [
    {
      icon: Palette,
      title: "2D/3D Design Studio",
      description: "Professional layout tools with equipment library and AI optimization",
      link: "/design-studio",
    },
    {
      icon: Brain,
      title: "CLEANBI™ Scoring",
      description: "17-factor analysis system with AI-powered insights",
      link: "/cleanbi",
    },
    {
      icon: Calculator,
      title: "Revenue Calculator",
      description: "Precise financial projections for your laundromat business",
      link: "/calculator",
    },
    {
      icon: FileText,
      title: "Blog Suite",
      description: "Manual, AI, and user-generated expert content",
      link: "/blog",
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Verified vendors with storefronts and affiliate tracking",
      link: "/marketplace",
    },
    {
      icon: Wrench,
      title: "Parts Store",
      description: "2,800+ fault codes with genuine replacement parts",
      link: "/parts",
    },
    {
      icon: MapPin,
      title: "Laundromat Locator",
      description: "Find and list laundromats nationwide",
      link: "/locator",
    },
    {
      icon: TrendingUp,
      title: "Pro Subscription",
      description: "Unlock premium features for $97/month",
      link: "/subscribe",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${logoUrl})`,
            backgroundSize: "600px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <img 
            src={logoUrl} 
            alt="WashBizHub Logo" 
            className="h-32 mx-auto mb-8"
            data-testid="img-hero-logo"
          />
          <h1 className="text-6xl font-black text-white mb-4" data-testid="text-hero-title">
            The Bloomberg of Laundromats
          </h1>
          <p className="text-2xl text-white/90 mb-4 font-medium" data-testid="text-hero-tagline">
            STRATEGY • FUNDING • GROWTH
          </p>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto" data-testid="text-hero-description">
            Professional business intelligence platform for laundromat operators. 
            Design, analyze, and scale your $100M empire with AI-powered tools.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/design-studio">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg rounded-full font-bold"
                data-testid="button-start-designing"
              >
                Start Designing
              </Button>
            </Link>
            <Link href="/calculator">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-accent text-white bg-white/10 backdrop-blur px-8 py-6 text-lg rounded-full font-bold hover:bg-white/20"
                data-testid="button-free-calculator"
              >
                Free Calculator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-black text-white text-center mb-4" data-testid="text-features-title">
            Complete Business Platform
          </h2>
          <p className="text-xl text-white/70 text-center mb-12 max-w-2xl mx-auto" data-testid="text-features-subtitle">
            Everything you need to design, analyze, and operate a profitable laundromat business
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} href={feature.link}>
                <Card 
                  className="bg-white/10 backdrop-blur border-white/20 hover-elevate active-elevate-2 h-full transition-all"
                  data-testid={`card-feature-${index}`}
                >
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-accent mb-4" />
                    <CardTitle className="text-white text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-white/70 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div data-testid="stat-equipment">
              <div className="text-4xl font-black text-accent mb-2">500+</div>
              <div className="text-xl text-white/80">Equipment Models</div>
            </div>
            <div data-testid="stat-fault-codes">
              <div className="text-4xl font-black text-accent mb-2">2,800+</div>
              <div className="text-xl text-white/80">Diagnostic Codes</div>
            </div>
            <div data-testid="stat-operators">
              <div className="text-4xl font-black text-accent mb-2">70K+</div>
              <div className="text-xl text-white/80">Operators Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="WashBizHub" className="h-12" />
              <div className="text-white/60 text-sm">
                © 2024 WashBizHub.com • STRATEGY • FUNDING • GROWTH
              </div>
            </div>
            <div className="flex gap-6 text-white/60 text-sm">
              <Link href="/blog">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-blog">Blog</span>
              </Link>
              <Link href="/marketplace">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-marketplace">Marketplace</span>
              </Link>
              <Link href="/subscribe">
                <span className="hover:text-accent transition-colors cursor-pointer" data-testid="link-footer-pro">Go Pro</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
