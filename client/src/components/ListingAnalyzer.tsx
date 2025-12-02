import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  Link2, 
  Loader2, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Building2,
  ChevronDown,
  ChevronUp,
  Zap,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface ParsedListing {
  source: string;
  url: string;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fullAddress?: string;
  askingPrice?: number;
  annualRevenue?: number;
  cashFlow?: number;
  sqft?: number;
  employees?: number;
  established?: number;
  description?: string;
  imageUrl?: string;
  confidence: number;
  error?: string;
}

interface DealMetrics {
  priceToRevenueMultiple?: number;
  priceToCashFlowMultiple?: number;
  verdict?: 'great_deal' | 'fair_price' | 'premium' | 'overpriced';
  verdictLabel?: string;
  verdictColor?: string;
  analysis?: string;
}

interface ListingAnalyzerResult {
  success: boolean;
  listing: ParsedListing;
  dealMetrics: DealMetrics;
  readyForCleanbi: boolean;
  suggestedAddress: string | null;
}

interface ListingAnalyzerProps {
  onAnalyzeAddress: (address: string, businessName?: string) => void;
  isAnalyzing: boolean;
}

export function ListingAnalyzer({ onAnalyzeAddress, isAnalyzing }: ListingAnalyzerProps) {
  const { toast } = useToast();
  const [listingUrl, setListingUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<ListingAnalyzerResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/listing-analyzer", { url });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.details || "Failed to analyze listing");
      }
      return response.json() as Promise<ListingAnalyzerResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.listing.confidence >= 50) {
        toast({
          title: "Listing Analyzed!",
          description: `Found: ${data.listing.title || data.listing.city || 'Listing'}`
        });
      } else {
        toast({
          title: "Partial Data Extracted",
          description: "Some information couldn't be read from the listing page.",
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
      setResult(null);
    }
  });

  const handleAnalyzeListing = () => {
    if (!listingUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please paste a BizBuySell or LoopNet listing URL",
        variant: "destructive"
      });
      return;
    }
    analyzeMutation.mutate(listingUrl.trim());
  };

  const handleRunCleanbi = () => {
    if (result?.suggestedAddress) {
      onAnalyzeAddress(result.suggestedAddress, result.listing.title);
      toast({
        title: "Running CLEANBI Analysis",
        description: `Scoring: ${result.suggestedAddress}`
      });
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-white h-11"
          data-testid="button-toggle-listing-analyzer"
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Analyze Any Listing URL</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-3">
        <div className="text-xs text-white/60 mb-2">
          Paste a BizBuySell, LoopNet, or BusinessBroker.net URL to instantly extract listing data and run CLEANBI analysis.
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyzeListing()}
              placeholder="https://www.bizbuysell.com/..."
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10 text-sm"
              data-testid="input-listing-url"
            />
          </div>
          <Button
            onClick={handleAnalyzeListing}
            disabled={analyzeMutation.isPending || !listingUrl.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4"
            data-testid="button-analyze-listing"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Fetch"
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-[10px] border-white/20 text-white/50">BizBuySell</Badge>
          <Badge variant="outline" className="text-[10px] border-white/20 text-white/50">LoopNet</Badge>
          <Badge variant="outline" className="text-[10px] border-white/20 text-white/50">BusinessBroker.net</Badge>
        </div>

        {result && result.listing && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {result.listing.title && (
                    <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                      {result.listing.title}
                    </h4>
                  )}
                  {(result.listing.city || result.listing.fullAddress) && (
                    <div className="flex items-center gap-1 text-white/60 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{result.listing.fullAddress || `${result.listing.city}, ${result.listing.state}`}</span>
                    </div>
                  )}
                </div>
                <Badge 
                  className="text-[10px]" 
                  style={{ 
                    backgroundColor: result.listing.confidence >= 70 ? '#22C55E33' : result.listing.confidence >= 50 ? '#FBBF2433' : '#EF444433',
                    color: result.listing.confidence >= 70 ? '#22C55E' : result.listing.confidence >= 50 ? '#FBBF24' : '#EF4444'
                  }}
                >
                  {result.listing.confidence}% match
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {result.listing.askingPrice && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-white/50 flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Asking
                    </div>
                    <div className="text-white font-bold text-sm" data-testid="text-listing-price">
                      {formatCurrency(result.listing.askingPrice)}
                    </div>
                  </div>
                )}
                {result.listing.annualRevenue && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-white/50 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Revenue
                    </div>
                    <div className="text-white font-bold text-sm" data-testid="text-listing-revenue">
                      {formatCurrency(result.listing.annualRevenue)}
                    </div>
                  </div>
                )}
                {result.listing.cashFlow && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-white/50 flex items-center justify-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Cash Flow
                    </div>
                    <div className="text-green-400 font-bold text-sm" data-testid="text-listing-cashflow">
                      {formatCurrency(result.listing.cashFlow)}
                    </div>
                  </div>
                )}
              </div>

              {result.dealMetrics.verdict && (
                <div 
                  className="rounded-lg p-3 border"
                  style={{ 
                    backgroundColor: result.dealMetrics.verdictColor + '15',
                    borderColor: result.dealMetrics.verdictColor + '40'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.dealMetrics.verdict === 'great_deal' && <CheckCircle2 className="w-4 h-4" style={{ color: result.dealMetrics.verdictColor }} />}
                      {result.dealMetrics.verdict === 'overpriced' && <AlertCircle className="w-4 h-4" style={{ color: result.dealMetrics.verdictColor }} />}
                      <span className="font-bold text-sm" style={{ color: result.dealMetrics.verdictColor }}>
                        {result.dealMetrics.verdictLabel}
                      </span>
                    </div>
                    {result.dealMetrics.priceToRevenueMultiple && (
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: result.dealMetrics.verdictColor + '60', color: result.dealMetrics.verdictColor }}>
                        {result.dealMetrics.priceToRevenueMultiple}x Revenue
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-white/70" data-testid="text-deal-analysis">
                    {result.dealMetrics.analysis}
                  </p>
                </div>
              )}

              {result.readyForCleanbi && result.suggestedAddress && (
                <Button
                  onClick={handleRunCleanbi}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-[#C8A661] to-[#8B7355] hover:opacity-90 text-white h-11 text-sm font-medium"
                  data-testid="button-run-cleanbi-from-listing"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running CLEANBI...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Run CLEANBI Analysis
                    </>
                  )}
                </Button>
              )}

              <a 
                href={result.listing.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                data-testid="link-view-original-listing"
              >
                <ExternalLink className="w-3 h-3" />
                View Original Listing
              </a>
            </CardContent>
          </Card>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
