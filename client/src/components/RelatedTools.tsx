import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  DollarSign,
  TrendingUp,
  Calculator,
  FileText,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  Wrench,
  ShoppingCart,
  Building2,
  Wallet,
  Users,
  ArrowRight,
  Zap,
  AlertTriangle,
  Package,
  type LucideIcon
} from "lucide-react";

export interface RelatedTool {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tier: 'free' | 'pro' | 'enterprise';
  category: string;
}

export interface RelatedToolsProps {
  currentTool: string;
  maxItems?: number;
  variant?: 'card' | 'inline' | 'minimal';
  title?: string;
}

const TOOL_RELATIONSHIPS: Record<string, string[]> = {
  'cleanbi': ['valuation-calculator', 'roi-calculator', 'due-diligence-checklist', 'funding-matcher'],
  'valuation-calculator': ['cleanbi', 'roi-calculator', 'loan-calculator', 'business-plan'],
  'roi-calculator': ['valuation-calculator', 'cleanbi', 'financing-calculator'],
  'templates': ['business-plan', 'due-diligence-checklist', 'courses'],
  'service-guy-ai': ['equipment-guides', 'error-codes', 'parts-catalogue'],
  'courses': ['templates', 'laundromat-bible', 'cleanbi'],
  'laundromat-listings': ['cleanbi', 'funding-matcher', 'valuation-calculator'],
  'funding-matcher': ['loan-calculator', 'sba-readiness', 'business-plan'],
  'loan-calculator': ['funding-matcher', 'roi-calculator', 'valuation-calculator'],
  'business-plan': ['templates', 'funding-matcher', 'valuation-calculator'],
  'due-diligence-checklist': ['cleanbi', 'valuation-calculator', 'templates'],
  'laundromat-bible': ['courses', 'templates', 'equipment-guides'],
  'equipment-guides': ['service-guy-ai', 'parts-catalogue', 'laundromat-bible'],
  'calculators-suite': ['valuation-calculator', 'roi-calculator', 'cleanbi'],
  'tools-hub': ['cleanbi', 'calculators-suite', 'templates'],
};

const ALL_TOOLS: Record<string, RelatedTool> = {
  'cleanbi': {
    name: 'CLEANBI Explorer',
    description: 'AI-powered location scoring',
    href: '/cleanbi-explorer',
    icon: MapPin,
    tier: 'pro',
    category: 'Location Intelligence'
  },
  'valuation-calculator': {
    name: 'Valuation Calculator',
    description: 'Calculate business worth',
    href: '/valuation-calculator',
    icon: DollarSign,
    tier: 'free',
    category: 'Calculators'
  },
  'roi-calculator': {
    name: 'ROI Calculator',
    description: 'Project investment returns',
    href: '/roi-calculator',
    icon: TrendingUp,
    tier: 'free',
    category: 'Calculators'
  },
  'loan-calculator': {
    name: 'Loan Calculator',
    description: 'Payment estimates',
    href: '/loan-calculator',
    icon: Wallet,
    tier: 'free',
    category: 'Calculators'
  },
  'financing-calculator': {
    name: 'Financing Calculator',
    description: 'Compare financing options',
    href: '/financing-calculator',
    icon: Calculator,
    tier: 'free',
    category: 'Calculators'
  },
  'due-diligence-checklist': {
    name: 'Due Diligence Checklist',
    description: "Larry's 50+ Trap Alerts",
    href: '/vault',
    icon: ClipboardCheck,
    tier: 'pro',
    category: 'Templates'
  },
  'funding-matcher': {
    name: 'Funding Matcher',
    description: 'Connect with lenders',
    href: '/funding-matcher',
    icon: Wallet,
    tier: 'pro',
    category: 'Funding'
  },
  'business-plan': {
    name: 'Business Plan Generator',
    description: 'AI-powered business plans',
    href: '/business-plan-generator',
    icon: FileText,
    tier: 'pro',
    category: 'Templates'
  },
  'templates': {
    name: 'Template Vault',
    description: 'Professional templates',
    href: '/vault',
    icon: FileText,
    tier: 'pro',
    category: 'Templates'
  },
  'courses': {
    name: "Larry's Academy",
    description: 'Expert video courses',
    href: '/courses',
    icon: GraduationCap,
    tier: 'pro',
    category: 'Education'
  },
  'laundromat-bible': {
    name: 'The Laundromat Bible',
    description: 'Comprehensive guide',
    href: '/laundromat-bible',
    icon: BookOpen,
    tier: 'free',
    category: 'Education'
  },
  'service-guy-ai': {
    name: 'Service Guy AI',
    description: 'Equipment diagnostics',
    href: '/service-guy-ai',
    icon: Wrench,
    tier: 'pro',
    category: 'Operations'
  },
  'equipment-guides': {
    name: 'Equipment Guides',
    description: 'Brand comparisons',
    href: '/equipment-guides',
    icon: Wrench,
    tier: 'free',
    category: 'Education'
  },
  'error-codes': {
    name: 'Error Code Library',
    description: 'Troubleshoot issues fast',
    href: '/service-guy-ai/error-codes',
    icon: AlertTriangle,
    tier: 'pro',
    category: 'Operations'
  },
  'parts-catalogue': {
    name: 'Parts Catalogue',
    description: 'Find replacement parts',
    href: '/equipment-marketplace',
    icon: Package,
    tier: 'free',
    category: 'Marketplace'
  },
  'laundromat-listings': {
    name: 'Laundromat Listings',
    description: 'Buy/sell businesses',
    href: '/laundromat-listings',
    icon: Building2,
    tier: 'free',
    category: 'Marketplace'
  },
  'sba-readiness': {
    name: 'SBA Readiness Check',
    description: 'Loan qualification',
    href: '/sba-readiness',
    icon: ClipboardCheck,
    tier: 'pro',
    category: 'Funding'
  },
  'calculators-suite': {
    name: 'Calculator Suite',
    description: '50+ pro calculators',
    href: '/calculators-suite',
    icon: Calculator,
    tier: 'free',
    category: 'Calculators'
  },
  'tools-hub': {
    name: 'Tools Hub',
    description: 'All tools in one place',
    href: '/tools-hub',
    icon: Zap,
    tier: 'free',
    category: 'Navigation'
  },
  'directory': {
    name: 'Broker Directory',
    description: 'Find trusted brokers',
    href: '/directory',
    icon: Users,
    tier: 'free',
    category: 'Marketplace'
  },
  'equipment-marketplace': {
    name: 'Equipment Marketplace',
    description: 'New & used equipment',
    href: '/equipment-marketplace',
    icon: ShoppingCart,
    tier: 'free',
    category: 'Marketplace'
  },
};

const tierConfig: Record<'free' | 'pro' | 'enterprise', { label: string; className: string }> = {
  free: { label: "Free", className: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", className: "bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30" },
  enterprise: { label: "Enterprise", className: "bg-[#0A1628] text-white" }
};

export function useRelatedTools(currentTool: string, maxItems: number = 3): RelatedTool[] {
  const relatedIds = TOOL_RELATIONSHIPS[currentTool] || [];
  const tools: RelatedTool[] = [];
  
  for (const id of relatedIds) {
    if (tools.length >= maxItems) break;
    const tool = ALL_TOOLS[id];
    if (tool) {
      tools.push(tool);
    }
  }
  
  return tools;
}

function TierBadge({ tier }: { tier: 'free' | 'pro' | 'enterprise' }) {
  const config = tierConfig[tier];
  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${config.className}`}
      data-testid={`badge-tier-${tier}`}
    >
      {config.label}
    </Badge>
  );
}

function CardVariant({ tools, title }: { tools: RelatedTool[]; title: string }) {
  if (tools.length === 0) return null;
  
  return (
    <div className="space-y-4" data-testid="related-tools-card-variant">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href}>
              <Card 
                className="bg-card border shadow-sm hover-elevate cursor-pointer transition-all h-full"
                data-testid={`card-related-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-[#C8A661]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-foreground text-sm">
                          {tool.name}
                        </span>
                        <TierBadge tier={tool.tier} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <span className="text-xs text-[#C8A661] mt-2 inline-flex items-center gap-1">
                        {tool.category}
                      </span>
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

function InlineVariant({ tools, title }: { tools: RelatedTool[]; title: string }) {
  if (tools.length === 0) return null;
  
  return (
    <div className="space-y-3" data-testid="related-tools-inline-variant">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href}>
              <div 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover-elevate cursor-pointer transition-all"
                data-testid={`inline-related-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="h-4 w-4 text-[#C8A661]" />
                <span className="text-sm font-medium text-foreground">{tool.name}</span>
                <TierBadge tier={tool.tier} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MinimalVariant({ tools, title }: { tools: RelatedTool[]; title: string }) {
  if (tools.length === 0) return null;
  
  return (
    <div className="space-y-2" data-testid="related-tools-minimal-variant">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h4>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <span 
              className="text-sm text-muted-foreground hover:text-[#C8A661] cursor-pointer transition-colors inline-flex items-center gap-1"
              data-testid={`minimal-related-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {tool.name}
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RelatedTools({
  currentTool,
  maxItems = 3,
  variant = 'card',
  title = 'Related Tools'
}: RelatedToolsProps) {
  const tools = useRelatedTools(currentTool, maxItems);
  
  if (tools.length === 0) return null;
  
  switch (variant) {
    case 'inline':
      return <InlineVariant tools={tools} title={title} />;
    case 'minimal':
      return <MinimalVariant tools={tools} title={title} />;
    case 'card':
    default:
      return <CardVariant tools={tools} title={title} />;
  }
}

export { ALL_TOOLS, TOOL_RELATIONSHIPS };
