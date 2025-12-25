import { useState } from "react";
import { Building2, Star, Clock, Phone, Globe, MapPin, Users, TrendingUp, ChevronDown, ChevronUp, ExternalLink, Lock, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Competitor {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  priceLevel?: number;
  isOpen?: boolean;
  hours?: string[];
  phone?: string;
  website?: string;
  services?: string[];
  photos?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

interface CompetitorDeepDiveProps {
  competitors: Competitor[];
  userAddress: string;
  isLoading?: boolean;
  isSubscriber?: boolean;
  onUpgradeClick?: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function CompetitorCard({ competitor, rank }: { competitor: Competitor; rank: number }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const threatLevel = competitor.rating >= 4.5 ? "high" : 
                      competitor.rating >= 4.0 ? "medium" : "low";
  
  const threatColors = {
    high: "bg-red-500/10 text-red-600 border-red-200",
    medium: "bg-amber-500/10 text-amber-600 border-amber-200",
    low: "bg-green-500/10 text-green-600 border-green-200"
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                  #{rank}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {competitor.name}
                    {competitor.isOpen && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                        Open Now
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {competitor.distance.toFixed(1)} mi away
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", threatColors[threatLevel])}>
                  {threatLevel === "high" ? "Strong Competitor" : 
                   threatLevel === "medium" ? "Moderate" : "Weak Competitor"}
                </Badge>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-3">
              <StarRating rating={competitor.rating} />
              <span className="text-sm text-muted-foreground">
                ({competitor.reviewCount} reviews)
              </span>
              {competitor.priceLevel && (
                <span className="text-sm text-muted-foreground">
                  {"$".repeat(competitor.priceLevel)}
                </span>
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {competitor.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${competitor.phone}`} className="hover:underline">
                    {competitor.phone}
                  </a>
                </div>
              )}
              {competitor.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={competitor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            
            {competitor.hours && competitor.hours.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hours
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  {competitor.hours.slice(0, 7).map((hour, i) => (
                    <span key={i}>{hour}</span>
                  ))}
                </div>
              </div>
            )}
            
            {competitor.services && competitor.services.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Services Offered</p>
                <div className="flex flex-wrap gap-1">
                  {competitor.services.map((service, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid gap-3 md:grid-cols-2 pt-2">
              {competitor.strengths && competitor.strengths.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">Their Strengths</p>
                  <ul className="text-xs space-y-1">
                    {competitor.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500">+</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-600">Their Weaknesses</p>
                  <ul className="text-xs space-y-1">
                    {competitor.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-amber-500">-</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <MapPin className="h-4 w-4 mr-1" />
                View on Map
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                Compare
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function CompetitorDeepDive({ competitors, userAddress, isLoading, isSubscriber = false, onUpgradeClick }: CompetitorDeepDiveProps) {
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "reviews">("distance");
  
  if (!isSubscriber) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
            <p className="text-muted-foreground mb-4">
              Deep competitor analysis requires a Pro subscription
            </p>
            <Button onClick={onUpgradeClick} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="h-64 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Competitors Found!</h3>
          <p className="text-muted-foreground">
            This is a blue ocean opportunity - no laundromats within 1 mile.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const sortedCompetitors = [...competitors].sort((a, b) => {
    switch (sortBy) {
      case "rating": return b.rating - a.rating;
      case "reviews": return b.reviewCount - a.reviewCount;
      default: return a.distance - b.distance;
    }
  });
  
  const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
  const totalReviews = competitors.reduce((sum, c) => sum + c.reviewCount, 0);
  const highRatedCount = competitors.filter(c => c.rating >= 4.5).length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Competitor Analysis
            </CardTitle>
            <CardDescription>
              {competitors.length} competitors within 1 mile of your location
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {(["distance", "rating", "reviews"] as const).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy(option)}
                className="text-xs"
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{competitors.length}</p>
            <p className="text-xs text-muted-foreground">Competitors</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{highRatedCount}</p>
            <p className="text-xs text-muted-foreground">4.5+ Rated</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Market Competition Level</span>
            <span className="font-medium">
              {competitors.length <= 3 ? "Low" : 
               competitors.length <= 6 ? "Moderate" : "High"}
            </span>
          </div>
          <Progress 
            value={Math.min(100, (competitors.length / 10) * 100)} 
            className="h-2"
          />
        </div>
        
        <div className="space-y-3">
          {sortedCompetitors.map((competitor, index) => (
            <CompetitorCard 
              key={competitor.id} 
              competitor={competitor} 
              rank={index + 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CompetitorDeepDive;
