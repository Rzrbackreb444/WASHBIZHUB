/**
 * Internal Linking Components for SEO
 * 
 * Automated related content suggestions for better site structure
 * and improved crawlability.
 */

import { memo, useMemo } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, BookOpen, MapPin, ShoppingCart, 
  Wrench, Users, TrendingUp, FileText, ArrowRight,
  Lightbulb, Target, DollarSign, Building
} from 'lucide-react';

// ===== LINK DATA =====

interface InternalLink {
  title: string;
  url: string;
  description: string;
  category: 'calculator' | 'education' | 'marketplace' | 'tool' | 'equipment' | 'community';
  keywords: string[];
  priority?: number;
}

const SITE_LINKS: InternalLink[] = [
  // Calculators
  { title: "ROI Calculator", url: "/roi-calculator", description: "Calculate return on investment for any laundromat", category: "calculator", keywords: ["roi", "return", "investment", "profit", "calculate"] },
  { title: "Valuation Calculator", url: "/valuation-calculator", description: "Determine fair market value using EBITDA multiples", category: "calculator", keywords: ["valuation", "value", "worth", "ebitda", "price", "appraisal"] },
  { title: "TPD Calculator", url: "/tpd-calculator", description: "Measure turns per day efficiency", category: "calculator", keywords: ["tpd", "turns", "efficiency", "machines", "utilization"] },
  { title: "Loan Calculator", url: "/loan-calculator", description: "Calculate SBA loan payments and terms", category: "calculator", keywords: ["loan", "sba", "financing", "payment", "mortgage"] },
  { title: "Utility Calculator", url: "/utility-calculator", description: "Estimate water and electricity costs", category: "calculator", keywords: ["utility", "water", "electric", "gas", "costs", "bills"] },
  { title: "Labor Calculator", url: "/labor-calculator", description: "Plan staffing and labor costs", category: "calculator", keywords: ["labor", "staff", "employee", "wages", "payroll"] },
  { title: "Break-Even Calculator", url: "/break-even-calculator", description: "Find your break-even point", category: "calculator", keywords: ["break-even", "breakeven", "profit", "loss"] },
  { title: "CAC Calculator", url: "/cac-calculator", description: "Customer acquisition cost analysis", category: "calculator", keywords: ["cac", "customer", "acquisition", "marketing"] },
  { title: "LTV Calculator", url: "/ltv-calculator", description: "Calculate customer lifetime value", category: "calculator", keywords: ["ltv", "lifetime", "value", "customer", "retention"] },
  
  // CLEANBI & Location
  { title: "CLEANBI Explorer", url: "/cleanbi-explorer", description: "Analyze any location with 17-factor scoring", category: "tool", keywords: ["cleanbi", "location", "score", "analysis", "demographics"] },
  { title: "CLEANBI Methodology", url: "/cleanbi-methodology", description: "Understand the scoring system", category: "education", keywords: ["cleanbi", "methodology", "factors", "scoring", "algorithm"] },
  { title: "Market Report", url: "/cleanbi-market-report", description: "Generate location market reports", category: "tool", keywords: ["market", "report", "demographics", "competition"] },
  { title: "Competitor Intelligence", url: "/competitor-intelligence", description: "Analyze nearby competitors", category: "tool", keywords: ["competitor", "competition", "analysis", "rivals"] },
  
  // Education
  { title: "Larry's Academy", url: "/larrys-academy", description: "Learn from industry legend Larry Larsen", category: "education", keywords: ["larry", "academy", "courses", "education", "learning", "training"] },
  { title: "The Laundromat Bible", url: "/book", description: "Complete guide to laundromat ownership", category: "education", keywords: ["bible", "book", "guide", "chapters", "comprehensive"] },
  { title: "Courses Hub", url: "/courses", description: "Browse all educational content", category: "education", keywords: ["courses", "education", "training", "learn"] },
  { title: "Due Diligence Guide", url: "/laundromat-due-diligence", description: "Complete buyer's checklist", category: "education", keywords: ["due diligence", "checklist", "buying", "inspection"] },
  
  // Marketplace
  { title: "Laundromat Listings", url: "/laundromat-listings", description: "Browse laundromats for sale", category: "marketplace", keywords: ["listings", "for sale", "buy", "marketplace", "deals"] },
  { title: "Sell Your Laundromat", url: "/sell-your-laundromat", description: "List your business for sale", category: "marketplace", keywords: ["sell", "list", "selling", "owner"] },
  { title: "Broker Directory", url: "/brokers", description: "Find verified laundromat brokers", category: "marketplace", keywords: ["broker", "agent", "realtor", "directory"] },
  
  // Equipment
  { title: "Equipment Hub", url: "/equipment-hub", description: "Compare washers, dryers, and brands", category: "equipment", keywords: ["equipment", "machines", "washers", "dryers", "brands"] },
  { title: "Equipment Appraiser", url: "/equipment-appraiser", description: "AI-powered equipment valuation", category: "equipment", keywords: ["appraiser", "equipment", "value", "used"] },
  { title: "Service Guy AI", url: "/service-guy-ai", description: "Diagnose machine problems", category: "equipment", keywords: ["service", "repair", "diagnose", "technician", "problems"] },
  { title: "Error Codes", url: "/error-codes", description: "Machine error code database", category: "equipment", keywords: ["error", "codes", "diagnostic", "troubleshoot"] },
  
  // Operations
  { title: "POS Suite", url: "/pos-suite", description: "Point of sale system", category: "tool", keywords: ["pos", "point of sale", "register", "transactions"] },
  { title: "Route Optimizer", url: "/route-optimization", description: "Optimize pickup/delivery routes", category: "tool", keywords: ["route", "delivery", "pickup", "optimization"] },
  { title: "Design Studio", url: "/design-studio", description: "Plan your laundromat layout", category: "tool", keywords: ["design", "layout", "floor plan", "studio"] },
  
  // Funding
  { title: "SBA Loans", url: "/sba-loans", description: "SBA financing options", category: "tool", keywords: ["sba", "loan", "financing", "funding", "bank"] },
  { title: "Funding Marketplace", url: "/funding", description: "Compare financing options", category: "tool", keywords: ["funding", "financing", "capital", "loans"] },
  
  // Community
  { title: "Forum", url: "/forum", description: "Join the community discussion", category: "community", keywords: ["forum", "community", "discussion", "questions"] },
  { title: "Vendor Directory", url: "/directory", description: "Find verified service providers", category: "community", keywords: ["vendor", "directory", "suppliers", "services"] },
];

// ===== CATEGORY ICONS =====

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  calculator: Calculator,
  education: BookOpen,
  marketplace: ShoppingCart,
  tool: Wrench,
  equipment: Building,
  community: Users
};

const CATEGORY_COLORS: Record<string, string> = {
  calculator: "bg-blue-500/10 text-blue-600",
  education: "bg-purple-500/10 text-purple-600",
  marketplace: "bg-green-500/10 text-green-600",
  tool: "bg-orange-500/10 text-orange-600",
  equipment: "bg-red-500/10 text-red-600",
  community: "bg-cyan-500/10 text-cyan-600"
};

// ===== RELATED LINKS COMPONENT =====

interface RelatedLinksProps {
  currentUrl: string;
  keywords?: string[];
  category?: string;
  maxLinks?: number;
  title?: string;
  variant?: 'cards' | 'list' | 'compact';
}

export const RelatedLinks = memo(function RelatedLinks({
  currentUrl,
  keywords = [],
  category,
  maxLinks = 5,
  title = "Related Resources",
  variant = 'list'
}: RelatedLinksProps) {
  
  const relatedLinks = useMemo(() => {
    // Score each link based on relevance
    const scored = SITE_LINKS
      .filter(link => link.url !== currentUrl)
      .map(link => {
        let score = 0;
        
        // Category match
        if (category && link.category === category) {
          score += 10;
        }
        
        // Keyword matches
        keywords.forEach(kw => {
          const kwLower = kw.toLowerCase();
          if (link.keywords.some(lk => lk.includes(kwLower) || kwLower.includes(lk))) {
            score += 5;
          }
          if (link.title.toLowerCase().includes(kwLower)) {
            score += 3;
          }
          if (link.description.toLowerCase().includes(kwLower)) {
            score += 2;
          }
        });
        
        // Priority boost
        if (link.priority) {
          score += link.priority;
        }
        
        return { ...link, score };
      })
      .filter(link => link.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxLinks);
    
    // If not enough related links, add some from same category
    if (scored.length < maxLinks && category) {
      const sameCat = SITE_LINKS
        .filter(link => link.url !== currentUrl && link.category === category)
        .filter(link => !scored.find(s => s.url === link.url))
        .slice(0, maxLinks - scored.length)
        .map(link => ({ ...link, score: 1 }));
      scored.push(...sameCat);
    }
    
    return scored.slice(0, maxLinks);
  }, [currentUrl, keywords, category, maxLinks]);
  
  if (relatedLinks.length === 0) return null;
  
  if (variant === 'compact') {
    return (
      <div className="space-y-2" data-testid="related-links-compact">
        <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {relatedLinks.map((link, i) => (
            <Link key={i} href={link.url}>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-[#C8A661]/10 hover:border-[#C8A661]/40 transition-colors"
              >
                {link.title}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  if (variant === 'cards') {
    return (
      <div className="space-y-4" data-testid="related-links-cards">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedLinks.map((link, i) => {
            const Icon = CATEGORY_ICONS[link.category] || FileText;
            return (
              <Link key={i} href={link.url}>
                <Card className="h-full cursor-pointer hover:border-[#C8A661]/50 transition-colors hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[link.category]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{link.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {link.description}
                        </p>
                      </div>
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
  
  // List variant (default)
  return (
    <div className="space-y-3" data-testid="related-links-list">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-[#C8A661]" />
        {title}
      </h4>
      <ul className="space-y-2">
        {relatedLinks.map((link, i) => {
          const Icon = CATEGORY_ICONS[link.category] || FileText;
          return (
            <li key={i}>
              <Link 
                href={link.url}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={`h-6 w-6 rounded flex items-center justify-center ${CATEGORY_COLORS[link.category]}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <span className="text-sm text-foreground group-hover:text-[#C8A661] transition-colors">
                  {link.title}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

// ===== BREADCRUMB LINKS =====

interface BreadcrumbPath {
  name: string;
  url: string;
}

interface BreadcrumbLinksProps {
  paths: BreadcrumbPath[];
}

export const BreadcrumbLinks = memo(function BreadcrumbLinks({ paths }: BreadcrumbLinksProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="text-sm"
      itemScope 
      itemType="https://schema.org/BreadcrumbList"
      data-testid="breadcrumb-nav"
    >
      <ol className="flex items-center gap-1.5 text-muted-foreground flex-wrap">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link 
            href="/"
            className="hover:text-[#C8A661] transition-colors"
          >
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        {paths.map((path, index) => (
          <li 
            key={path.url}
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
            className="flex items-center gap-1.5"
          >
            <span className="text-muted-foreground/50">/</span>
            {index === paths.length - 1 ? (
              <span className="text-foreground font-medium" itemProp="name">{path.name}</span>
            ) : (
              <Link 
                href={path.url}
                className="hover:text-[#C8A661] transition-colors"
              >
                <span itemProp="name">{path.name}</span>
              </Link>
            )}
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  );
});

// ===== TOPIC CLUSTER NAVIGATION =====

interface TopicCluster {
  pillar: { title: string; url: string; };
  clusters: { title: string; url: string; }[];
}

interface TopicClusterNavProps {
  cluster: TopicCluster;
  currentUrl?: string;
}

export const TopicClusterNav = memo(function TopicClusterNav({ 
  cluster, 
  currentUrl 
}: TopicClusterNavProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-4" data-testid="topic-cluster">
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Target className="w-4 h-4 text-[#C8A661]" />
        Related Topics
      </h4>
      
      {/* Pillar */}
      <Link 
        href={cluster.pillar.url}
        className={`block p-2 rounded-lg mb-2 ${
          currentUrl === cluster.pillar.url 
            ? 'bg-[#C8A661]/10 text-[#C8A661]' 
            : 'hover:bg-muted/50'
        }`}
      >
        <span className="font-medium text-sm">{cluster.pillar.title}</span>
        <Badge variant="secondary" className="ml-2 text-xs">Guide</Badge>
      </Link>
      
      {/* Clusters */}
      <ul className="space-y-1 ml-2 border-l-2 border-[#C8A661]/20 pl-3">
        {cluster.clusters.map((item, i) => (
          <li key={i}>
            <Link 
              href={item.url}
              className={`block p-1.5 rounded text-sm ${
                currentUrl === item.url 
                  ? 'text-[#C8A661] font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

// ===== PREDEFINED TOPIC CLUSTERS =====

export const TOPIC_CLUSTERS: Record<string, TopicCluster> = {
  buying: {
    pillar: { title: "How to Buy a Laundromat", url: "/how-to-start-laundromat" },
    clusters: [
      { title: "Valuation Calculator", url: "/valuation-calculator" },
      { title: "Due Diligence Guide", url: "/laundromat-due-diligence" },
      { title: "CLEANBI Location Analysis", url: "/cleanbi-explorer" },
      { title: "SBA Financing", url: "/sba-loans" },
      { title: "Browse Listings", url: "/laundromat-listings" }
    ]
  },
  operations: {
    pillar: { title: "Laundromat Operations", url: "/operate" },
    clusters: [
      { title: "POS System", url: "/pos-suite" },
      { title: "Labor Calculator", url: "/labor-calculator" },
      { title: "Utility Management", url: "/utility-calculator" },
      { title: "Service & Repair", url: "/service-guy-ai" },
      { title: "Route Optimization", url: "/route-optimization" }
    ]
  },
  education: {
    pillar: { title: "Larry's Academy", url: "/larrys-academy" },
    clusters: [
      { title: "The Laundromat Bible", url: "/book" },
      { title: "All Courses", url: "/courses" },
      { title: "Industry Guides", url: "/resources" },
      { title: "Equipment Knowledge", url: "/equipment-guides" }
    ]
  },
  cleanbi: {
    pillar: { title: "CLEANBI Location Intelligence", url: "/cleanbi" },
    clusters: [
      { title: "CLEANBI Explorer", url: "/cleanbi-explorer" },
      { title: "Scoring Methodology", url: "/cleanbi-methodology" },
      { title: "Market Reports", url: "/cleanbi-market-report" },
      { title: "Competitor Analysis", url: "/competitor-intelligence" }
    ]
  }
};

export default RelatedLinks;
