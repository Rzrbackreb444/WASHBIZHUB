/**
 * SuperSEO Wrapper Component
 * 
 * Use this wrapper for ALL pages to ensure maximum SEO optimization.
 * Combines MasterSEO with performance and accessibility optimizations.
 */

import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { MasterSEO, type MasterSEOProps, SEO_PRESETS, DEFAULT_AUTHOR } from '@/lib/seo-template';
import { Skeleton } from '@/components/ui/skeleton';

interface SuperSEOWrapperProps extends MasterSEOProps {
  children: ReactNode;
  showBreadcrumbs?: boolean;
  showAuthor?: boolean;
  showLastUpdated?: boolean;
  className?: string;
}

export function SuperSEOWrapper({
  children,
  showBreadcrumbs = true,
  showAuthor = false,
  showLastUpdated = false,
  className = "",
  breadcrumbs = [],
  ...seoProps
}: SuperSEOWrapperProps) {
  
  // Performance: Report Core Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // LCP (Largest Contentful Paint)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.debug('[Core Web Vitals] LCP:', lastEntry.startTime);
      });
      
      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // Observer not supported
      }
      
      return () => observer.disconnect();
    }
  }, []);
  
  // Accessibility: Announce page changes
  useEffect(() => {
    const title = seoProps.title;
    if (title) {
      document.title = `${title} | WashBizHub`;
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Navigated to ${title}`;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    }
  }, [seoProps.title]);
  
  return (
    <>
      <MasterSEO {...seoProps} breadcrumbs={breadcrumbs} />
      
      <article 
        className={`super-seo-content ${className}`}
        itemScope 
        itemType={
          seoProps.pageType === 'article' || seoProps.pageType === 'blog' 
            ? "https://schema.org/Article" 
            : seoProps.pageType === 'calculator' || seoProps.pageType === 'tool'
            ? "https://schema.org/WebApplication"
            : "https://schema.org/WebPage"
        }
      >
        {/* Breadcrumbs for Navigation & SEO */}
        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <nav 
            aria-label="Breadcrumb" 
            className="mb-4 text-sm"
            itemScope 
            itemType="https://schema.org/BreadcrumbList"
          >
            <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <a 
                  href="/" 
                  className="hover:text-foreground transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">Home</span>
                </a>
                <meta itemProp="position" content="1" />
              </li>
              {breadcrumbs.map((bc, index) => (
                <li 
                  key={bc.url}
                  itemProp="itemListElement" 
                  itemScope 
                  itemType="https://schema.org/ListItem"
                  className="flex items-center gap-1.5"
                >
                  <span className="text-muted-foreground/50">/</span>
                  <a 
                    href={bc.url}
                    className="hover:text-foreground transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{bc.name}</span>
                  </a>
                  <meta itemProp="position" content={String(index + 2)} />
                </li>
              ))}
            </ol>
          </nav>
        )}
        
        {/* Author & Date for E-E-A-T */}
        {(showAuthor || showLastUpdated) && (
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            {showAuthor && seoProps.author && (
              <div 
                itemProp="author" 
                itemScope 
                itemType="https://schema.org/Person"
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold text-xs">
                    {seoProps.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <span itemProp="name" className="font-medium text-foreground">
                    {seoProps.author.name}
                  </span>
                  {seoProps.author.jobTitle && (
                    <span itemProp="jobTitle" className="block text-xs">
                      {seoProps.author.jobTitle}
                    </span>
                  )}
                </div>
              </div>
            )}
            {showLastUpdated && seoProps.dateModified && (
              <time 
                itemProp="dateModified" 
                dateTime={seoProps.dateModified}
                className="flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated: {new Date(seoProps.dateModified).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            )}
          </div>
        )}
        
        {/* Main Content with Schema.org markup */}
        <div itemProp="mainContentOfPage">
          {children}
        </div>
        
        {/* Trust Signals for E-E-A-T */}
        {seoProps.aggregateRating && (
          <div 
            itemProp="aggregateRating" 
            itemScope 
            itemType="https://schema.org/AggregateRating"
            className="sr-only"
          >
            <meta itemProp="ratingValue" content={String(seoProps.aggregateRating.ratingValue)} />
            <meta itemProp="reviewCount" content={String(seoProps.aggregateRating.reviewCount)} />
            <meta itemProp="bestRating" content="5" />
            <meta itemProp="worstRating" content="1" />
          </div>
        )}
      </article>
    </>
  );
}

// ===== LOADING STATES FOR PERFORMANCE =====

export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

// ===== SPEAKABLE CONTENT FOR AEO =====

export function SpeakableContent({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div 
      className={`speakable-content ${className}`}
      data-speakable="true"
    >
      {children}
    </div>
  );
}

// ===== PRIMARY ANSWER FOR AEO =====

export function PrimaryAnswer({ 
  question,
  answer,
  className = "" 
}: { 
  question: string;
  answer: string;
  className?: string;
}) {
  return (
    <div 
      className={`primary-answer ${className}`}
      itemScope 
      itemType="https://schema.org/Question"
    >
      <h2 itemProp="name" className="sr-only">{question}</h2>
      <div 
        itemProp="acceptedAnswer" 
        itemScope 
        itemType="https://schema.org/Answer"
      >
        <div itemProp="text" className="text-lg leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

// ===== FAQ SECTION FOR SERP =====

export function FAQSection({ 
  faqs,
  className = "" 
}: { 
  faqs: { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <section 
      className={`faq-section ${className}`}
      itemScope 
      itemType="https://schema.org/FAQPage"
    >
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Bebas Neue' }}>
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            itemScope 
            itemType="https://schema.org/Question"
            className="border border-border/50 rounded-lg p-4 bg-card/50"
          >
            <h3 
              itemProp="name" 
              className="font-semibold text-lg mb-2"
            >
              {faq.question}
            </h3>
            <div 
              itemProp="acceptedAnswer" 
              itemScope 
              itemType="https://schema.org/Answer"
            >
              <p itemProp="text" className="text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== REVIEW SECTION FOR TRUST =====

export function ReviewSection({ 
  reviews,
  aggregateRating,
  className = "" 
}: { 
  reviews: { author: string; rating: number; text: string }[];
  aggregateRating?: { ratingValue: number; reviewCount: number };
  className?: string;
}) {
  return (
    <section className={`review-section ${className}`}>
      {aggregateRating && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${star <= aggregateRating.ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-semibold">{aggregateRating.ratingValue.toFixed(1)}</span>
          <span className="text-muted-foreground">
            ({aggregateRating.reviewCount.toLocaleString()} reviews)
          </span>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, index) => (
          <div 
            key={index}
            className="p-4 border border-border/50 rounded-lg bg-card/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-medium">{review.author}</span>
            </div>
            <p className="text-sm text-muted-foreground">{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SuperSEOWrapper;
