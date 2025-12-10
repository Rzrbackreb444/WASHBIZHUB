import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SEO } from "@/components/SEO";
import { 
  Award, MessageCircle, Phone, Mail, MapPin,
  Star, Calendar, FileSearch, Handshake, PenTool, FileSignature,
  Wrench, ShieldCheck, Scale, TrendingUp, Shield
} from "lucide-react";
import larryLarsenPhoto from "@assets/image_1765341641648.png";

const CONSULT_EMAIL = "consult@washbizhub.com";

const services = [
  {
    title: "Due Diligence",
    description: "Comprehensive analysis of any laundromat opportunity before you buy",
    icon: FileSearch
  },
  {
    title: "Buyer Consulting",
    description: "Expert guidance through the entire acquisition process",
    icon: Handshake
  },
  {
    title: "Store Design",
    description: "Optimize layout for maximum efficiency and customer flow",
    icon: PenTool
  },
  {
    title: "Lease Analysis",
    description: "Review and negotiate favorable lease terms",
    icon: FileSignature
  },
  {
    title: "Equipment Evaluation",
    description: "Assess machine condition, age, and replacement costs",
    icon: Wrench
  },
  {
    title: "Laundromat Insurance",
    description: "Complete insurance solutions - property, liability, equipment, and business interruption coverage",
    icon: Shield
  },
  {
    title: "Expert Witness",
    description: "Professional testimony for legal matters",
    icon: Scale
  },
  {
    title: "Broker Services",
    description: "Help selling your laundromat at the right price",
    icon: TrendingUp
  }
];

const testimonials = [
  {
    quote: "Larry's due diligence saved me from a $300K mistake. His experience is invaluable.",
    author: "Mike R.",
    role: "First-time Buyer, Los Angeles"
  },
  {
    quote: "50 years of knowledge condensed into actionable advice. Worth every penny.",
    author: "Sarah T.",
    role: "Multi-store Owner, San Diego"
  },
  {
    quote: "The equipment evaluation alone paid for his consultation fees ten times over.",
    author: "James L.",
    role: "Investor, Orange County"
  }
];

export default function LarryLarsen() {
  return (
    <>
      <SEO
        title="Larry 'Laundromat Larry' Larsen - 50+ Years Industry Expert | WashBizHub"
        description="Work with Larry Larsen, a 50+ year veteran of the laundromat industry. Expert consulting for due diligence, acquisitions, equipment evaluation, lease analysis, and more. Based in Orange County, California."
        canonicalUrl="/larry-larsen"
        keywords={["laundromat consultant", "laundromat due diligence", "laundromat expert", "Larry Larsen", "laundromat broker"]}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              {/* Avatar */}
              <div className="flex-shrink-0 text-center">
                <Avatar className="w-44 h-44 md:w-52 md:h-52 mx-auto shadow-2xl shadow-amber-500/20 border-4 border-amber-500/30">
                  <AvatarImage src={larryLarsenPhoto} alt="Larry 'Laundromat Larry' Larsen" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-6xl md:text-7xl font-bold text-white">
                    LL
                  </AvatarFallback>
                </Avatar>
                <div className="mt-6 flex flex-col gap-2 items-center">
                  <Badge className="bg-amber-500 text-black font-bold px-4 py-1.5 text-sm">
                    <Award className="w-4 h-4 mr-1.5" />
                    50+ Years Experience
                  </Badge>
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="flex-1 text-center lg:text-left">
                <Badge variant="outline" className="mb-4 text-muted-foreground">
                  WashBizHub Featured Consultant
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                  Larry "Laundromat Larry" Larsen
                </h1>
                <p className="text-xl text-amber-500 font-medium mb-6">
                  Industry Veteran & Trusted Advisor
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
                  With over five decades in the laundromat industry, Larry has helped hundreds of buyers, 
                  sellers, and operators make smarter business decisions. Based in Orange County, California, 
                  he brings unmatched expertise in due diligence, acquisitions, equipment evaluation, 
                  lease negotiations, and industry best practices.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/ai-consultation-council">
                    <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-bold px-8" data-testid="button-ai-consultation">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      AI Consultation Council
                    </Button>
                  </Link>
                  <a href={`mailto:${CONSULT_EMAIL}?subject=${encodeURIComponent("Laundromat Consulting Inquiry - Larry Larsen")}&body=${encodeURIComponent("Hi,\n\nI'd like to schedule a consultation with Larry Larsen regarding:\n\n[ ] Due Diligence\n[ ] Store Design\n[ ] Laundromat Insurance\n[ ] Equipment Evaluation\n[ ] Lease Analysis\n[ ] Acquisition Consulting\n[ ] Other: ___________\n\nPlease contact me at your earliest convenience.\n\nThank you!")}`}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" data-testid="button-email-consult">
                      <Mail className="w-5 h-5 mr-2" />
                      Request Consultation
                    </Button>
                  </a>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  <span className="text-amber-500">Tip:</span> Try our AI Consultation Council for instant expert advice, or request a personal consultation with Larry for complex matters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Bar */}
        <section className="py-6 bg-muted/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Orange County, California (Serving Nationwide)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-amber-500" />
                <a href={`mailto:${CONSULT_EMAIL}`} className="hover:text-foreground transition-colors">
                  {CONSULT_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="w-4 h-4 text-amber-500" />
                <span>DRE License #49460</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 md:py-24" data-testid="section-services">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/20">
                Expert Services
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How Larry Can Help You
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Decades of hands-on experience across every aspect of the laundromat business
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <Card key={idx} className="p-5 border-border hover:border-amber-500/30 transition-colors" data-testid={`card-service-${idx}`}>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-testimonials">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
                <Star className="w-3 h-3 mr-1.5" />
                Client Success
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What Clients Say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="p-6 border-border" data-testid={`card-testimonial-${idx}`}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-4 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t border-border pt-4">
                    <p className="font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20" data-testid="section-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Work With Larry?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Whether you're buying, selling, or optimizing — get expert guidance from someone 
              who's been in the industry for over 50 years.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
                <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-bold px-8" data-testid="button-schedule-call">
                  <Phone className="w-5 h-5 mr-2" />
                  Schedule a Call
                </Button>
              </Link>
              <Link href="/ai-consultation">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" data-testid="button-ai-consultation">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  AI Consultation Council
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
