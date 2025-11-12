import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, Palette, Brain, ShoppingBag, TrendingUp, MapPin, FileText, Wrench,
  BookOpen, Sparkles, Target, DollarSign, Award, CheckCircle, Zap
} from "lucide-react";
import logoUrl from "@assets/LOGO REAL_1762809085350.png";

export default function Home() {
  const features = [
    {
      icon: Palette,
      title: "2D/3D Design Studio",
      description: "Professional layout tools with equipment library and AI optimization",
      link: "/design-studio",
      badge: "Premium",
    },
    {
      icon: Brain,
      title: "CLEANBI™ Scoring",
      description: "17-factor analysis system with AI-powered insights",
      link: "/cleanbi",
      badge: "AI-Powered",
    },
    {
      icon: BookOpen,
      title: "Professional Courses",
      description: "Expert-led training programs for laundromat success",
      link: "/courses",
      badge: "New",
    },
    {
      icon: FileText,
      title: "Digital Book",
      description: "Complete laundromat business guide with embedded calculators",
      link: "/book",
      badge: "Bestseller",
    },
    {
      icon: Calculator,
      title: "ROI Calculator",
      description: "Advanced financial projections with interactive charts",
      link: "/roi-calculator",
      badge: "Free",
    },
    {
      icon: DollarSign,
      title: "Funding Matcher",
      description: "Connect with lenders and calculate SBA loan eligibility",
      link: "/funding-matcher",
      badge: "Free",
    },
    {
      icon: ShoppingBag,
      title: "Amazon Superstore",
      description: "500+ professional products with affiliate benefits",
      link: "/superstore",
      badge: "Free",
    },
    {
      icon: Sparkles,
      title: "AI Blogging Agent",
      description: "Multi-AI content generation with 5 leading providers",
      link: "/ai-blogging",
      badge: "Premium",
    },
    {
      icon: Target,
      title: "SEO Optimizer",
      description: "Advanced keyword research and competitor analysis",
      link: "/seo-optimizer",
      badge: "Premium",
    },
    {
      icon: FileText,
      title: "Blog Suite",
      description: "Manual, AI, and user-generated expert content",
      link: "/blog",
      badge: null,
    },
    {
      icon: Wrench,
      title: "Parts Store",
      description: "2,800+ fault codes with genuine replacement parts",
      link: "/parts",
      badge: null,
    },
    {
      icon: MapPin,
      title: "Laundromat Locator",
      description: "Find and list laundromats nationwide",
      link: "/locator",
      badge: null,
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.link}>
                <Card 
                  className="bg-white/10 backdrop-blur border-white/20 hover-elevate active-elevate-2 h-full transition-all"
                  data-testid={`card-feature-${index}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <feature.icon className="h-10 w-10 text-accent flex-shrink-0" />
                      {feature.badge && (
                        <Badge variant={feature.badge === "Free" ? "default" : "secondary"} className="text-xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-white/70">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-black text-white text-center mb-4" data-testid="text-pricing-title">
            Pricing That Scales With You
          </h2>
          <p className="text-xl text-white/70 text-center mb-12 max-w-2xl mx-auto">
            Start free, upgrade when ready. Professional tools at a fraction of traditional consulting costs.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <Card className="bg-white/5 backdrop-blur border-white/20">
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">Free Forever</Badge>
                <CardTitle className="text-white text-3xl mb-2">Starter</CardTitle>
                <div className="text-4xl font-black text-white mb-2">$0</div>
                <CardDescription className="text-white/70">
                  Essential tools to get started
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6 space-y-3">
                <div className="flex gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>ROI Calculator with charts</span>
                </div>
                <div className="flex gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Funding Matcher (SBA loans)</span>
                </div>
                <div className="flex gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Amazon Superstore access</span>
                </div>
                <div className="flex gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Blog & community content</span>
                </div>
                <div className="flex gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Laundromat locator</span>
                </div>
              </CardContent>
              <CardContent>
                <Link href="/calculator">
                  <Button className="w-full" variant="outline" data-testid="button-get-started-free">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur border-accent/50 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-white text-3xl mb-2">Pro</CardTitle>
                <div className="text-5xl font-black text-white mb-2">
                  $97<span className="text-xl font-normal text-white/70">/mo</span>
                </div>
                <CardDescription className="text-white/90">
                  Complete platform access
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/20" />
              <CardContent className="pt-6 space-y-3">
                <div className="text-sm font-semibold text-accent mb-2">Everything in Free, plus:</div>
                <div className="flex gap-2 text-white">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>2D/3D Design Studio</span>
                </div>
                <div className="flex gap-2 text-white">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>CLEANBI™ 17-Factor Scoring</span>
                </div>
                <div className="flex gap-2 text-white">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Multi-AI Blogging Agent</span>
                </div>
                <div className="flex gap-2 text-white">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>SEO Optimizer & Analytics</span>
                </div>
                <div className="flex gap-2 text-white">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Advanced revenue calculators</span>
                </div>
                <div className="flex gap-2 text-white">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              </CardContent>
              <CardContent>
                <Link href="/subscribe">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold" size="lg" data-testid="button-subscribe-pro">
                    Start Pro Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="bg-white/5 backdrop-blur border-white/20">
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">Enterprise</Badge>
                <CardTitle className="text-white text-3xl mb-2">Custom</CardTitle>
                <div className="text-4xl font-black text-white mb-2">Let's Talk</div>
                <CardDescription className="text-white/70">
                  For multi-location operators
                </CardDescription>
              </CardHeader>
              <Separator className="bg-white/10" />
              <CardContent className="pt-6 space-y-3">
                <div className="text-sm font-semibold text-accent mb-2">Everything in Pro, plus:</div>
                <div className="flex gap-2 text-white/90">
                  <Award className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </div>
                <div className="flex gap-2 text-white/90">
                  <Award className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Custom integrations</span>
                </div>
                <div className="flex gap-2 text-white/90">
                  <Award className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>API access</span>
                </div>
                <div className="flex gap-2 text-white/90">
                  <Award className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>White-label options</span>
                </div>
                <div className="flex gap-2 text-white/90">
                  <Award className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Volume discounts</span>
                </div>
              </CardContent>
              <CardContent>
                <Button className="w-full" variant="outline" data-testid="button-contact-sales">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div data-testid="stat-equipment">
              <div className="text-4xl font-black text-accent mb-2">500+</div>
              <div className="text-xl text-white/80">Products</div>
            </div>
            <div data-testid="stat-ai-providers">
              <div className="text-4xl font-black text-accent mb-2">5</div>
              <div className="text-xl text-white/80">AI Providers</div>
            </div>
            <div data-testid="stat-tools">
              <div className="text-4xl font-black text-accent mb-2">12+</div>
              <div className="text-xl text-white/80">Premium Tools</div>
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
