import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Shield, Award, Users, TrendingUp, Clock, CheckCircle2,
  Zap, Building2, DollarSign, Landmark, ArrowRight
} from "lucide-react";

interface AuthorExpertiseProps {
  variant?: "compact" | "full";
}

export function AuthorExpertise({ variant = "full" }: AuthorExpertiseProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Award className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">Expert Reviewed Content</p>
          <p className="text-xs text-muted-foreground">
            By Nicholas Kremers, Laundromat Industry Advisor
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Nicholas Kremers</CardTitle>
            <p className="text-sm text-muted-foreground">Laundromat Industry Advisor & Funding Expert</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Founder of WashBizHub, the #1 laundromat resource platform with 72,000+ members. 
          Specializing in helping entrepreneurs navigate laundromat financing, acquisitions, 
          and business optimization.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Verified Advisor
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            72,000+ Community
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            500+ Funded Deals
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface TrustSignalsProps {
  variant?: "horizontal" | "grid";
}

export function TrustSignals({ variant = "horizontal" }: TrustSignalsProps) {
  const signals = [
    { icon: Shield, label: "Vetted Lenders", value: "7 Partners" },
    { icon: Users, label: "Community", value: "72,000+" },
    { icon: DollarSign, label: "Funded", value: "$50M+" },
    { icon: Clock, label: "Fast Approval", value: "24-48 hrs" },
  ];

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {signals.map((signal, i) => (
          <div 
            key={i}
            className="flex flex-col items-center p-4 bg-muted/50 rounded-lg border text-center"
          >
            <signal.icon className="w-6 h-6 text-primary mb-2" />
            <p className="font-bold text-lg">{signal.value}</p>
            <p className="text-xs text-muted-foreground">{signal.label}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 bg-muted/30 rounded-lg border">
      {signals.map((signal, i) => (
        <div key={i} className="flex items-center gap-2">
          <signal.icon className="w-4 h-4 text-primary" />
          <span className="text-sm">
            <span className="font-semibold">{signal.value}</span>
            <span className="text-muted-foreground ml-1">{signal.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const FUNDING_PATHS = [
  { 
    href: "/startup-funding", 
    label: "Startup Funding", 
    icon: Zap,
    description: "First-time owners, no business history needed",
    color: "from-orange-500/10 to-orange-500/5"
  },
  { 
    href: "/sba-loans", 
    label: "SBA Loans", 
    icon: Landmark,
    description: "Best rates, 10-25 year terms, gov-backed",
    color: "from-blue-500/10 to-blue-500/5"
  },
  { 
    href: "/equipment-financing", 
    label: "Equipment Financing", 
    icon: Building2,
    description: "Washers, dryers, payment systems",
    color: "from-green-500/10 to-green-500/5"
  },
  { 
    href: "/real-estate-financing", 
    label: "Real Estate", 
    icon: Building2,
    description: "Property purchase, SBA 504, commercial",
    color: "from-purple-500/10 to-purple-500/5"
  },
  { 
    href: "/working-capital-financing", 
    label: "Working Capital", 
    icon: TrendingUp,
    description: "Fast cash, revenue-based, bridge loans",
    color: "from-pink-500/10 to-pink-500/5"
  },
];

interface RelatedFundingPathsProps {
  currentPath: string;
  title?: string;
}

export function RelatedFundingPaths({ currentPath, title = "Explore Other Funding Options" }: RelatedFundingPathsProps) {
  const otherPaths = FUNDING_PATHS.filter(p => p.href !== currentPath);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/funding">
          <Button variant="outline" size="sm">
            View All Funding Options
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {otherPaths.map((path) => (
          <Link key={path.href} href={path.href}>
            <Card className={`h-full hover-elevate cursor-pointer transition-all bg-gradient-to-br ${path.color}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <path.icon className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{path.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{path.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function FundingDisclaimer() {
  return (
    <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border text-xs text-foreground/80 dark:text-foreground/90 space-y-2">
      <p className="font-medium text-foreground">Important Disclosure</p>
      <p>
        WashBizHub connects entrepreneurs with financing partners. We receive referral compensation 
        when you apply through our partner links. This helps us maintain our free resources for the 
        laundromat community. All lending decisions are made by our partner lenders based on their 
        underwriting criteria.
      </p>
      <p>
        Rates, terms, and approval are subject to lender requirements and may vary. Not all applicants 
        will qualify. Contact individual lenders for current rates and terms.
      </p>
    </div>
  );
}

export function ConsultationCTA() {
  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
      <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-bold">Need Help Choosing the Right Funding?</h3>
          <p className="text-muted-foreground">
            Our team can help match you with the best lender for your situation. 
            Free consultation, no obligation.
          </p>
        </div>
        <div className="flex gap-3">
          <a href="mailto:consult@washbizhub.com">
            <Button className="btn-premium-gold">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Get Free Consultation
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
