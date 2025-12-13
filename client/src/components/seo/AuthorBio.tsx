/**
 * AuthorBio Component - E-E-A-T Signal
 * 
 * Displays author information with schema.org markup for credibility signals.
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AUTHOR_NICK } from '@/lib/seo-config';

interface AuthorBioProps {
  author?: typeof AUTHOR_NICK;
  variant?: 'compact' | 'full';
  showCredentials?: boolean;
  showSocial?: boolean;
  className?: string;
}

export function AuthorBio({
  author = AUTHOR_NICK,
  variant = 'compact',
  showCredentials = true,
  showSocial = false,
  className = ''
}: AuthorBioProps) {
  const initials = author.name.split(' ').map(n => n[0]).join('');
  
  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center gap-3 ${className}`}
        itemScope 
        itemType="https://schema.org/Person"
        data-testid="author-bio-compact"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={author.image} alt={author.name} itemProp="image" />
          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <a 
            href={author.url}
            className="font-medium text-foreground hover:text-primary transition-colors"
            itemProp="url"
          >
            <span itemProp="name">{author.name}</span>
          </a>
          <p className="text-sm text-muted-foreground" itemProp="jobTitle">
            {author.jobTitle}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Card className={`border-primary/20 ${className}`} data-testid="author-bio-full">
      <CardContent className="p-6">
        <div 
          itemScope 
          itemType="https://schema.org/Person"
          className="space-y-4"
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={author.image} alt={author.name} itemProp="image" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <a 
                href={author.url}
                className="text-xl font-bold text-foreground hover:text-primary transition-colors"
                itemProp="url"
              >
                <span itemProp="name">{author.name}</span>
              </a>
              <p className="text-muted-foreground" itemProp="jobTitle">
                {author.jobTitle}
              </p>
              {showSocial && author.socialProfiles && (
                <div className="flex gap-2 mt-2">
                  {author.socialProfiles.linkedin && (
                    <a 
                      href={author.socialProfiles.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      itemProp="sameAs"
                      aria-label="LinkedIn Profile"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {author.socialProfiles.twitter && (
                    <a 
                      href={author.socialProfiles.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      itemProp="sameAs"
                      aria-label="Twitter Profile"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {author.experience && (
            <p className="text-muted-foreground leading-relaxed" itemProp="description">
              {author.experience}
            </p>
          )}
          
          {showCredentials && author.credentials && author.credentials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {author.credentials.map((credential, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-xs"
                  itemProp="hasCredential"
                >
                  {credential}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AuthorBio;
