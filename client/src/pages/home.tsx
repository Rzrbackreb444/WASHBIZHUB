import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { ValuePropCards } from "@/components/ValuePropCards";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { FeaturedListings } from "@/components/FeaturedListings";
import { FeaturedBlogsCarousel } from "@/components/FeaturedBlogsCarousel";
import { FeaturedListingsCarousel } from "@/components/FeaturedListingsCarousel";
import { AAdvantageSpotlight } from "@/components/AAdvantageSpotlight";
import { 
  BookOpen, GraduationCap, Phone, Download, DollarSign, 
  Building2, Rocket, TrendingUp, ArrowRight, Shield, Zap, Users, AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import modernMachinesImg from "@assets/AdobeStock_832897447_1763779877616.jpeg";
import industrialRowImg from "@assets/AdobeStock_790549884_1763779877616.jpeg";
import washerDrumsImg from "@assets/AdobeStock_561067303_1763779877613.jpeg";
import colorfulLoadImg from "@assets/AdobeStock_711286802_1763779877615.jpeg";
import dexterLaundromat from "@assets/Dexter Laundromat_1763779877618.jpg";
import serviceGuyAI from "@assets/service guy ai_1763780009739.png";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": "Professional Laundromat Business Platform",
    "url": typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com",
    "description": "Enterprise-grade SaaS platform for laundromat owners, investors, and operators. Features CLEANBI™ scoring, 2D/3D design studio, marketplace, IoT POS integration, AI-powered pricing, and comprehensive industry resources.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com"}/resources?searchQuery={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
  // Fetch templates for display
  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ['/api/templates'],
  });
  
  return (
    <>
      <SEO
        title="WashBizHub - Enterprise Laundromat Management Software & Marketplace"
        description="Professional laundromat business management platform with POS systems, IoT monitoring, AI consulting, marketplace, CLEANBI™ scoring, design studio, ROI calculators, and industry resources. Serving 72,000+ laundromat owners, investors, and operators worldwide with enterprise-grade coin laundry solutions."
        canonicalUrl="/"
        keywords={[
          "laundromat management software",
          "coin laundry business platform",
          "laundromat POS system",
          "commercial laundry equipment marketplace",
          "laundromat investment calculator",
          "CLEANBI business valuation",
          "laundromat IoT monitoring",
          "self-service laundry management",
          "coin-operated laundry software",
          "laundromat design studio",
          "commercial washing machine business",
          "laundromat ROI calculator",
          "coin laundry consulting",
          "laundromat ROI calculator"
        ]}
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <Hero />
      
      {/* Value Props */}
      <ValuePropCards />

      {/* Featured Listings */}
      <FeaturedListings />

      {/* Featured Blogs Carousel */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <FeaturedBlogsCarousel />
      </section>

      {/* Featured Listings Carousel */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <FeaturedListingsCarousel />
      </section>

      {/* AAdvantage Laundry Equipment Spotlight - Ultra SEO Optimized */}
      <AAdvantageSpotlight />

      {/* Newsletter Signup */}
      <section className="py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <NewsletterSignup variant="hero" source="home_page" />
        </div>
      </section>

      {/* Feature Section 1: Enterprise Equipment */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg order-2 lg:order-1">
              <img 
                src={modernMachinesImg} 
                alt="Modern commercial front-load washers and dryers in pristine white and silver finish - enterprise-grade laundromat equipment for professional laundry operations"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            </div>
            {/* Content */}
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Shield className="w-3 h-3 mr-1" />
                Enterprise Grade
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                Built For Professional Operations
              </h2>
              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                WashBizHub powers laundromats across North America with enterprise-grade POS systems, 
                IoT machine monitoring, and real-time business intelligence. Track every transaction, 
                monitor equipment health, and optimize operations from a single platform.
              </p>
              <div className="space-y-3 mb-8">
                {["Real-time POS & inventory tracking", "IoT machine diagnostics", "Multi-location dashboard"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/cleanbi">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                  data-testid="button-feature-cleanbi"
                >
                  Explore CLEANBI™
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: IoT Analytics */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                <Zap className="w-3 h-3 mr-1" />
                Smart Analytics
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 uppercase tracking-tight">
                Predictive Maintenance & Real-Time Insights
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Stop breakdowns before they happen. Our IoT sensors monitor temperature, vibration, 
                and water flow across all machines, alerting you to issues before customers notice. 
                Reduce downtime by 40% and extend equipment life.
              </p>
              <div className="space-y-3 mb-8">
                {["2,800+ diagnostic codes", "Automated maintenance alerts", "Energy consumption tracking"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    <span className="text-foreground/90">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/design-studio">
                <Button 
                  size="lg"
                  variant="outline"
                  className="hover-elevate active-elevate-2"
                  data-testid="button-feature-design"
                >
                  Design Your Layout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={industrialRowImg} 
                alt="Industrial row of heavy-duty commercial washers in professional laundry facility - high-capacity coin-operated laundromat machines for commercial use"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-accent/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Industry Heritage */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg order-2 lg:order-1">
              <img 
                src={washerDrumsImg} 
                alt="Commercial washing machine drums and interior - professional laundromat equipment maintenance and diagnostics"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
            </div>
            {/* Content */}
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Users className="w-3 h-3 mr-1" />
                Trusted Heritage
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 uppercase tracking-tight">
                72,000 Owners. Decades Of Expertise.
              </h2>
              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                From Facebook's largest laundromat community to The Laundromat Bible—we've built 
                the industry's most comprehensive knowledge base. Now available as an AI-powered 
                consultant trained on every best practice, diagnostic code, and success story.
              </p>
              <div className="space-y-3 mb-8">
                {["72,000+ community members", "The Laundromat Bible + Courses", "AI-powered business consultant"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/book">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                  data-testid="button-feature-book"
                >
                  Get The Complete Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-templates-heading"
            >
              Start With Proven Templates & Guides
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional resources to launch and grow your business
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(templates || []).slice(0, 4).map((template: any, idx: number) => (
              <Card 
                key={template.id}
                className="overflow-hidden hover-elevate transition-all"
                data-testid={`card-template-${idx}`}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {template.imageUrl && (
                    <img 
                      src={template.imageUrl} 
                      alt={template.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {!template.isPremium && (
                    <Badge 
                      className="absolute top-3 left-3 bg-background text-foreground"
                      data-testid={`badge-free-${idx}`}
                    >
                      Free
                    </Badge>
                  )}
                  {template.isPremium && (
                    <Badge 
                      className="absolute top-3 left-3 bg-primary text-primary-foreground"
                      data-testid={`badge-premium-${idx}`}
                    >
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {template.category}
                  </div>
                  <h3 
                    className="mb-2 text-sm font-bold uppercase text-foreground"
                    data-testid={`text-template-title-${idx}`}
                  >
                    {template.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {template.isPremium ? `$${template.price}` : 'FREE'}
                    </span>
                    <Button 
                      size="sm" 
                      variant={template.isPremium ? "default" : "outline"}
                      data-testid={`button-template-${idx}`}
                    >
                      {template.isPremium ? (
                        <>Purchase</>
                      ) : (
                        <>
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/templates">
              <Button 
                variant="outline"
                size="lg"
                className="hover-elevate active-elevate-2"
                data-testid="button-see-all-templates"
              >
                See All Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Financing Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-financing-heading"
            >
              Secure Financing For Your Laundromat
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore financing options and get funded faster
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "SBA 7(A) LOAN", description: "Government-backed financing with favorable terms" },
              { icon: Building2, title: "COMMERCIAL REAL ESTATE", description: "Traditional commercial property financing" },
              { icon: DollarSign, title: "EQUIPMENT FINANCING", description: "Loans specifically for laundry equipment" },
              { icon: Rocket, title: "STARTUP FINANCING", description: "Funding packages for new laundromat builds" },
            ].map((option, idx) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={idx}
                  className="p-8 text-center hover-elevate transition-all"
                  data-testid={`card-financing-${idx}`}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/funding-matcher">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                data-testid="button-start-application"
              >
                Start Application
              </Button>
            </Link>
            <Link href="/consultation">
              <Button 
                size="lg"
                variant="outline"
                className="hover-elevate active-elevate-2"
                data-testid="button-book-consultation"
              >
                Book a Funding Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Guy AI Section - Honoring Guy Kremers */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={serviceGuyAI} 
                  alt="Service Guy AI - AI-Powered Repair Diagnostics honoring Guy Kremers"
                  className="h-16 w-auto"
                  loading="lazy"
                />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 uppercase tracking-tight">
                Service Guy AI
              </h2>
              <p className="text-sm text-white/60 italic mb-6">
                Honoring Guy Kremers - A lifetime of service excellence
              </p>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                Get instant access to 2,800+ diagnostic codes with step-by-step repair instructions, 
                safety warnings, and one-click parts ordering. Service Guy AI combines decades of 
                technician expertise with modern AI to help you troubleshoot and repair equipment faster.
              </p>
              <div className="space-y-3 mb-8">
                {["2,800+ diagnostic error codes", "Step-by-step repair instructions", "Amazon parts ordering integration", "Safety disclaimers & professional guidance"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60 mb-8 p-4 bg-white/5 rounded-md border border-white/10">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="italic">For educational purposes only. Always consult a certified professional technician.</span>
              </div>
              <Link href="/repair-guide">
                <Button 
                  size="lg"
                  className="bg-accent text-accent-foreground hover-elevate active-elevate-2"
                  data-testid="button-service-guy-ai"
                >
                  Launch Service Guy AI
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg order-first lg:order-last">
              <img 
                src={colorfulLoadImg} 
                alt="Professional laundromat service and maintenance - Service Guy AI diagnostic tools"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3"
              data-testid="text-education-heading"
            >
              Learn From The Experts
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive education and guidance for every stage
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "THE ULTIMATE LAUNDROMAT GUIDEBOOK",
                description: "The definitive guide to buying, operating, and scaling profitable laundromats",
                action: "Get the Book",
                link: "/book",
              },
              {
                icon: GraduationCap,
                title: "ONLINE COURSES",
                description: "Self-paced courses to master every aspect of the laundromat business",
                action: "Enroll Now",
                link: "/courses",
              },
              {
                icon: Phone,
                title: "CONSULTATIONS",
                description: "One-on-one guidance on acquisitions, operations, and growth strategy",
                action: "Book a Call",
                link: "/consultation",
              },
            ].map((edu, idx) => {
              const Icon = edu.icon;
              return (
                <Card 
                  key={idx}
                  className="p-8 text-center hover-elevate transition-all"
                  data-testid={`card-education-${idx}`}
                >
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
                    {edu.title}
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                    {edu.description}
                  </p>
                  <Link href={edu.link}>
                    <Button 
                      className={idx === 2 ? "bg-primary text-primary-foreground" : ""}
                      variant={idx === 2 ? "default" : "outline"}
                      data-testid={`button-education-${idx}`}
                    >
                      {edu.action}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Background Image with Strong Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={washerDrumsImg} 
            alt="Satisfied laundromat customer smiling while loading washing machine - positive customer experience in modern self-service laundry facility demonstrating quality service"
            className="w-full h-full object-cover opacity-20"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/95" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 mx-auto">
            <Users className="w-3 h-3 mr-1" />
            Customer Success
          </Badge>
          <blockquote className="mb-8">
            <p className="text-2xl sm:text-3xl font-bold text-white mb-6 italic">
              "WashBizHub transformed how we run our 3 locations. The IoT monitoring caught a bearing 
              failure before it destroyed a $4,000 machine. The platform paid for itself in one month."
            </p>
            <footer className="flex items-center justify-center gap-4">
              <div className="text-left">
                <div className="text-lg font-semibold text-white">Maria Gonzalez</div>
                <div className="text-sm text-white/60">Owner, Clean Spin Laundromats • Chicago, IL</div>
              </div>
            </footer>
          </blockquote>
          <div className="grid sm:grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/10">
            {[
              { value: "72,000+", label: "Industry Members" },
              { value: "40%", label: "Downtime Reduction" },
              { value: "$1.2M+", label: "Saved in Repairs" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-white/70 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 
            className="text-3xl font-bold uppercase tracking-tight text-foreground mb-6"
            data-testid="text-cta-heading"
          >
            Ready To Build A Stronger Laundry Business?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/templates">
              <Button 
                size="lg"
                variant="outline"
                className="hover-elevate active-elevate-2"
                data-testid="button-cta-templates"
              >
                Get Free Templates
              </Button>
            </Link>
            <Link href="/consultation">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover-elevate active-elevate-2"
                data-testid="button-cta-consultation"
              >
                Book a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
