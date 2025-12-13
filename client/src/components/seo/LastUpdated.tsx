/**
 * LastUpdated Component - E-E-A-T Freshness Signal
 * 
 * Displays last updated date with schema.org markup for content freshness.
 */

import { Clock, CalendarDays } from 'lucide-react';

interface LastUpdatedProps {
  date: string | Date;
  prefix?: string;
  showIcon?: boolean;
  variant?: 'text' | 'badge';
  className?: string;
}

export function LastUpdated({
  date,
  prefix = 'Updated',
  showIcon = true,
  variant = 'text',
  className = ''
}: LastUpdatedProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const isoDate = dateObj.toISOString();
  
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const relativeTime = getRelativeTime(dateObj);
  
  if (variant === 'badge') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md text-xs text-muted-foreground ${className}`}
        data-testid="last-updated-badge"
      >
        {showIcon && <Clock className="h-3 w-3" />}
        <time dateTime={isoDate} itemProp="dateModified">
          {prefix}: {formattedDate}
        </time>
      </div>
    );
  }
  
  return (
    <div 
      className={`flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}
      data-testid="last-updated-text"
    >
      {showIcon && <Clock className="h-4 w-4" />}
      <time dateTime={isoDate} itemProp="dateModified" title={formattedDate}>
        {prefix} {relativeTime}
      </time>
    </div>
  );
}

interface DatePublishedProps {
  date: string | Date;
  author?: string;
  showIcon?: boolean;
  className?: string;
}

export function DatePublished({
  date,
  author,
  showIcon = true,
  className = ''
}: DatePublishedProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const isoDate = dateObj.toISOString();
  
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div 
      className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}
      data-testid="date-published"
    >
      <div className="flex items-center gap-1.5">
        {showIcon && <CalendarDays className="h-4 w-4" />}
        <time dateTime={isoDate} itemProp="datePublished">
          {formattedDate}
        </time>
      </div>
      {author && (
        <>
          <span className="text-muted-foreground/50">•</span>
          <span itemProp="author">{author}</span>
        </>
      )}
    </div>
  );
}

interface ContentMetaProps {
  publishedDate?: string | Date;
  modifiedDate?: string | Date;
  author?: string;
  readTime?: number;
  className?: string;
}

export function ContentMeta({
  publishedDate,
  modifiedDate,
  author,
  readTime,
  className = ''
}: ContentMetaProps) {
  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div 
      className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground ${className}`}
      data-testid="content-meta"
    >
      {author && (
        <span itemProp="author" itemScope itemType="https://schema.org/Person">
          By <span className="font-medium text-foreground" itemProp="name">{author}</span>
        </span>
      )}
      
      {publishedDate && (
        <time 
          dateTime={typeof publishedDate === 'string' ? publishedDate : publishedDate.toISOString()} 
          itemProp="datePublished"
          className="flex items-center gap-1"
        >
          <CalendarDays className="h-4 w-4" />
          {formatDate(publishedDate)}
        </time>
      )}
      
      {modifiedDate && (
        <time 
          dateTime={typeof modifiedDate === 'string' ? modifiedDate : modifiedDate.toISOString()} 
          itemProp="dateModified"
          className="flex items-center gap-1"
        >
          <Clock className="h-4 w-4" />
          Updated {formatDate(modifiedDate)}
        </time>
      )}
      
      {readTime && (
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {readTime} min read
        </span>
      )}
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'last week';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return 'last month';
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

export default LastUpdated;
