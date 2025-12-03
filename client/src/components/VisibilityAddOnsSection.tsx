import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  Globe, 
  Search, 
  Share2, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

interface VisibilityAddOn {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceUSD: string;
  durationDays: number | null;
  includesCarousel: boolean;
  includesAutoBlog: boolean;
  includesIndexNow: boolean;
  includesGoogleIndexing: boolean;
  includesSocialCards: boolean;
  sortOrder: number;
  active: boolean;
}

const isBundle = (slug: string): boolean => {
  return slug.startsWith('visibility-') || slug.includes('bundle');
};

const getAddOnIcon = (slug: string) => {
  switch (slug) {
    case 'carousel':
    case 'carousel-featured':
      return Sparkles;
    case 'auto-blog':
      return FileText;
    case 'index-now':
      return Globe;
    case 'google-indexing':
      return Search;
    case 'social-cards':
      return Share2;
    case 'visibility-starter':
    case 'visibility-pro':
    case 'visibility-ultimate':
      return Zap;
    default:
      return Star;
  }
};

const getAddOnColor = (slug: string) => {
  switch (slug) {
    case 'carousel':
    case 'carousel-featured':
      return 'from-amber-500 to-yellow-500';
    case 'auto-blog':
      return 'from-blue-500 to-cyan-500';
    case 'index-now':
      return 'from-green-500 to-emerald-500';
    case 'google-indexing':
      return 'from-red-500 to-orange-500';
    case 'social-cards':
      return 'from-purple-500 to-pink-500';
    case 'visibility-ultimate':
      return 'from-[#C8A661] to-[#B8964D]';
    default:
      return 'from-slate-500 to-slate-600';
  }
};

function VisibilityAddOnCard({ addOn, isPopular = false }: { addOn: VisibilityAddOn; isPopular?: boolean }) {
  const Icon = getAddOnIcon(addOn.slug);
  const gradientColor = getAddOnColor(addOn.slug);
  const isBundleItem = isBundle(addOn.slug);
  
  const features = [];
  if (addOn.includesCarousel) features.push('Featured Carousel Spot');
  if (addOn.includesAutoBlog) features.push('AI-Generated Blog Post');
  if (addOn.includesIndexNow) features.push('IndexNow Submission');
  if (addOn.includesGoogleIndexing) features.push('Google Indexing API');
  if (addOn.includesSocialCards) features.push('Social Share Cards');

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isPopular ? 'border-[#C8A661] border-2 ring-2 ring-[#C8A661]/20' : ''
      } ${isBundleItem ? 'bg-gradient-to-br from-card to-accent/5' : ''}`}
      data-testid={`card-visibility-addon-${addOn.slug}`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-[#C8A661] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          BEST VALUE
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientColor} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          {isBundleItem && (
            <Badge variant="secondary" className="text-xs">
              Bundle
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-2">{addOn.name}</CardTitle>
        <CardDescription className="text-sm">
          {addOn.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          <span className="text-3xl font-bold text-foreground">${parseFloat(addOn.priceUSD).toFixed(0)}</span>
          {addOn.durationDays && (
            <span className="text-muted-foreground text-sm ml-1">
              / {addOn.durationDays} days
            </span>
          )}
        </div>
        
        {features.length > 0 && (
          <ul className="space-y-2 mb-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        <Link href="/sell-your-laundromat">
          <Button 
            className={`w-full ${isPopular ? 'bg-[#C8A661] hover:bg-[#B8964D] text-white' : ''}`}
            variant={isPopular ? 'default' : 'outline'}
            data-testid={`button-addon-select-${addOn.slug}`}
          >
            List & Select Add-On
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function VisibilityAddOnsSection() {
  const { data: addOns, isLoading } = useQuery<VisibilityAddOn[]>({
    queryKey: ['/api/visibility-addons'],
  });

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 bg-muted/30" aria-labelledby="visibility-addons-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-96 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (!addOns || addOns.length === 0) {
    return null;
  }

  const individualAddOns = addOns.filter(a => !isBundle(a.slug));
  const bundles = addOns.filter(a => isBundle(a.slug));

  return (
    <section 
      className="py-16 sm:py-24 bg-muted/30" 
      aria-labelledby="visibility-addons-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            Seller Tools
          </Badge>
          <h2 
            id="visibility-addons-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
          >
            Visibility Add-Ons for Sellers
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Boost your listing's visibility with premium promotion tools. 
            Get featured in our homepage carousel, auto-generate SEO blog posts, 
            and accelerate search engine indexing.
          </p>
        </div>

        {/* Individual Add-Ons */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-[#C8A661]" />
            Individual Add-Ons
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {individualAddOns.map((addOn) => (
              <VisibilityAddOnCard key={addOn.id} addOn={addOn} />
            ))}
          </div>
        </div>

        {/* Bundles */}
        {bundles.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#C8A661]" />
              Value Bundles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bundles.map((addOn, idx) => (
                <VisibilityAddOnCard 
                  key={addOn.id} 
                  addOn={addOn} 
                  isPopular={addOn.slug === 'visibility-ultimate' || idx === bundles.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All visibility add-ons are available when you list your laundromat for sale.
            <br />
            Contact <span className="font-semibold text-foreground">consult@washbizhub.com</span> for custom packages.
          </p>
          <Link href="/sell-your-laundromat">
            <Button 
              size="lg" 
              className="bg-[#C8A661] hover:bg-[#B8964D] text-white"
              data-testid="button-list-laundromat-cta"
            >
              List Your Laundromat
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
