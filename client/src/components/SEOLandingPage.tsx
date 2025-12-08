/**
 * SEO Landing Page Component
 * 
 * Reusable template for high-ranking SEO landing pages targeting
 * specific keywords with E-E-A-T signals, FAQ structured data,
 * and conversion-optimized layouts.
 */

import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  TrendingUp,
  Shield,
  Users,
  Zap,
  Calculator,
  MapPin,
  FileText,
  Wrench,
  DollarSign,
  Building2,
  Target,
  Award
} from "lucide-react";
import type { SEOPageConfig } from "@/lib/seo-keywords";

interface SEOLandingPageProps {
  config: SEOPageConfig;
  heroImage?: string;
  stats?: Array<{ value: string; label: string }>;
  features?: Array<{ icon: string; title: string; description: string }>;
  testimonials?: Array<{ quote: string; author: string; role: string; rating: number }>;
  cta: {
    primary: { text: string; href: string };
    secondary?: { text: string; href: string };
  };
  relatedTools?: Array<{ name: string; description: string; href: string; icon: string }>;
  children?: React.ReactNode;
}

const iconMap: Record<string, React.ElementType> = {
  calculator: Calculator,
  mapPin: MapPin,
  fileText: FileText,
  wrench: Wrench,
  dollarSign: DollarSign,
  building: Building2,
  target: Target,
  award: Award,
  trendingUp: TrendingUp,
  shield: Shield,
  users: Users,
  zap: Zap,
  star: Star,
  checkCircle: CheckCircle2
};

export function SEOLandingPage({
  config,
  stats,
  features,
  testimonials,
  cta,
  relatedTools,
  children
}: SEOLandingPageProps) {
  return (
    <>
      <SEO
        title={config.title}
        description={config.description}
        keywords={config.keywords}
        canonicalUrl={config.slug}
        breadcrumbs={config.breadcrumbs}
        faqs={config.faqs}
        ogType="website"
        author={{
          name: "WashBizHub Team",
          expertise: "Laundromat Industry Experts",
          credentials: "20+ years combined laundromat industry experience"
        }}
        aggregateRating={{
          itemName: config.h1,
          itemType: "SoftwareApplication",
          ratingValue: 4.9,
          reviewCount: 2400
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-[#0A1628] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-white/60" data-testid="breadcrumb-nav">
              {config.breadcrumbs.map((crumb, idx) => (
                <div key={crumb.url} className="flex items-center gap-2">
                  {idx > 0 && <ChevronRight className="w-4 h-4" />}
                  <Link href={crumb.url}>
                    <span className="hover:text-white cursor-pointer" data-testid={`breadcrumb-${idx}`}>
                      {crumb.name}
                    </span>
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl">
              <Badge variant="secondary" className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Star className="w-3 h-3 mr-1 fill-current" />
                #1 Laundromat Intelligence Platform
              </Badge>
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                data-testid="heading-h1"
              >
                {config.h1}
              </h1>
              
              <p 
                className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed primary-answer speakable-content"
                data-testid="text-description"
              >
                {config.directAnswer}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href={cta.primary.href}>
                  <Button 
                    size="lg" 
                    className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628] font-semibold text-lg px-8 py-6"
                    data-testid="button-cta-primary"
                  >
                    {cta.primary.text}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                {cta.secondary && (
                  <Link href={cta.secondary.href}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
                      data-testid="button-cta-secondary"
                    >
                      {cta.secondary.text}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {stats && stats.length > 0 && (
            <div className="border-t border-white/10">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="text-center" data-testid={`stat-${idx}`}>
                      <div className="text-3xl md:text-4xl font-bold text-[#C8A661]">{stat.value}</div>
                      <div className="text-sm text-white/60 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {features && features.length > 0 && (
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-features">
                Why Industry Leaders Choose WashBizHub
              </h2>
              <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
                Trusted by 2,400+ laundromat owners, operators, brokers, and investors
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, idx) => {
                  const IconComponent = iconMap[feature.icon] || CheckCircle2;
                  return (
                    <Card key={idx} className="border-0 shadow-md" data-testid={`card-feature-${idx}`}>
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-[#C8A661]/10 flex items-center justify-center mb-4">
                          <IconComponent className="w-6 h-6 text-[#C8A661]" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {children}

        <section className="py-16 md:py-24" id="faq">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-faq">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-12">
              {config.primaryQuestion}
            </p>
            
            <div className="space-y-4">
              {config.faqs.map((faq, idx) => (
                <Card key={idx} className="border shadow-sm" data-testid={`faq-${idx}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                      <span>{faq.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pl-12">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {testimonials && testimonials.length > 0 && (
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-testimonials">
                Trusted by Laundromat Professionals
              </h2>
              <p className="text-xl text-muted-foreground text-center mb-12">
                See what our community says about WashBizHub
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial, idx) => (
                  <Card key={idx} className="border-0 shadow-md" data-testid={`testimonial-${idx}`}>
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#C8A661] text-[#C8A661]" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                      <div>
                        <div className="font-semibold">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedTools && relatedTools.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-related">
                Related Tools & Resources
              </h2>
              <p className="text-xl text-muted-foreground text-center mb-12">
                Explore more ways WashBizHub can help your business
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTools.map((tool, idx) => {
                  const IconComponent = iconMap[tool.icon] || Zap;
                  return (
                    <Link key={idx} href={tool.href}>
                      <Card className="border shadow-sm hover-elevate cursor-pointer h-full" data-testid={`tool-${idx}`}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-[#C8A661]" />
                            </div>
                            <CardTitle className="text-lg">{tool.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-24 bg-[#0A1628] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="heading-cta-final">
              Ready to Make Data-Driven Decisions?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join 2,400+ laundromat professionals using WashBizHub to grow their business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={cta.primary.href}>
                <Button 
                  size="lg" 
                  className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628] font-semibold text-lg px-8 py-6"
                  data-testid="button-cta-final"
                >
                  {cta.primary.text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
                  data-testid="button-consult"
                >
                  Talk to an Expert
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default SEOLandingPage;
