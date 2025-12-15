import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calculator, FileText, Sparkles, MapPin, Wrench, BookOpen } from "lucide-react";

interface InternalLink {
  href: string;
  title: string;
  description?: string;
  icon?: "calculator" | "article" | "tool" | "location" | "repair" | "course";
  badge?: string;
}

const ICON_MAP = {
  calculator: Calculator,
  article: FileText,
  tool: Sparkles,
  location: MapPin,
  repair: Wrench,
  course: BookOpen
};

interface RelatedLinksProps {
  title?: string;
  links: InternalLink[];
  variant?: "cards" | "list" | "inline";
  className?: string;
}

export function RelatedLinks({ title = "Related Resources", links, variant = "cards", className = "" }: RelatedLinksProps) {
  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {links.map((link, i) => (
          <Link key={i} href={link.href} className="text-primary hover:underline inline-flex items-center gap-1">
            {link.title}
            <ArrowRight className="w-3 h-3" />
          </Link>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {links.map((link, i) => {
              const Icon = link.icon ? ICON_MAP[link.icon] : ArrowRight;
              return (
                <li key={i}>
                  <Link href={link.href} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary">{link.title}</span>
                    {link.badge && <Badge variant="secondary" className="ml-auto text-xs">{link.badge}</Badge>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link, i) => {
          const Icon = link.icon ? ICON_MAP[link.icon] : ArrowRight;
          return (
            <Link key={i} href={link.href}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium group-hover:text-primary transition-colors">{link.title}</h4>
                    {link.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{link.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export const COMMON_INTERNAL_LINKS = {
  calculators: [
    { href: "/cleanbi-auto", title: "CLEANBI Score Calculator", icon: "tool" as const, description: "Analyze any address for laundromat viability" },
    { href: "/valuation-calculator", title: "Valuation Calculator", icon: "calculator" as const, description: "Calculate your laundromat's worth" },
    { href: "/roi-calculator", title: "ROI Calculator", icon: "calculator" as const, description: "Project your investment returns" },
    { href: "/loan-calculator", title: "Loan Calculator", icon: "calculator" as const, description: "Calculate financing options" },
    { href: "/tpd-calculator", title: "TPD Calculator", icon: "calculator" as const, description: "Turns per day analysis" },
  ],
  buying: [
    { href: "/laundromats-for-sale", title: "Browse All States", icon: "location" as const },
    { href: "/laundromat-listings", title: "Active Listings", icon: "location" as const },
    { href: "/brokers", title: "Find a Broker", icon: "article" as const },
    { href: "/funding-matcher", title: "Funding Options", icon: "calculator" as const },
    { href: "/sba-readiness", title: "SBA Loan Readiness", icon: "article" as const },
  ],
  learning: [
    { href: "/blog", title: "Expert Articles", icon: "article" as const, badge: "800+" },
    { href: "/courses", title: "Video Courses", icon: "course" as const },
    { href: "/error-codes", title: "Error Code Database", icon: "repair" as const, badge: "2000+" },
    { href: "/service-guy-ai", title: "Service Guy AI", icon: "repair" as const },
    { href: "/resources", title: "Resources", icon: "article" as const },
  ],
  operators: [
    { href: "/pos-command-center", title: "POS Command Center", icon: "tool" as const },
    { href: "/operator-dashboard", title: "Operator Dashboard", icon: "tool" as const },
    { href: "/equipment-marketplace", title: "Equipment Marketplace", icon: "tool" as const },
    { href: "/design-studio", title: "Design Studio", icon: "tool" as const },
  ]
};

export function CalculatorLinks({ className = "" }: { className?: string }) {
  return <RelatedLinks title="Free Calculators & Tools" links={COMMON_INTERNAL_LINKS.calculators} variant="cards" className={className} />;
}

export function BuyingLinks({ className = "" }: { className?: string }) {
  return <RelatedLinks title="Buying a Laundromat" links={COMMON_INTERNAL_LINKS.buying} variant="list" className={className} />;
}

export function LearningLinks({ className = "" }: { className?: string }) {
  return <RelatedLinks title="Learn More" links={COMMON_INTERNAL_LINKS.learning} variant="list" className={className} />;
}

export function ContextualLinks({ category }: { category: "valuation" | "equipment" | "financing" | "operations" | "buying" }) {
  const linkGroups: Record<string, InternalLink[]> = {
    valuation: [
      { href: "/valuation-calculator", title: "Calculate Your Laundromat's Value", icon: "calculator" },
      { href: "/cleanbi-auto", title: "Get Location Score", icon: "tool" },
      { href: "/blog/how-to-value-a-laundromat", title: "Valuation Guide", icon: "article" },
    ],
    equipment: [
      { href: "/error-codes", title: "Error Code Database", icon: "repair" },
      { href: "/service-guy-ai", title: "AI Diagnostics", icon: "repair" },
      { href: "/equipment-marketplace", title: "Browse Equipment", icon: "tool" },
    ],
    financing: [
      { href: "/funding-matcher", title: "Find Funding", icon: "calculator" },
      { href: "/sba-readiness", title: "SBA Loan Checker", icon: "article" },
      { href: "/loan-calculator", title: "Loan Calculator", icon: "calculator" },
    ],
    operations: [
      { href: "/pos-command-center", title: "POS System", icon: "tool" },
      { href: "/tpd-calculator", title: "TPD Calculator", icon: "calculator" },
      { href: "/utility-calculator", title: "Utility Calculator", icon: "calculator" },
    ],
    buying: [
      { href: "/laundromats-for-sale", title: "Browse by State", icon: "location" },
      { href: "/cleanbi-auto", title: "Analyze Locations", icon: "tool" },
      { href: "/brokers", title: "Find a Broker", icon: "article" },
    ],
  };

  return <RelatedLinks links={linkGroups[category] || []} variant="inline" />;
}
