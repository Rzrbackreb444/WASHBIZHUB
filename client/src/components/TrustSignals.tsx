import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, Users, MapPin, DollarSign, Building2, 
  Shield, CheckCircle, Clock, TrendingUp, Award,
  Handshake, FileCheck, Target, Zap
} from "lucide-react";

export type TrustSignalsVariant = "stats" | "testimonials" | "logos" | "compact";

interface TrustSignalsProps {
  variant: TrustSignalsVariant;
  className?: string;
  showTitle?: boolean;
}

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company?: string;
  location?: string;
  rating: number;
  quote: string;
  image?: string;
  highlight?: string;
}

interface StatData {
  id: string;
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}

interface PartnerLogo {
  id: string;
  name: string;
  icon: React.ElementType;
}

const LAUNDROMAT_TESTIMONIALS: TestimonialData[] = [
  {
    id: "testimonial-1",
    name: "Marcus D.",
    role: "First-Time Buyer",
    location: "Austin, TX",
    rating: 5,
    quote: "CLEANBI saved me from a bad deal. The location I was eyeing scored a 38 - turns out there were 5 competitors within 1.5 miles I completely missed. Dodged a $150K mistake.",
    highlight: "$150K saved"
  },
  {
    id: "testimonial-2",
    name: "Sarah & James K.",
    role: "Multi-Unit Operators",
    company: "K&S Laundry Group",
    location: "Phoenix, AZ",
    rating: 5,
    quote: "Got funded in 48 hours through WashBizHub. The funding matcher connected us with a lender who understood the laundromat business. We've since acquired 3 more locations.",
    highlight: "48hr funding"
  },
  {
    id: "testimonial-3",
    name: "David T.",
    role: "Acquisition Buyer",
    location: "Dallas, TX",
    rating: 5,
    quote: "The due diligence checklist was invaluable. I went into negotiations knowing exactly what to ask. Ended up negotiating $40K off the asking price based on equipment age alone.",
    highlight: "$40K negotiated"
  },
  {
    id: "testimonial-4",
    name: "Jennifer M.",
    role: "Serial Entrepreneur",
    company: "Bright Clean Laundry",
    location: "Atlanta, GA",
    rating: 5,
    quote: "The ROI calculator predicted 18-month payback on my $280K investment. I'm at month 14 and already at 85% ROI. This platform actually knows the industry.",
    highlight: "14-month ROI"
  },
  {
    id: "testimonial-5",
    name: "Robert L.",
    role: "Equipment Broker",
    location: "Los Angeles, CA",
    rating: 5,
    quote: "I use CLEANBI for every client presentation now. It gives my buyers confidence and speeds up deals. My close rate is up 35% since I started using WashBizHub.",
    highlight: "35% higher close rate"
  },
  {
    id: "testimonial-6",
    name: "Michelle P.",
    role: "Owner-Operator",
    company: "Suds & Spin",
    location: "Chicago, IL",
    rating: 5,
    quote: "As a first-time owner, I was terrified of making the wrong choice. The step-by-step guides and community support made the entire process manageable. Best $99 investment ever.",
    highlight: "First location success"
  }
];

const PLATFORM_STATS: StatData[] = [
  {
    id: "stat-locations",
    icon: MapPin,
    value: "500+",
    label: "Locations Analyzed",
    color: "text-[#b8860b]"
  },
  {
    id: "stat-partners",
    icon: Handshake,
    value: "7",
    label: "Funding Partners",
    color: "text-[#1e3a5f]"
  },
  {
    id: "stat-funding",
    icon: DollarSign,
    value: "$50M+",
    label: "in Funding Connected",
    color: "text-[#b8860b]"
  },
  {
    id: "stat-users",
    icon: Users,
    value: "1,000+",
    label: "Active Users",
    color: "text-[#1e3a5f]"
  }
];

const PARTNER_LOGOS: PartnerLogo[] = [
  { id: "partner-sba", name: "SBA Approved", icon: Shield },
  { id: "partner-equipment", name: "Equipment Verified", icon: CheckCircle },
  { id: "partner-lenders", name: "Trusted Lenders", icon: Building2 },
  { id: "partner-industry", name: "Industry Certified", icon: Award }
];

const COMPACT_BADGES = [
  { id: "badge-locations", text: "500+ Locations Analyzed", icon: MapPin },
  { id: "badge-funding", text: "$50M+ Funded", icon: DollarSign },
  { id: "badge-support", text: "24/7 Expert Support", icon: Clock },
  { id: "badge-trusted", text: "Trusted by 1,000+ Owners", icon: Users }
];

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  return (
    <Card 
      className="hover-elevate h-full"
      data-testid={`card-testimonial-${testimonial.id}`}
    >
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-1 mb-3" data-testid={`rating-${testimonial.id}`}>
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
            />
          ))}
        </div>
        
        {testimonial.highlight && (
          <Badge 
            variant="secondary" 
            className="w-fit mb-3 bg-accent/10 text-accent border-0"
            data-testid={`highlight-${testimonial.id}`}
          >
            {testimonial.highlight}
          </Badge>
        )}
        
        <p 
          className="text-muted-foreground mb-4 flex-1 leading-relaxed"
          data-testid={`quote-${testimonial.id}`}
        >
          "{testimonial.quote}"
        </p>
        
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
          <Avatar className="h-10 w-10" data-testid={`avatar-${testimonial.id}`}>
            {testimonial.image && <AvatarImage src={testimonial.image} alt={testimonial.name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {testimonial.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm" data-testid={`name-${testimonial.id}`}>
              {testimonial.name}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`role-${testimonial.id}`}>
              {testimonial.role}
              {testimonial.company && `, ${testimonial.company}`}
            </p>
            {testimonial.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {testimonial.location}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsBar({ showTitle = false }: { showTitle?: boolean }) {
  return (
    <div data-testid="trust-signals-stats">
      {showTitle && (
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">Trusted Platform</Badge>
          <h2 className="text-3xl font-semibold mb-3">The Numbers Speak for Themselves</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of laundromat investors who trust WashBizHub for data-driven decisions
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {PLATFORM_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="text-center p-4 md:p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              data-testid={stat.id}
            >
              <Icon className={`h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 ${stat.color}`} />
              <p 
                className="text-2xl md:text-3xl font-bold mb-1"
                data-testid={`value-${stat.id}`}
              >
                {stat.value}
              </p>
              <p 
                className="text-xs md:text-sm text-muted-foreground"
                data-testid={`label-${stat.id}`}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestimonialsGrid({ showTitle = false }: { showTitle?: boolean }) {
  return (
    <div data-testid="trust-signals-testimonials">
      {showTitle && (
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">Success Stories</Badge>
          <h2 className="text-3xl font-semibold mb-3">Real Results from Real Owners</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how WashBizHub has helped laundromat investors make smarter decisions
          </p>
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LAUNDROMAT_TESTIMONIALS.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

function PartnerLogos({ showTitle = false }: { showTitle?: boolean }) {
  return (
    <div data-testid="trust-signals-logos">
      {showTitle && (
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Trusted By Industry Leaders
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
        {PARTNER_LOGOS.map((partner) => {
          const Icon = partner.icon;
          return (
            <div 
              key={partner.id}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              data-testid={partner.id}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{partner.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompactBadges() {
  return (
    <div 
      className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
      data-testid="trust-signals-compact"
    >
      {COMPACT_BADGES.map((badge) => {
        const Icon = badge.icon;
        return (
          <div 
            key={badge.id}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-muted-foreground"
            data-testid={badge.id}
          >
            <Icon className="h-3.5 w-3.5 text-accent" />
            <span>{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TrustSignals({ variant, className = "", showTitle = false }: TrustSignalsProps) {
  const renderVariant = () => {
    switch (variant) {
      case "stats":
        return <StatsBar showTitle={showTitle} />;
      case "testimonials":
        return <TestimonialsGrid showTitle={showTitle} />;
      case "logos":
        return <PartnerLogos showTitle={showTitle} />;
      case "compact":
        return <CompactBadges />;
      default:
        return <StatsBar showTitle={showTitle} />;
    }
  };

  return (
    <div className={className} data-testid={`trust-signals-${variant}`}>
      {renderVariant()}
    </div>
  );
}

interface TestimonialProps {
  name: string;
  role: string;
  company?: string;
  rating: number;
  text: string;
  image?: string;
}

export function Testimonial({ name, role, company, rating, text, image }: TestimonialProps) {
  return (
    <Card className="hover-elevate" data-testid={`testimonial-${name.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardContent className="p-6">
        <div className="flex items-center mb-4" data-testid="testimonial-rating">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} 
            />
          ))}
        </div>
        <p className="text-muted-foreground mb-4 italic" data-testid="testimonial-quote">"{text}"</p>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10" data-testid="testimonial-avatar">
            {image && <AvatarImage src={image} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold" data-testid="testimonial-name">{name}</p>
            <p className="text-sm text-muted-foreground" data-testid="testimonial-role">
              {role}{company ? ` at ${company}` : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="trust-badges">
      <div 
        className="flex flex-col items-center text-center p-4 bg-[#1e3a5f]/5 rounded-lg"
        data-testid="badge-secure-checkout"
      >
        <Shield className="h-8 w-8 text-[#1e3a5f] mb-2" />
        <p className="font-semibold text-sm">Secure Checkout</p>
        <p className="text-xs text-muted-foreground">Protected payments</p>
      </div>
      <div 
        className="flex flex-col items-center text-center p-4 bg-[#b8860b]/5 rounded-lg"
        data-testid="badge-certified-partners"
      >
        <Award className="h-8 w-8 text-[#b8860b] mb-2" />
        <p className="font-semibold text-sm">Certified Partners</p>
        <p className="text-xs text-muted-foreground">Authorized Dealers</p>
      </div>
      <div 
        className="flex flex-col items-center text-center p-4 bg-[#b8860b]/5 rounded-lg"
        data-testid="badge-fast-funding"
      >
        <Zap className="h-8 w-8 text-[#b8860b] mb-2" />
        <p className="font-semibold text-sm">Fast Funding</p>
        <p className="text-xs text-muted-foreground">48-hour approvals</p>
      </div>
      <div 
        className="flex flex-col items-center text-center p-4 bg-[#1e3a5f]/5 rounded-lg"
        data-testid="badge-expert-support"
      >
        <Target className="h-8 w-8 text-[#1e3a5f] mb-2" />
        <p className="font-semibold text-sm">Expert Support</p>
        <p className="text-xs text-muted-foreground">Industry specialists</p>
      </div>
    </div>
  );
}

export function SocialProofStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="social-proof-stats">
      {PLATFORM_STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.id} 
            className="text-center p-4 bg-card border rounded-lg"
            data-testid={`social-${stat.id}`}
          >
            <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export const TESTIMONIALS: TestimonialProps[] = [
  {
    name: "Sarah Johnson",
    role: "Owner",
    company: "Clean Sweep Laundromat",
    rating: 5,
    text: "WashBizHub helped me find the perfect equipment package. The ROI calculator was spot-on, and I recouped my investment in just 18 months!"
  },
  {
    name: "Mike Rodriguez",
    role: "Multi-Location Operator",
    company: "Rodriguez Laundry Centers",
    rating: 5,
    text: "The buyer's guides saved me thousands. I compared 10+ washers and chose the most efficient option. My utility costs are down 30%."
  },
  {
    name: "Lisa Chen",
    role: "New Owner",
    company: "Fresh Start Laundromat",
    rating: 5,
    text: "As a first-time owner, the startup guide was invaluable. Step-by-step instructions made the entire process smooth and stress-free."
  },
  {
    name: "David Thompson",
    role: "Equipment Manager",
    company: "QuickWash Express",
    rating: 5,
    text: "The equipment comparison tool helped me justify the Speed Queen purchase to my investors. We're seeing 40% better reliability than our old machines."
  },
  {
    name: "Jennifer Martinez",
    role: "Owner",
    company: "Sparkling Clean Laundry",
    rating: 5,
    text: "Amazon affiliate links made ordering parts so easy! One-click ordering with tracking. My downtime is cut in half."
  },
  {
    name: "Robert Kim",
    role: "Franchise Owner",
    rating: 5,
    text: "The financing guide connected me with an SBA lender who approved my $500K loan. Without WashBizHub, I'd still be searching for funding."
  }
];

export function SuccessStories() {
  return (
    <div className="space-y-6" data-testid="success-stories">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">Success Stories</Badge>
        <h2 className="text-3xl font-bold mb-3">Real Results from Real Owners</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join thousands of successful laundromat owners who trust WashBizHub for equipment decisions
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.map((testimonial, idx) => (
          <Testimonial key={idx} {...testimonial} />
        ))}
      </div>
    </div>
  );
}

export { LAUNDROMAT_TESTIMONIALS, PLATFORM_STATS, PARTNER_LOGOS, COMPACT_BADGES };
