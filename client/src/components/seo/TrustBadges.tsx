/**
 * TrustBadges Component - E-E-A-T Trust Signals
 * 
 * Displays trust badges and metrics for credibility.
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TRUST_SIGNALS, RATINGS } from '@/lib/seo-config';
import { Shield, Users, MapPin, Award, CheckCircle } from 'lucide-react';
import { Star } from "@/lib/icon-registry";

interface TrustBadgesProps {
  variant?: 'compact' | 'full' | 'inline';
  showRating?: boolean;
  showUsers?: boolean;
  showStates?: boolean;
  showTools?: boolean;
  showCertifications?: boolean;
  rating?: typeof RATINGS.platform;
  className?: string;
}

export function TrustBadges({
  variant = 'inline',
  showRating = true,
  showUsers = true,
  showStates = true,
  showTools = true,
  showCertifications = false,
  rating = RATINGS.platform,
  className = ''
}: TrustBadgesProps) {
  
  if (variant === 'inline') {
    return (
      <div 
        className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground ${className}`}
        data-testid="trust-badges-inline"
      >
        {showRating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-foreground">{rating.ratingValue}</span>
            <span>({rating.reviewCount.toLocaleString()} reviews)</span>
          </div>
        )}
        {showUsers && (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-primary" />
            <span>{TRUST_SIGNALS.userCount} users</span>
          </div>
        )}
        {showStates && (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{TRUST_SIGNALS.statesCovered} states</span>
          </div>
        )}
        {showTools && (
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-primary" />
            <span>{TRUST_SIGNALS.toolsCount} tools</span>
          </div>
        )}
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div 
        className={`flex flex-wrap gap-2 ${className}`}
        data-testid="trust-badges-compact"
      >
        {showRating && (
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            {rating.ratingValue}
          </Badge>
        )}
        {showUsers && (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {TRUST_SIGNALS.userCount}
          </Badge>
        )}
        {showStates && (
          <Badge variant="secondary" className="gap-1">
            <MapPin className="h-3 w-3" />
            {TRUST_SIGNALS.statesCovered} States
          </Badge>
        )}
        {showTools && (
          <Badge variant="secondary" className="gap-1">
            <Award className="h-3 w-3" />
            {TRUST_SIGNALS.toolsCount}
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <Card className={className} data-testid="trust-badges-full">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {showRating && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold">{rating.ratingValue}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {rating.reviewCount.toLocaleString()} reviews
              </p>
            </div>
          )}
          {showUsers && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{TRUST_SIGNALS.userCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Active users</p>
            </div>
          )}
          {showStates && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{TRUST_SIGNALS.statesCovered}</span>
              </div>
              <p className="text-sm text-muted-foreground">States covered</p>
            </div>
          )}
          {showTools && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{TRUST_SIGNALS.toolsCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Industry tools</p>
            </div>
          )}
        </div>
        
        {showCertifications && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex flex-wrap justify-center gap-4">
              {TRUST_SIGNALS.certifications.map((cert, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StarRating({ 
  rating, 
  size = 'sm',
  showCount = true,
  className = '' 
}: { 
  rating: { ratingValue: number; reviewCount: number };
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      itemProp="aggregateRating"
      itemScope
      itemType="https://schema.org/AggregateRating"
      data-testid="star-rating"
    >
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating.ratingValue) 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="font-semibold" itemProp="ratingValue">{rating.ratingValue}</span>
      {showCount && (
        <span className="text-muted-foreground text-sm">
          (<span itemProp="reviewCount">{rating.reviewCount.toLocaleString()}</span> reviews)
        </span>
      )}
      <meta itemProp="bestRating" content="5" />
      <meta itemProp="worstRating" content="1" />
    </div>
  );
}

export default TrustBadges;
