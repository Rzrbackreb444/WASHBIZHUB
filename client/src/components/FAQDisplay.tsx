/**
 * FAQ Display Component
 * 
 * Visible FAQ section for pages with schema.org markup built-in.
 * Improves both UX and SEO (AEO).
 */

import { memo, useState } from 'react';
import { ChevronDown, MessageCircleQuestion, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQDisplayProps {
  faqs: FAQ[];
  title?: string;
  description?: string;
  variant?: 'accordion' | 'list' | 'grid';
  columns?: 1 | 2;
  className?: string;
  showIcon?: boolean;
}

export const FAQDisplay = memo(function FAQDisplay({
  faqs,
  title = "Frequently Asked Questions",
  description,
  variant = 'accordion',
  columns = 1,
  className = '',
  showIcon = true
}: FAQDisplayProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  if (variant === 'grid') {
    return (
      <section 
        className={`py-8 ${className}`}
        itemScope 
        itemType="https://schema.org/FAQPage"
        data-testid="faq-section-grid"
      >
        {title && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              {showIcon && <HelpCircle className="w-6 h-6 text-[#C8A661]" />}
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{description}</p>
            )}
          </div>
        )}
        
        <div className={cn(
          "grid gap-6",
          columns === 2 ? "md:grid-cols-2" : "grid-cols-1"
        )}>
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-card border rounded-lg p-5"
              itemScope 
              itemProp="mainEntity" 
              itemType="https://schema.org/Question"
            >
              <h3 
                className="font-semibold text-foreground mb-2 flex items-start gap-2"
                itemProp="name"
              >
                <MessageCircleQuestion className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                {faq.question}
              </h3>
              <div 
                itemScope 
                itemProp="acceptedAnswer" 
                itemType="https://schema.org/Answer"
              >
                <p 
                  className="text-sm text-muted-foreground pl-7"
                  itemProp="text"
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'list') {
    return (
      <section 
        className={`py-8 ${className}`}
        itemScope 
        itemType="https://schema.org/FAQPage"
        data-testid="faq-section-list"
      >
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {showIcon && <HelpCircle className="w-6 h-6 text-[#C8A661]" />}
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        )}
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border-b pb-4 last:border-b-0"
              itemScope 
              itemProp="mainEntity" 
              itemType="https://schema.org/Question"
            >
              <h3 
                className="font-semibold text-foreground mb-2"
                itemProp="name"
              >
                {faq.question}
              </h3>
              <div 
                itemScope 
                itemProp="acceptedAnswer" 
                itemType="https://schema.org/Answer"
              >
                <p 
                  className="text-sm text-muted-foreground"
                  itemProp="text"
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Accordion variant (default)
  return (
    <section 
      className={`py-8 ${className}`}
      itemScope 
      itemType="https://schema.org/FAQPage"
      data-testid="faq-section-accordion"
    >
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {showIcon && <HelpCircle className="w-6 h-6 text-[#C8A661]" />}
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border rounded-lg overflow-hidden"
            itemScope 
            itemProp="mainEntity" 
            itemType="https://schema.org/Question"
          >
            <button
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
              data-testid={`faq-toggle-${index}`}
            >
              <span 
                className="font-medium text-foreground pr-4"
                itemProp="name"
              >
                {faq.question}
              </span>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            
            <div 
              className={cn(
                "transition-all duration-200 overflow-hidden",
                openIndex === index ? "max-h-96" : "max-h-0"
              )}
              itemScope 
              itemProp="acceptedAnswer" 
              itemType="https://schema.org/Answer"
            >
              <p 
                className="px-4 pb-4 text-sm text-muted-foreground"
                itemProp="text"
              >
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

// ===== COMMON FAQS BY PAGE TYPE =====

export const HOMEPAGE_FAQS: FAQ[] = [
  {
    question: "What is WashBizHub?",
    answer: "WashBizHub is the #1 platform for laundromat owners, buyers, sellers, and investors. We provide CLEANBI location intelligence scoring, 50+ business calculators, a national marketplace of laundromats for sale, educational courses from industry legend Larry Larsen, and AI-powered business tools."
  },
  {
    question: "What is a CLEANBI score?",
    answer: "CLEANBI is our proprietary 17-factor weighted scoring system that evaluates laundromat locations on a scale of 0-100. An A score (85+) indicates excellent opportunity, B (70-84) is good, C (55-69) is fair, and below 55 needs strategic improvements. It analyzes demographics, competition, traffic, and financial metrics."
  },
  {
    question: "How much does a laundromat cost?",
    answer: "Laundromats typically sell for 2.5-4x annual revenue or 3-5x EBITDA. Prices range from $100,000 for small stores to $1M+ for premium locations. Use our Valuation Calculator for accurate estimates based on actual financials."
  },
  {
    question: "Is owning a laundromat profitable?",
    answer: "Yes, laundromats can be highly profitable with 20-35% average ROI. Well-managed stores in good locations achieve 40%+ returns. Key factors include location quality (CLEANBI score), equipment efficiency, and operational management."
  },
  {
    question: "Who is Larry Larsen?",
    answer: "Larry Larsen is an industry legend with 50+ years of experience and 135+ laundromats designed. As the former CLA President and founder of Laundromat123.com, he partners with WashBizHub to provide unmatched educational content through Larry's Academy."
  }
];

export const CLEANBI_FAQS: FAQ[] = [
  {
    question: "How is the CLEANBI score calculated?",
    answer: "CLEANBI evaluates 17 weighted factors including: Rent as % of Revenue (10%), EBITDA Margin (10%), Turns Per Day (10%), Market Saturation (8%), DSCR (8%), plus 12 additional factors covering demographics, competition, traffic patterns, and growth potential."
  },
  {
    question: "What is a good CLEANBI score for buying a laundromat?",
    answer: "A score of 85+ (Grade A) indicates excellent opportunity with strong fundamentals. Scores of 70-84 (Grade B) are good investments. Below 55 requires careful due diligence and strategic improvements to become profitable."
  },
  {
    question: "Can I use CLEANBI for new build locations?",
    answer: "Yes, CLEANBI is perfect for evaluating potential new build sites. It analyzes demographics, competition density, traffic patterns, and market saturation to help you choose the optimal location before investing."
  },
  {
    question: "How often is CLEANBI data updated?",
    answer: "CLEANBI uses the latest available demographic data from the US Census Bureau, combined with real-time competition analysis from Google Maps, and current market intelligence from our network of 73,000+ industry professionals."
  }
];

export const MARKETPLACE_FAQS: FAQ[] = [
  {
    question: "How do I find laundromats for sale near me?",
    answer: "Use our Marketplace search with location filters to find laundromats in your area. Filter by state, city, price range, and CLEANBI score. Each listing includes key metrics and CLEANBI analysis."
  },
  {
    question: "Are the laundromat listings verified?",
    answer: "Listings come from verified brokers, owners, and our network. We recommend conducting full due diligence using our Due Diligence Guide and CLEANBI analysis before any purchase."
  },
  {
    question: "How do I list my laundromat for sale?",
    answer: "Visit our 'Sell Your Laundromat' page to create a listing. You can sell directly (FSBO) or connect with our network of verified laundromat brokers for professional representation."
  }
];

export const EDUCATION_FAQS: FAQ[] = [
  {
    question: "What is Larry's Academy?",
    answer: "Larry's Academy is our comprehensive education program taught by industry legend Larry Larsen (50+ years experience, 135+ stores designed). It includes 101 (Fundamentals), 201 (Advanced), and 301 (Expert) level courses with certification."
  },
  {
    question: "Is Larry's Academy worth it?",
    answer: "Absolutely. The knowledge from Larry Larsen alone has helped students avoid costly mistakes worth $50,000-$200,000+. The courses cover everything from due diligence to advanced valuation methods not available anywhere else."
  },
  {
    question: "What is The Laundromat Bible?",
    answer: "The Laundromat Bible is our 14-chapter comprehensive guide covering every aspect of laundromat ownership - from buying and financing to operations and exit strategies. Written by Larry Larsen with WashBizHub."
  }
];

export default FAQDisplay;
