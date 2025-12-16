/**
 * EEAT Components for WashBizHub
 * Experience, Expertise, Authoritativeness, Trustworthiness
 * 
 * Components:
 * - AuthorBox: Visible author attribution for content
 * - ExpertBadge: Credentials display
 * - TrustBar: Floating trust signals
 * - ContentCitations: Source attribution
 * - ReviewSchema: Testimonial markup
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, Shield, Award, Calendar, Clock, 
  Star, Users, Building, ExternalLink, Verified
} from 'lucide-react';

// ===== AUTHOR DATA =====

export interface AuthorData {
  name: string;
  title: string;
  image?: string;
  credentials: string[];
  experience?: string;
  bio?: string;
  linkedIn?: string;
  verifiedExpert?: boolean;
}

export const LARRY_LARSEN: AuthorData = {
  name: "Larry Larsen",
  title: "Industry Legend & Master Consultant",
  image: "/authors/larry-larsen.jpg",
  credentials: [
    "50+ Years Industry Experience",
    "135+ Laundromats Designed",
    "Former CLA President",
    "Laundromat123.com Founder"
  ],
  experience: "50+ years",
  bio: "Larry Larsen has been the guiding force behind successful laundromats across America for over five decades. His expertise in store design, equipment selection, and operational excellence has helped thousands of owners maximize their investments.",
  linkedIn: "https://linkedin.com/in/larry-larsen",
  verifiedExpert: true
};

export const NICK_KREMERS: AuthorData = {
  name: "Nick Kremers",
  title: "Founder & 3rd-Gen Laundromat Expert",
  image: "/authors/nick-kremers.jpg",
  credentials: [
    "3rd Generation Laundromat Operator",
    "73,000+ Member Community Leader",
    "WashBizHub Founder",
    "CLEANBI System Creator"
  ],
  experience: "15+ years",
  bio: "Nick Kremers carries forward his family's laundromat legacy while pioneering modern technology solutions for the industry. As the creator of CLEANBI and leader of the largest laundromat community on Facebook, he bridges traditional expertise with cutting-edge analytics.",
  linkedIn: "https://linkedin.com/in/nick-kremers",
  verifiedExpert: true
};

export const WASHBIZHUB_TEAM: AuthorData = {
  name: "WashBizHub Editorial Team",
  title: "Industry Research & Analysis",
  credentials: [
    "Expert-Reviewed Content",
    "Data-Driven Insights",
    "Industry-Verified Information"
  ],
  verifiedExpert: true
};

// ===== AUTHOR BOX COMPONENT =====

interface AuthorBoxProps {
  author: AuthorData;
  datePublished?: string;
  dateModified?: string;
  readTime?: string;
  showFullBio?: boolean;
  variant?: 'full' | 'compact' | 'inline';
}

export const AuthorBox = memo(function AuthorBox({
  author,
  datePublished,
  dateModified,
  readTime,
  showFullBio = false,
  variant = 'full'
}: AuthorBoxProps) {
  
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground" data-testid="author-inline">
        <Avatar className="h-8 w-8">
          {author.image && <AvatarImage src={author.image} alt={author.name} />}
          <AvatarFallback className="bg-[#0A1628] text-white text-xs">
            {author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{author.name}</span>
          {author.verifiedExpert && (
            <Verified className="w-4 h-4 text-[#C8A661]" />
          )}
          {dateModified && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>Updated {new Date(dateModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </>
          )}
          {readTime && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <Clock className="w-3 h-3" />
              <span>{readTime}</span>
            </>
          )}
        </div>
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border" data-testid="author-compact">
        <Avatar className="h-12 w-12">
          {author.image && <AvatarImage src={author.image} alt={author.name} />}
          <AvatarFallback className="bg-[#0A1628] text-white">
            {author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{author.name}</span>
            {author.verifiedExpert && (
              <Badge className="bg-[#C8A661] text-[#0A1628] text-xs">
                <Verified className="w-3 h-3 mr-1" />
                Verified Expert
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{author.title}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {author.experience && (
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                {author.experience}
              </span>
            )}
            {dateModified && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Updated {new Date(dateModified).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Full variant
  return (
    <Card className="bg-card border shadow-sm overflow-hidden" data-testid="author-full">
      <div className="h-1 bg-[#C8A661]" />
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            {author.image && <AvatarImage src={author.image} alt={author.name} />}
            <AvatarFallback className="bg-[#0A1628] text-white text-lg">
              {author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-lg text-foreground">{author.name}</h4>
              {author.verifiedExpert && (
                <Badge className="bg-[#C8A661] text-[#0A1628]">
                  <Verified className="w-3 h-3 mr-1" />
                  Verified Expert
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{author.title}</p>
            
            {/* Credentials */}
            <div className="flex flex-wrap gap-2 mb-3">
              {author.credentials.slice(0, 4).map((cred, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1 text-[#C8A661]" />
                  {cred}
                </Badge>
              ))}
            </div>
            
            {/* Bio */}
            {showFullBio && author.bio && (
              <p className="text-sm text-muted-foreground mb-3">{author.bio}</p>
            )}
            
            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {datePublished && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Published {new Date(datePublished).toLocaleDateString()}
                </span>
              )}
              {dateModified && dateModified !== datePublished && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {new Date(dateModified).toLocaleDateString()}
                </span>
              )}
              {readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readTime} read
                </span>
              )}
              {author.linkedIn && (
                <a 
                  href={author.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#C8A661] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ===== TRUST BAR COMPONENT =====

interface TrustBarProps {
  variant?: 'floating' | 'inline' | 'minimal';
  className?: string;
}

export const TrustBar = memo(function TrustBar({ 
  variant = 'inline',
  className = ''
}: TrustBarProps) {
  const trustSignals = [
    { icon: Users, value: "73,000+", label: "Industry Professionals" },
    { icon: Building, value: "50+", label: "Expert Tools" },
    { icon: Award, value: "Larry Larsen", label: "50+ Years Experience" },
    { icon: Shield, value: "Verified", label: "Data & Analysis" }
  ];
  
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center gap-6 text-sm text-muted-foreground ${className}`} data-testid="trust-minimal">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4 text-[#C8A661]" />
          73,000+ professionals
        </span>
        <span className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-[#C8A661]" />
          Expert verified
        </span>
      </div>
    );
  }
  
  if (variant === 'floating') {
    return (
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-[#0A1628] text-white py-2 px-4 z-40 border-t border-[#C8A661]/20 ${className}`}
        data-testid="trust-floating"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-8 text-sm">
          {trustSignals.map((signal, i) => (
            <div key={i} className="flex items-center gap-2">
              <signal.icon className="w-4 h-4 text-[#C8A661]" />
              <span className="font-semibold">{signal.value}</span>
              <span className="text-gray-400 hidden md:inline">{signal.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Inline variant
  return (
    <div className={`bg-muted/30 rounded-lg p-4 ${className}`} data-testid="trust-inline">
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {trustSignals.map((signal, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-full bg-[#C8A661]/10 flex items-center justify-center">
              <signal.icon className="w-4 h-4 text-[#C8A661]" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{signal.value}</div>
              <div className="text-xs text-muted-foreground">{signal.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ===== EXPERT REVIEWED BADGE =====

interface ExpertReviewedProps {
  reviewer?: AuthorData;
  reviewDate?: string;
}

export const ExpertReviewed = memo(function ExpertReviewed({
  reviewer = WASHBIZHUB_TEAM,
  reviewDate
}: ExpertReviewedProps) {
  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C8A661]/10 rounded-full text-sm"
      data-testid="expert-reviewed"
    >
      <Shield className="w-4 h-4 text-[#C8A661]" />
      <span className="text-muted-foreground">Expert reviewed by</span>
      <span className="font-medium text-foreground">{reviewer.name}</span>
      {reviewDate && (
        <span className="text-muted-foreground">
          • {new Date(reviewDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
      )}
    </div>
  );
});

// ===== CONTENT CITATIONS =====

interface Citation {
  source: string;
  url?: string;
  accessDate?: string;
}

interface ContentCitationsProps {
  citations: Citation[];
  title?: string;
}

export const ContentCitations = memo(function ContentCitations({
  citations,
  title = "Sources & References"
}: ContentCitationsProps) {
  if (citations.length === 0) return null;
  
  return (
    <div className="mt-8 pt-6 border-t" data-testid="content-citations">
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <ExternalLink className="w-4 h-4 text-[#C8A661]" />
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {citations.map((citation, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-[#C8A661]">[{i + 1}]</span>
            {citation.url ? (
              <a 
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C8A661] hover:underline"
              >
                {citation.source}
              </a>
            ) : (
              <span>{citation.source}</span>
            )}
            {citation.accessDate && (
              <span className="text-muted-foreground/60">
                (accessed {new Date(citation.accessDate).toLocaleDateString()})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});

// ===== TESTIMONIAL WITH SCHEMA =====

interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
  location?: string;
  rating?: number;
  image?: string;
  highlight?: string;
}

export const TestimonialCard = memo(function TestimonialCard({
  quote,
  author,
  role,
  location,
  rating = 5,
  image,
  highlight
}: TestimonialProps) {
  return (
    <Card 
      className="bg-card border shadow-sm p-6"
      itemScope
      itemType="https://schema.org/Review"
      data-testid={`testimonial-${author.toLowerCase().replace(/\s/g, '-')}`}
    >
      {/* Rating */}
      <div className="flex items-center gap-1 mb-3" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
        <meta itemProp="ratingValue" content={String(rating)} />
        <meta itemProp="bestRating" content="5" />
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'text-[#C8A661] fill-[#C8A661]' : 'text-muted'}`}
          />
        ))}
      </div>
      
      {/* Quote */}
      <blockquote className="text-foreground mb-4" itemProp="reviewBody">
        "{quote}"
      </blockquote>
      
      {/* Highlight badge */}
      {highlight && (
        <Badge className="bg-[#C8A661]/10 text-[#C8A661] mb-3">
          {highlight}
        </Badge>
      )}
      
      {/* Author */}
      <div className="flex items-center gap-3" itemProp="author" itemScope itemType="https://schema.org/Person">
        <Avatar className="h-10 w-10">
          {image && <AvatarImage src={image} alt={author} />}
          <AvatarFallback className="bg-[#0A1628] text-white">
            {author.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-foreground" itemProp="name">{author}</div>
          <div className="text-sm text-muted-foreground">
            {role && <span>{role}</span>}
            {role && location && <span> • </span>}
            {location && <span>{location}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
});

// ===== INDUSTRY AUTHORITY SIGNALS =====

export const IndustryAuthority = memo(function IndustryAuthority() {
  const authorities = [
    { name: "Coin Laundry Association", abbr: "CLA" },
    { name: "Larry Larsen Partnership", abbr: "Expert" },
    { name: "Blue Whale Equipment", abbr: "Partner" },
    { name: "73K+ Community", abbr: "Trust" }
  ];
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm" data-testid="industry-authority">
      <span className="text-muted-foreground">Trusted by:</span>
      {authorities.map((auth, i) => (
        <Badge key={i} variant="outline" className="border-[#C8A661]/40 text-muted-foreground">
          {auth.name}
        </Badge>
      ))}
    </div>
  );
});

export default AuthorBox;
