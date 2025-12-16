/**
 * AEO (Answer Engine Optimization) Schema Components
 * 
 * Optimized for AI-powered search engines:
 * - Google AI Overviews
 * - ChatGPT with browsing
 * - Perplexity AI
 * - Bing Copilot
 * 
 * These components generate structured data that AI crawlers can easily parse.
 */

import { memo } from 'react';
import { Helmet } from 'react-helmet-async';

// ===== DATASET SCHEMA (For Calculators & Data Tools) =====

interface DatasetSchemaProps {
  name: string;
  description: string;
  keywords: string[];
  creator?: {
    name: string;
    url?: string;
  };
  datePublished?: string;
  dateModified?: string;
  license?: string;
  spatialCoverage?: string;
  temporalCoverage?: string;
  variableMeasured?: string[];
  measurementTechnique?: string;
}

export const DatasetSchema = memo(function DatasetSchema({
  name,
  description,
  keywords,
  creator = { name: "WashBizHub", url: "https://washbizhub.com" },
  datePublished,
  dateModified,
  license = "Proprietary",
  spatialCoverage = "United States",
  temporalCoverage,
  variableMeasured = [],
  measurementTechnique
}: DatasetSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": name,
    "description": description,
    "keywords": keywords.join(", "),
    "creator": {
      "@type": "Organization",
      "name": creator.name,
      "url": creator.url
    },
    "license": license,
    "spatialCoverage": spatialCoverage,
    ...(temporalCoverage && { "temporalCoverage": temporalCoverage }),
    ...(datePublished && { "datePublished": datePublished }),
    ...(dateModified && { "dateModified": dateModified }),
    ...(variableMeasured.length > 0 && { 
      "variableMeasured": variableMeasured.map(v => ({
        "@type": "PropertyValue",
        "name": v
      }))
    }),
    ...(measurementTechnique && { "measurementTechnique": measurementTechnique }),
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
});

// ===== SPEAKABLE SCHEMA (For Voice Search) =====

interface SpeakableSchemaProps {
  pageTitle: string;
  pageUrl: string;
  speakableSelectors?: string[];
  headline?: string;
  summary?: string;
}

export const SpeakableSchema = memo(function SpeakableSchema({
  pageTitle,
  pageUrl,
  speakableSelectors = [".speakable", "h1", ".key-takeaway"],
  headline,
  summary
}: SpeakableSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "url": pageUrl,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": speakableSelectors
    },
    ...(headline && { "headline": headline }),
    ...(summary && { "abstract": summary })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
});

// ===== CALCULATOR/TOOL SCHEMA =====

interface CalculatorSchemaProps {
  name: string;
  description: string;
  url: string;
  inputVariables: string[];
  outputVariables: string[];
  category?: string;
  keywords?: string[];
  author?: { name: string; url?: string };
  datePublished?: string;
  dateModified?: string;
  howToSteps?: { name: string; text: string }[];
  faqs?: { question: string; answer: string }[];
}

export const CalculatorSchema = memo(function CalculatorSchema({
  name,
  description,
  url,
  inputVariables,
  outputVariables,
  category = "BusinessApplication",
  keywords = [],
  author = { name: "WashBizHub" },
  datePublished,
  dateModified,
  howToSteps = [],
  faqs = []
}: CalculatorSchemaProps) {
  const schemas = [];

  // Software Application schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "url": url,
    "applicationCategory": category,
    "operatingSystem": "Web",
    "browserRequirements": "Modern web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": author.name,
      ...(author.url && { "url": author.url })
    },
    ...(datePublished && { "datePublished": datePublished }),
    ...(dateModified && { "dateModified": dateModified }),
    "featureList": [
      ...inputVariables.map(v => `Input: ${v}`),
      ...outputVariables.map(v => `Output: ${v}`)
    ]
  });

  // HowTo schema if steps provided
  if (howToSteps.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to Use ${name}`,
      "description": description,
      "step": howToSteps.map((step, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "name": step.name,
        "text": step.text
      }))
    });
  }

  // FAQ schema if FAQs provided
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  return (
    <Helmet>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
});

// ===== ARTICLE SCHEMA (For Education/Blog) =====

interface ArticleSchemaProps {
  headline: string;
  description: string;
  url: string;
  image?: string;
  author: {
    name: string;
    url?: string;
    credentials?: string[];
  };
  datePublished: string;
  dateModified?: string;
  wordCount?: number;
  keywords?: string[];
  articleSection?: string;
  faqs?: { question: string; answer: string }[];
  speakable?: boolean;
}

export const ArticleSchema = memo(function ArticleSchema({
  headline,
  description,
  url,
  image,
  author,
  datePublished,
  dateModified,
  wordCount,
  keywords = [],
  articleSection,
  faqs = [],
  speakable = true
}: ArticleSchemaProps) {
  const schemas = [];

  // Article schema
  const articleSchema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "url": url,
    "author": {
      "@type": "Person",
      "name": author.name,
      ...(author.url && { "url": author.url }),
      ...(author.credentials && { 
        "hasCredential": author.credentials.map(c => ({
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": c
        }))
      })
    },
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://washbizhub.com/logo.png"
      }
    },
    "datePublished": datePublished,
    ...(dateModified && { "dateModified": dateModified }),
    ...(image && { "image": image }),
    ...(wordCount && { "wordCount": wordCount }),
    ...(keywords.length > 0 && { "keywords": keywords.join(", ") }),
    ...(articleSection && { "articleSection": articleSection })
  };

  // Add speakable if enabled
  if (speakable) {
    articleSchema.speakable = {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".article-summary", ".key-takeaway"]
    };
  }

  schemas.push(articleSchema);

  // FAQ schema if FAQs provided
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  return (
    <Helmet>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
});

// ===== COURSE SCHEMA (For Larry's Academy) =====

interface CourseSchemaProps {
  name: string;
  description: string;
  url: string;
  provider?: { name: string; url?: string };
  instructor?: { name: string; credentials?: string[] };
  coursePrerequisites?: string[];
  educationalLevel?: string;
  timeRequired?: string;
  numberOfLessons?: number;
  hasCourseInstance?: boolean;
  offers?: { price: string; priceCurrency?: string };
  aggregateRating?: { ratingValue: number; reviewCount: number };
}

export const CourseSchema = memo(function CourseSchema({
  name,
  description,
  url,
  provider = { name: "WashBizHub - Larry's Academy", url: "https://washbizhub.com/larrys-academy" },
  instructor,
  coursePrerequisites = [],
  educationalLevel = "Beginner to Advanced",
  timeRequired,
  numberOfLessons,
  hasCourseInstance = false,
  offers,
  aggregateRating
}: CourseSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": name,
    "description": description,
    "url": url,
    "provider": {
      "@type": "Organization",
      "name": provider.name,
      ...(provider.url && { "url": provider.url })
    },
    "educationalLevel": educationalLevel,
    ...(instructor && {
      "instructor": {
        "@type": "Person",
        "name": instructor.name,
        ...(instructor.credentials && {
          "hasCredential": instructor.credentials.map(c => ({
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": c
          }))
        })
      }
    }),
    ...(coursePrerequisites.length > 0 && { "coursePrerequisites": coursePrerequisites }),
    ...(timeRequired && { "timeRequired": timeRequired }),
    ...(numberOfLessons && { "numberOfLessons": numberOfLessons }),
    ...(offers && {
      "offers": {
        "@type": "Offer",
        "price": offers.price,
        "priceCurrency": offers.priceCurrency || "USD",
        "availability": "https://schema.org/InStock"
      }
    }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": 5
      }
    })
  };

  if (hasCourseInstance) {
    schema.hasCourseInstance = {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": timeRequired || "Self-paced"
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
});

// ===== SERVICE SCHEMA (For Consulting/Tools) =====

interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  provider?: { name: string; url?: string };
  areaServed?: string;
  offers?: { price?: string; priceCurrency?: string; description?: string }[];
  aggregateRating?: { ratingValue: number; reviewCount: number };
}

export const ServiceSchema = memo(function ServiceSchema({
  name,
  description,
  url,
  serviceType,
  provider = { name: "WashBizHub", url: "https://washbizhub.com" },
  areaServed = "United States",
  offers = [],
  aggregateRating
}: ServiceSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "url": url,
    "serviceType": serviceType,
    "provider": {
      "@type": "Organization",
      "name": provider.name,
      ...(provider.url && { "url": provider.url })
    },
    "areaServed": areaServed,
    ...(offers.length > 0 && {
      "offers": offers.map(offer => ({
        "@type": "Offer",
        ...(offer.price && { "price": offer.price }),
        "priceCurrency": offer.priceCurrency || "USD",
        ...(offer.description && { "description": offer.description })
      }))
    }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": 5
      }
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
});

// ===== PREDEFINED CALCULATOR FAQS =====

export const CALCULATOR_FAQS: Record<string, { question: string; answer: string }[]> = {
  valuation: [
    { question: "How do you calculate laundromat value?", answer: "Laundromat value is typically calculated using EBITDA multiples (3.44x-4.85x), SDE multiples (3.10x-4.25x), or revenue multiples (1.19x-1.78x). The WashBizHub Valuation Calculator uses industry-standard formulas to provide accurate estimates." },
    { question: "What is a good EBITDA multiple for a laundromat?", answer: "The industry standard EBITDA multiple for laundromats ranges from 3.4x to 4.8x. Premium locations with long leases, new equipment, and strong cash flow command higher multiples (4.5x-4.8x), while stores with short leases or older equipment sell at lower multiples (3.4x-3.5x)." },
    { question: "How much is a laundromat worth?", answer: "A laundromat's value depends on annual revenue, net income, location quality, equipment condition, and lease terms. Most laundromats sell for 2.5-4x annual revenue or 3-5x annual net profit. Use the CLEANBI score and Valuation Calculator for accurate estimates." }
  ],
  roi: [
    { question: "What is the average ROI for a laundromat?", answer: "The average laundromat ROI ranges from 20-35% annually, making it one of the highest-returning small business investments. Well-managed stores in good locations can achieve 40%+ ROI through efficient operations and value-added services like wash-dry-fold." },
    { question: "How long does it take to get ROI on a laundromat?", answer: "Most laundromats achieve full return on investment within 3-5 years. Factors affecting payback period include purchase price, location quality (CLEANBI score), equipment efficiency, and operational management." }
  ],
  tpd: [
    { question: "What is TPD in laundromats?", answer: "TPD (Turns Per Day) measures how many times each washing machine is used per day on average. The national average is 5 TPD. High-performing stores achieve 7-8+ TPD, while underperforming stores may see only 1-2 TPD." },
    { question: "How do you calculate turns per day?", answer: "TPD = Total daily machine cycles ÷ Number of machines. For example, if 20 washers complete 100 total cycles in a day, TPD = 100 ÷ 20 = 5 turns per day." }
  ],
  cleanbi: [
    { question: "What is a CLEANBI score?", answer: "CLEANBI is WashBizHub's proprietary 17-factor weighted scoring system for evaluating laundromat locations. Scores range from 0-100, with A (85+) indicating excellent opportunity, B (70-84) good opportunity, C (55-69) fair opportunity, and below 55 needing strategic improvements." },
    { question: "What factors affect CLEANBI score?", answer: "CLEANBI evaluates 17 factors including: Rent as % of Revenue (10%), EBITDA Margin (10%), TPD (10%), Market Saturation (8%), DSCR (8%), plus 12 additional factors covering demographics, competition, traffic, and growth potential." }
  ]
};

export default CalculatorSchema;
