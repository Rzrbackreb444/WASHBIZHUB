import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PremiumHero } from "@/components/PremiumHero";
import { CredibilityBar } from "@/components/CredibilityBar";
import { FeaturedListingsCarousel } from "@/components/FeaturedListingsCarousel";
import { EquipmentCarousel } from "@/components/EquipmentCarousel";
import {
  FeaturesSection,
  TrustSignalsSection,
  TemplatesSection,
  MarketplaceSection,
  FeaturedVendorBanner,
  FinancingSection,
  CalculatorHighlight,
  AnalyzeLocationSection,
  EducationSection,
  ShopSection,
  CommunitySection,
  CTASection,
  PremiumFooter
} from "@/components/PremiumHomeSections";
import { IndustryPulse, IndustryPulseMini } from "@/components/IndustryPulse";
import { JourneyProgress } from "@/components/JourneyProgress";
import { DealScout, DealScoutBanner } from "@/components/DealScout";
import { FoundingMemberBanner } from "@/components/FoundingMember";
import { HomeSkeleton } from "@/components/Skeletons";
import { HomepageNewsletter } from "@/components/HomepageNewsletter";
import { TrustSignals } from "@/components/TrustSignals";
import { CombinedPartnershipSection } from "@/components/PartnershipBanners";
import { 
  Lightbulb, Target, Settings, Users, ArrowRight, 
  Sparkles, CheckCircle, Star, Quote,
  X, DollarSign, AlertTriangle, Calculator, Flame, TrendingUp,
  MapPin, Shield, Zap, FileText
} from "lucide-react";

// Testimonials data
const testimonials = [
  {
    quote: "CLEANBI saved me from a $180K mistake. The location I was about to buy scored a 42 - turns out there were 6 competitors within 2 miles I didn't know about.",
    name: "Mike R.",
    location: "Dallas, TX",
    dealSize: "$180K saved"
  },
  {
    quote: "I've bought 3 laundromats using WashBizHub. The scoring system is scary accurate - my highest scoring location is now my best performer.",
    name: "Sarah L.",
    location: "Phoenix, AZ", 
    dealSize: "3 locations"
  },
  {
    quote: "As a broker, I use CLEANBI for every listing. It gives my buyers confidence and speeds up deals. Worth every penny of the Pro subscription.",
    name: "James T.",
    location: "Atlanta, GA",
    dealSize: "12 deals closed"
  }
];

// Hot markets data (anonymized insights)
const hotMarkets = [
  { city: "Austin, TX", score: 87, trend: "up", insight: "Tech boom driving apartment demand" },
  { city: "Tampa, FL", score: 84, trend: "up", insight: "Population growth + aging laundromats" },
  { city: "Denver, CO", score: 82, trend: "up", insight: "High renter density, low saturation" },
  { city: "Nashville, TN", score: 79, trend: "up", insight: "Rapid expansion, underserved areas" },
  { city: "Charlotte, NC", score: 78, trend: "up", insight: "Growing suburbs, new construction" }
];

const journeyPaths = [
  {
    id: "plan",
    icon: Lightbulb,
    headline: "First-Time Buyer?",
    description: "Avoid the $200K mistakes new owners make",
    features: ["ROI Calculator", "Funding Options", "Due Diligence Guides"],
    link: "/startup-funding",
    color: "blue"
  },
  {
    id: "evaluate",
    icon: Target,
    headline: "Evaluating a Deal?",
    description: "Know if the asking price is fair before you sign",
    features: ["CLEANBI Location Score", "Instant Valuations", "Deal Listings"],
    link: "/laundromat-listings",
    color: "green"
  },
  {
    id: "operate",
    icon: Settings,
    headline: "Current Owner?",
    description: "Boost your revenue by 20-30% with proven tools",
    features: ["AI Diagnostics", "Design Studio", "Equipment Deals"],
    link: "/equipment-marketplace",
    color: "orange"
  },
  {
    id: "partner",
    icon: Users,
    headline: "Vendor or Broker?",
    description: "Get in front of 72,000+ serious buyers",
    features: ["List Products", "Premium Ads", "Affiliate Program"],
    link: "/directory",
    color: "purple"
  }
];

const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  blue: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" },
  green: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" },
  orange: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500", hover: "hover:border-amber-500/40" },
  purple: { bg: "bg-accent/10", border: "border-accent/20", text: "text-accent", hover: "hover:border-accent/40" }
};

const stats = [
  { value: "72,000+", label: "Industry Professionals" },
  { value: "220+", label: "Countries Covered" },
  { value: "50+", label: "Business Tools" },
  { value: "4.9", label: "User Rating", icon: Star }
];

interface JourneyPath {
  id: string;
  icon: React.ElementType;
  headline: string;
  description: string;
  features: string[];
  link: string;
  color: string;
}

interface ColorClass {
  bg: string;
  border: string;
  text: string;
  hover: string;
}

function JourneyCards({ journeyPaths, colorClasses }: { journeyPaths: JourneyPath[]; colorClasses: Record<string, ColorClass> }) {
  const [, setLocation] = useLocation();
  
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
      {journeyPaths.map((path) => {
        const Icon = path.icon;
        const colors = colorClasses[path.color];
        return (
          <Card 
            key={path.id}
            onClick={() => setLocation(path.link)}
            className={`p-6 h-full border-2 ${colors.border} ${colors.hover} hover-elevate transition-all cursor-pointer group bg-white`}
            data-testid={`card-journey-${path.id}`}
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
              <Icon className={`h-6 w-6 ${colors.text}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {path.headline}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {path.description}
            </p>
            <ul className="space-y-2 mb-4">
              {path.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                  {feature}
                </li>
              ))}
            </ul>
            <div className={`flex items-center ${colors.text} text-sm font-semibold group-hover:translate-x-1 transition-transform`}>
              Explore
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [dealCalcPrice, setDealCalcPrice] = useState("");
  const [dealCalcRevenue, setDealCalcRevenue] = useState("");
  const [dealCalcResult, setDealCalcResult] = useState<{ verdict: string; color: string; multiple: number } | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <HomeSkeleton data-testid="home-loading" />;
  }

  // Deal risk calculator logic
  const calculateDealRisk = () => {
    const price = parseFloat(dealCalcPrice.replace(/[^0-9.]/g, ""));
    const revenue = parseFloat(dealCalcRevenue.replace(/[^0-9.]/g, ""));
    if (!price || !revenue) return;
    
    const multiple = price / revenue;
    let verdict = "";
    let color = "";
    
    if (multiple <= 2.0) {
      verdict = "Great Deal - Below market value";
      color = "text-green-500";
    } else if (multiple <= 3.0) {
      verdict = "Fair Price - At market value";
      color = "text-amber-500";
    } else if (multiple <= 4.0) {
      verdict = "Premium Price - Negotiate down";
      color = "text-orange-500";
    } else {
      verdict = "Overpriced - Walk away or negotiate hard";
      color = "text-red-500";
    }
    
    setDealCalcResult({ verdict, color, multiple });
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";
  const currentYear = new Date().getFullYear();
  
  // ==================== MULTI-KEYPHRASE SEO STRATEGY ====================
  // PRIMARY KEYPHRASES: laundromat for sale, buy a laundromat, laundromat business
  // SECONDARY: laundromat valuation, laundromat investment, laundromat ROI, coin laundry
  // LONG-TAIL: how to buy a laundromat, laundromat due diligence, laundromat location analysis
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WashBizHub",
    "alternateName": [
      "The #1 Laundromat Resource Hub",
      "CLEANBI Location Intelligence", 
      "Laundromat Business Resources",
      "Laundromat For Sale Marketplace",
      "Coin Laundry Business Platform"
    ],
    "url": baseUrl,
    "description": "Find laundromats for sale, get instant valuations, analyze locations with CLEANBI scoring. The #1 platform for buying, selling, and operating laundromat businesses. 72,000+ professionals, 50+ calculators, AI-powered tools.",
    "inLanguage": "en-US",
    "copyrightYear": currentYear,
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "logo": { "@type": "ImageObject", "url": `${baseUrl}/washbizhub-logo.png`, "width": 512, "height": 512 }
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${baseUrl}/cleanbi-explorer?address={search_term_string}` },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${baseUrl}/laundromat-listings?q={search_term_string}` },
        "query-input": "required name=search_term_string"
      }
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WashBizHub",
    "legalName": "WashBizHub LLC",
    "url": baseUrl,
    "logo": `${baseUrl}/washbizhub-logo.png`,
    "description": "The #1 laundromat business resource hub. Find laundromats for sale, calculate ROI, analyze locations, get valuations. Serving 72,000+ laundromat owners, investors, and operators worldwide.",
    "foundingDate": "2024",
    "numberOfEmployees": { "@type": "QuantitativeValue", "value": "10-50" },
    "slogan": "The #1 Laundromat Resource Hub - Buy, Sell, Operate Smarter",
    "areaServed": { "@type": "Place", "name": "Worldwide" },
    "knowsAbout": [
      "laundromat for sale",
      "how to buy a laundromat",
      "laundromat business",
      "laundromat valuation",
      "laundromat investment",
      "laundromat ROI calculator",
      "coin laundry business",
      "laundromat due diligence",
      "laundromat location analysis",
      "commercial laundry equipment",
      "self-service laundry",
      "laundromat startup costs",
      "laundromat management software"
    ],
    "sameAs": [
      "https://www.facebook.com/washbizhub1",
      "https://twitter.com/washbizhub",
      "https://www.linkedin.com/company/washbizhub",
      "https://www.youtube.com/@washbizhub"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@washbizhub.com",
      "availableLanguage": ["English"]
    }
  };

  // SoftwareApplication schema for CLEANBI with enhanced location analysis features
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CLEANBI Location Intelligence",
    "alternateName": ["CLEANBI Location Score", "CLEANBI Analyzer", "Laundromat Location Analysis Tool"],
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Location Intelligence",
    "operatingSystem": "Web Browser",
    "description": "AI-powered laundromat location analysis and scoring system. Analyze any address worldwide for laundromat business potential using our proprietary 17-factor algorithm covering demographics, competition density, foot traffic patterns, rental density, household income, and more.",
    "url": `${baseUrl}/cleanbi-explorer`,
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "699",
      "priceCurrency": "USD",
      "offerCount": "4"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2847",
      "bestRating": "5"
    },
    "featureList": [
      "Location scoring (0-100 CLEANBI grade)",
      "Competition density mapping within 2-mile radius",
      "Foot traffic pattern analysis",
      "Demographics insights (population, age, income)",
      "Rental density and renter percentage data",
      "Market saturation analysis",
      "Walk score and transit score integration",
      "Household income analysis",
      "Population density metrics",
      "Competitor proximity mapping",
      "Utility cost estimation",
      "Real estate market data"
    ]
  };

  // Service schema for Location Analysis - targets "location analysis" keyphrases
  const locationAnalysisServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Location Analysis",
    "name": "Laundromat Location Analysis Service",
    "alternateName": ["Site Analysis", "Location Intelligence", "Market Analysis"],
    "description": "Professional location analysis for laundromat businesses. Our CLEANBI system evaluates 17 key factors including demographics, competition, foot traffic, and market potential to help investors make data-driven site selection decisions.",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub"
    },
    "areaServed": {
      "@type": "Place",
      "name": "United States and Worldwide"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Location Analysis Plans",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Free CLEANBI Analysis" },
          "price": "0",
          "priceCurrency": "USD",
          "description": "3 free lifetime location analyses per account"
        },
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Starter Location Analysis" },
          "price": "29",
          "priceCurrency": "USD",
          "description": "Unlimited analyses with walk/transit scores"
        },
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Pro Location Analysis" },
          "price": "99",
          "priceCurrency": "USD",
          "description": "Full analysis with catchment area and utility costs"
        }
      ]
    }
  };

  // Service schema for Foot Traffic Analysis
  const footTrafficServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Foot Traffic Analysis",
    "name": "Laundromat Foot Traffic Analysis",
    "description": "Analyze pedestrian and vehicle traffic patterns around potential laundromat locations. Our system evaluates accessibility, parking availability, nearby anchor tenants, and rush hour patterns to predict customer flow and revenue potential.",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub"
    },
    "areaServed": "United States",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `${baseUrl}/cleanbi-explorer`,
      "serviceType": "Online"
    }
  };

  // Service schema for Competition Analysis
  const competitionAnalysisServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Competition Analysis",
    "name": "Laundromat Competition Mapping",
    "alternateName": ["Competitor Analysis", "Market Saturation Analysis"],
    "description": "Comprehensive competition analysis for laundromat investors. Map all competitors within a 2-mile radius, analyze market saturation, identify underserved areas, and calculate competitive advantage scores. Essential for site selection and due diligence.",
    "provider": {
      "@type": "Organization",
      "name": "WashBizHub"
    },
    "areaServed": "Worldwide",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `${baseUrl}/cleanbi-explorer`,
      "serviceType": "Online"
    }
  };

  // Dataset schema for CLEANBI market benchmarks
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "CLEANBI Laundromat Market Benchmarks",
    "description": "Comprehensive dataset of laundromat industry benchmarks including location scores, revenue metrics, competition density, and demographic factors. Used for accurate valuations and investment analysis.",
    "creator": {
      "@type": "Organization",
      "name": "WashBizHub"
    },
    "keywords": ["laundromat location data", "coin laundry market analysis", "laundromat industry benchmarks", "commercial laundry statistics"],
    "spatialCoverage": "Worldwide",
    "temporalCoverage": "2024/..",
    "variableMeasured": [
      "CLEANBI Score (0-100)",
      "Demographics Score",
      "Competition Score",
      "Foot Traffic Score",
      "Economic Score",
      "Location Quality Score",
      "Rental Density Percentage",
      "Median Household Income"
    ]
  };

  // Product schema for marketplace
  const marketplaceSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "WashBizHub Laundromat Marketplace",
    "applicationCategory": "BusinessApplication",
    "description": "Browse laundromats for sale across the United States. Connect with sellers, get valuations, and access due diligence tools for buying a laundromat business.",
    "url": `${baseUrl}/laundromat-listings`,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free to browse laundromat listings"
    }
  };

  // ItemList for tools/features
  const toolsListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Laundromat Business Tools",
    "description": "Free and premium tools for laundromat buyers, owners, and investors",
    "numberOfItems": 8,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "CLEANBI Location Score", "url": `${baseUrl}/cleanbi-explorer` },
      { "@type": "ListItem", "position": 2, "name": "Laundromat Valuation Calculator", "url": `${baseUrl}/calculators` },
      { "@type": "ListItem", "position": 3, "name": "Laundromat ROI Calculator", "url": `${baseUrl}/calculators` },
      { "@type": "ListItem", "position": 4, "name": "Laundromats For Sale", "url": `${baseUrl}/laundromat-listings` },
      { "@type": "ListItem", "position": 5, "name": "Due Diligence Checklist", "url": `${baseUrl}/resources` },
      { "@type": "ListItem", "position": 6, "name": "Business Plan Generator", "url": `${baseUrl}/business-plan-generator` },
      { "@type": "ListItem", "position": 7, "name": "Equipment Marketplace", "url": `${baseUrl}/equipment-marketplace` },
      { "@type": "ListItem", "position": 8, "name": "Service Guy AI Diagnostics", "url": `${baseUrl}/service-guy` }
    ]
  };

  // HowTo schema for featured snippets
  const howToBuySchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Buy a Laundromat: Complete Guide",
    "description": "Step-by-step guide to buying your first laundromat business, from finding deals to closing.",
    "totalTime": "PT60D",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "200000-1000000"
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Research the Market",
        "text": "Use CLEANBI to analyze locations and understand laundromat market potential in your target area."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Find Laundromats for Sale",
        "text": "Browse WashBizHub marketplace, BizBuySell, and local brokers for available laundromat listings."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Calculate Valuation & ROI",
        "text": "Use our valuation calculator to determine if the asking price is fair (typically 2.5-4x annual income)."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Perform Due Diligence",
        "text": "Review financials, equipment condition, lease terms, and competition using our due diligence checklist."
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Secure Financing",
        "text": "Explore SBA loans (10-25% down), seller financing, or traditional bank loans for laundromat purchase."
      },
      {
        "@type": "HowToStep",
        "position": 6,
        "name": "Close the Deal",
        "text": "Work with a business attorney to negotiate terms, sign the purchase agreement, and take ownership."
      }
    ]
  };

  const siteNavigationSchema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Main Navigation",
    "hasPart": [
      { "@type": "SiteNavigationElement", "name": "Laundromats For Sale", "url": `${baseUrl}/laundromat-listings` },
      { "@type": "SiteNavigationElement", "name": "CLEANBI Location Score", "url": `${baseUrl}/cleanbi-explorer` },
      { "@type": "SiteNavigationElement", "name": "Laundromat Calculators", "url": `${baseUrl}/calculators` },
      { "@type": "SiteNavigationElement", "name": "Laundromat Blog", "url": `${baseUrl}/blog` },
      { "@type": "SiteNavigationElement", "name": "Laundromat Courses", "url": `${baseUrl}/courses` },
      { "@type": "SiteNavigationElement", "name": "Equipment Marketplace", "url": `${baseUrl}/equipment-marketplace` },
      { "@type": "SiteNavigationElement", "name": "Vendor Directory", "url": `${baseUrl}/directory` },
      { "@type": "SiteNavigationElement", "name": "Pricing", "url": `${baseUrl}/pricing` }
    ]
  };

  // Review/Rating schema for social proof
  const aggregateReviewSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "WashBizHub Platform",
    "description": "Complete laundromat business platform with location analysis, marketplace, calculators, and management tools",
    "brand": { "@type": "Brand", "name": "WashBizHub" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2847",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": testimonials.map((t, idx) => ({
      "@type": "Review",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
      "author": { "@type": "Person", "name": t.name },
      "reviewBody": t.quote
    }))
  };

  // Extended FAQs targeting multiple keyphrases for featured snippets
  const homepageFaqs = [
    {
      question: "How do I find laundromats for sale near me?",
      answer: "WashBizHub's marketplace lists laundromats for sale across all 50 US states. Browse listings by location, price range, and revenue. Each listing includes financials, equipment details, lease terms, and CLEANBI location scores. Get email alerts for new listings in your target areas. We also aggregate listings from BizBuySell, LoopNet, and local brokers."
    },
    {
      question: "How to buy a laundromat: what are the steps?",
      answer: "Buying a laundromat involves 6 key steps: (1) Research the market using CLEANBI location analysis, (2) Find laundromats for sale on marketplaces and through brokers, (3) Calculate valuation using our ROI calculator (fair price is 2.5-4x annual income), (4) Perform due diligence on financials, equipment, and lease, (5) Secure financing through SBA loans or seller financing, (6) Close with a business attorney. WashBizHub provides tools for every step."
    },
    {
      question: "Is a laundromat a good investment?",
      answer: "Laundromats are one of the most profitable small business investments with 20-35% cash-on-cash returns. Benefits include: recession-resistant demand, semi-passive income, simple operations, and strong cash flow. Average laundromats generate $40,000-$500,000+ annual revenue with 15-35% profit margins. Use WashBizHub's ROI calculator to analyze specific opportunities."
    },
    {
      question: "What is a fair price for a laundromat?",
      answer: "Laundromats are valued at 2.5x to 4x annual net operating income (NOI). For example, a laundromat earning $100,000/year in profit is worth $250,000-$400,000. Factors affecting valuation: equipment age and condition, lease terms and rent, location demographics, competition, and growth potential. Premium valuations (3.5-4x+) apply to turnkey operations with newer equipment and favorable leases."
    },
    {
      question: "How much does it cost to start a laundromat?",
      answer: "Starting a laundromat costs $200,000 to $1,000,000+ depending on whether you buy existing or build new. Typical costs: commercial laundry equipment ($100K-$500K), build-out/renovation ($50K-$300K), security deposit and first months rent ($10K-$50K), permits and licenses ($5K-$15K), initial supplies ($5K-$10K), working capital ($20K-$50K). Buying an existing laundromat is often more affordable than building new."
    },
    {
      question: "What is the CLEANBI location score?",
      answer: "CLEANBI is WashBizHub's proprietary location intelligence system that rates any address from 0-100 for business potential. Our 17-factor algorithm analyzes: rental density, household income, competition saturation, traffic patterns, parking availability, demographics, and more. Scores 85+ indicate excellent opportunities, 70-84 good potential, 55-69 fair, and below 55 needs strategic consideration. Free tier includes 5 analyses total."
    },
    {
      question: "What is the average ROI for a laundromat?",
      answer: "Laundromats generate 20-35% average cash-on-cash returns, making them highly profitable investments. Net operating margins typically range 15-35% depending on location, equipment efficiency, and management. Key ROI factors: rent-to-revenue ratio (aim for under 25%), utility costs, labor costs, and equipment maintenance. Use WashBizHub's ROI calculator to model specific deals."
    },
    {
      question: "How do I do due diligence on a laundromat?",
      answer: "Laundromat due diligence covers 5 areas: (1) Financials - verify 3 years of tax returns, utility bills, and bank statements, (2) Equipment - inspect all machines, check age and maintenance records, (3) Lease - review terms, rent escalations, renewal options, (4) Location - analyze with CLEANBI score, check competition, demographics, (5) Operations - observe traffic patterns, talk to customers. WashBizHub's due diligence checklist guides you through the entire process."
    },
    {
      question: "What are the best financing options for buying a laundromat?",
      answer: "Top financing options for laundromats: (1) SBA 7(a) loans - 10-25% down, 10-year terms, competitive rates, (2) SBA 504 loans - for equipment and real estate, (3) Seller financing - negotiate 10-30% down with seller carry, (4) Conventional bank loans - faster closing but higher rates, (5) Equipment financing - for machine upgrades. WashBizHub's Funding Marketplace connects you with 7+ lenders specializing in laundromat financing."
    },
    {
      question: "What laundromat management software does WashBizHub offer?",
      answer: "WashBizHub provides complete laundromat management software: WashBizPOS point-of-sale with dynamic pricing, CLEANBI location intelligence, Service Guy AI for equipment diagnostics, 2D Design Studio for floor planning, 50+ business calculators, IoT machine monitoring, route optimization for pickup/delivery, and marketing tools. Plans start at $29/month with a 14-day free trial."
    },
    {
      question: "How much do laundromat owners make?",
      answer: "Laundromat owner income varies by size and location: small laundromats ($5K-$15K/month profit), medium ($15K-$40K/month), large multi-store operations ($50K-$150K+/month). Semi-absentee owners typically net $40,000-$100,000/year from a single location. Factors affecting income: location quality (use CLEANBI to analyze), equipment efficiency, pricing strategy, and operating costs."
    },
    {
      question: "What makes a good location for a laundromat?",
      answer: "The best laundromat locations have: high renter population (renters use laundromats 5x more than homeowners), visible storefront with good signage, ample parking (1 space per 2 machines minimum), low competition (check 2-mile radius), moderate household income ($25K-$75K ideal), and anchor tenants nearby (grocery stores, dollar stores). CLEANBI scores analyze all 17 location factors automatically."
    },
    {
      question: "How does CLEANBI analyze foot traffic for laundromats?",
      answer: "CLEANBI's foot traffic analysis evaluates multiple factors: nearby anchor retailers that drive pedestrian flow (grocery stores, dollar stores, fast food), street visibility and signage potential, parking accessibility, public transit proximity (walk score and transit score), and peak hour traffic patterns. High foot traffic scores indicate locations where customers naturally pass by, reducing marketing costs and increasing walk-in business."
    },
    {
      question: "How does CLEANBI measure competition for laundromats?",
      answer: "CLEANBI's competition analysis maps all laundromats within a 2-mile radius and calculates market saturation. We analyze: number of competitors, their proximity to the target location, estimated capacity based on store size, and market share potential. A low competition score (7+) indicates an underserved market with room for a new or expanded laundromat operation."
    },
    {
      question: "What demographics matter most for laundromat location analysis?",
      answer: "Key demographics for laundromat success: (1) Rental density - areas with 40%+ renters have 5x higher laundromat usage, (2) Population density - minimum 20,000 people within 2 miles, (3) Median household income - sweet spot is $25K-$75K, (4) Age distribution - young adults and families drive usage, (5) Apartment density - multi-family housing concentrations. CLEANBI analyzes all these factors and weights them for an accurate location score."
    },
    {
      question: "What is location intelligence for laundromat businesses?",
      answer: "Location intelligence combines demographic data, competition mapping, foot traffic analysis, and economic indicators to predict business success at any address. WashBizHub's CLEANBI system is the industry's leading location intelligence tool for laundromats, analyzing 17 factors to generate an investment-grade score (0-100). This data-driven approach helps investors avoid poor locations and identify underserved markets with high profit potential."
    }
  ];

  // Combine all structured data for comprehensive SEO coverage
  // Includes location analysis, foot traffic, competition schemas for optimal indexing
  const structuredData = [
    websiteSchema, 
    organizationSchema, 
    siteNavigationSchema,
    softwareSchema,
    locationAnalysisServiceSchema,
    footTrafficServiceSchema,
    competitionAnalysisServiceSchema,
    datasetSchema,
    marketplaceSchema,
    toolsListSchema,
    howToBuySchema,
    aggregateReviewSchema
  ];
  
  return (
    <>
      <SEO
        title="Laundromat For Sale | Buy a Laundromat | WashBizHub - #1 Laundromat Business Platform"
        description="Find laundromats for sale, calculate ROI & valuations, analyze locations with CLEANBI scoring. The #1 platform for buying, selling & operating laundromats. 72,000+ professionals. Free tools."
        canonicalUrl="/"
        ogType="website"
        keywords={[
          // PRIMARY KEYPHRASES (high commercial intent)
          "laundromat for sale",
          "buy a laundromat",
          "laundromats for sale near me",
          "laundromat business for sale",
          
          // SECONDARY KEYPHRASES
          "laundromat business",
          "laundromat valuation",
          "laundromat investment",
          "laundromat ROI calculator",
          "coin laundry for sale",
          "coin laundry business",
          
          // LONG-TAIL KEYPHRASES
          "how to buy a laundromat",
          "is a laundromat a good investment",
          "laundromat due diligence checklist",
          "laundromat location analysis",
          "laundromat startup costs",
          "how much does a laundromat cost",
          "laundromat profit margins",
          "best locations for laundromat",
          
          // LOCATION ANALYSIS KEYPHRASES
          "laundromat site selection",
          "laundromat foot traffic analysis",
          "laundromat competition analysis",
          "laundromat demographics analysis",
          "location intelligence laundromat",
          "laundromat market analysis",
          "laundromat competitor mapping",
          "rental density laundromat",
          "walk score laundromat location",
          
          // LSI/SEMANTIC KEYWORDS
          "self service laundry business",
          "commercial laundry equipment",
          "laundromat management software",
          "laundromat business plan",
          "laundromat financing options",
          "SBA loan laundromat",
          "laundromat owner income",
          "laundry business opportunity",
          
          // BRANDED TERMS
          "CLEANBI location score",
          "CLEANBI location intelligence",
          "WashBizHub marketplace",
          "laundromat calculators",
          "laundromat industry resources"
        ]}
        structuredData={structuredData}
        faqs={homepageFaqs}
        speakableSelectors={[
          "h1", 
          "h2", 
          ".speakable", 
          "[data-testid='text-choose-path-heading']",
          "[data-testid='section-testimonials'] h2"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" }
        ]}
        dateModified={new Date().toISOString().split('T')[0]}
      />
      
      <div className="min-h-screen bg-white">
        {/* PREMIUM HERO - With hero image background */}
        <PremiumHero />
        
        {/* CREDIBILITY BAR - Trust signals below hero */}
        <CredibilityBar />
        
        {/* CHOOSE YOUR PATH - Journey tiles for different user types */}
        <section className="py-16 md:py-20 bg-white" data-testid="section-journey-paths">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-3">
                What Brings You Here Today?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Pick your path - we'll show you exactly what you need
              </p>
            </div>

            <JourneyCards journeyPaths={journeyPaths} colorClasses={colorClasses} />
          </div>
        </section>
        
        {/* FEATURED LISTINGS CAROUSEL - Real verified listings */}
        <FeaturedListingsCarousel />
        
        {/* EQUIPMENT MARKETPLACE CAROUSEL - Buy & Sell Equipment */}
        <EquipmentCarousel showListCTA={true} />
        
        {/* EXPERT SERVICES FUNNEL - AI Council → Larry → Funding */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-background via-muted/60 to-background dark:from-background dark:via-muted/40 dark:to-background" data-testid="section-expert-services">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4" data-testid="badge-expert-services">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Premium Expert Services
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3" data-testid="text-expert-heading">
                Get Expert Guidance at Every Step
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-expert-subheading">
                From AI-powered analysis to 1-on-1 consulting with industry veterans
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* AI Consultation Council */}
              <Card className="p-6 border-2 border-border hover:border-primary/50 hover-elevate transition-all bg-card" data-testid="card-expert-ai-council">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <Badge className="mb-3 bg-primary/10 text-primary" data-testid="badge-ai-council-price">From $49</Badge>
                <h3 className="text-lg font-bold text-foreground mb-2" data-testid="text-ai-council-title">AI Consultation Council</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get multi-AI analysis from 5 expert perspectives on any deal or location
                </p>
                <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2" data-testid="text-feature-ai-1">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    5 AI experts analyze your opportunity
                  </li>
                  <li className="flex items-center gap-2" data-testid="text-feature-ai-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Detailed due diligence report
                  </li>
                  <li className="flex items-center gap-2" data-testid="text-feature-ai-3">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Risk assessment & recommendations
                  </li>
                </ul>
                <Link href="/ai-consultation-council">
                  <Button variant="default" className="w-full" data-testid="button-ai-council-home">
                    Get AI Council Analysis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
              
              {/* Larry Larsen Consulting */}
              <Card className="p-6 border-2 border-border hover:border-accent/50 hover-elevate transition-all bg-card relative overflow-visible" data-testid="card-expert-larry">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="font-bold" data-testid="badge-larry-featured">Featured</Badge>
                </div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Star className="h-6 w-6 text-accent-foreground" />
                </div>
                <Badge variant="outline" className="mb-3" data-testid="badge-larry-price">$397/session</Badge>
                <h3 className="text-lg font-bold text-foreground mb-2" data-testid="text-larry-title">Talk to Larry Larsen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  50+ years experience. The most trusted name in laundromat consulting.
                </p>
                <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2" data-testid="text-feature-larry-1">
                    <CheckCircle className="w-4 h-4 text-accent-foreground" />
                    1 on 1 consultation
                  </li>
                  <li className="flex items-center gap-2" data-testid="text-feature-larry-2">
                    <CheckCircle className="w-4 h-4 text-accent-foreground" />
                    Due diligence review
                  </li>
                  <li className="flex items-center gap-2" data-testid="text-feature-larry-3">
                    <CheckCircle className="w-4 h-4 text-accent-foreground" />
                    Personalized recommendations
                  </li>
                </ul>
                <Link href="/larry-larsen">
                  <Button variant="secondary" className="w-full" data-testid="button-larry-home">
                    Book with Larry
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
              
              {/* Funding Hub */}
              <Card className="p-6 border-2 border-border hover:border-primary/50 hover-elevate transition-all bg-card" data-testid="card-expert-funding">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <Badge className="mb-3 bg-primary/10 text-primary" data-testid="badge-funding-type">Pre-Qualified</Badge>
                <h3 className="text-lg font-bold text-foreground mb-2" data-testid="text-funding-title">Funding Partners Hub</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with pre-vetted lenders ready to fund your laundromat deal
                </p>
                <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2" data-testid="text-feature-funding-1">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    SBA 7(a) & 504 loans
                  </li>
                  <li className="flex items-center gap-2" data-testid="text-feature-funding-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Equipment financing
                  </li>
                  <li className="flex items-center gap-2" data-testid="text-feature-funding-3">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Investor matching
                  </li>
                </ul>
                <Link href="/funding">
                  <Button variant="default" className="w-full" data-testid="button-funding-home">
                    Explore Funding Options
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            </div>
            
            {/* Funnel Journey Indicator */}
            <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400" data-testid="funnel-journey-indicator">
              <div className="flex items-center gap-2" data-testid="step-cleanbi">
                <div className="w-8 h-8 rounded-full bg-[#b8860b] text-white flex items-center justify-center font-bold">1</div>
                <span>Analyze with CLEANBI</span>
              </div>
              <ArrowRight className="w-4 h-4 hidden md:block" />
              <div className="flex items-center gap-2" data-testid="step-council">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                <span>Get AI Council Review</span>
              </div>
              <ArrowRight className="w-4 h-4 hidden md:block" />
              <div className="flex items-center gap-2" data-testid="step-larry">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold">3</div>
                <span>Consult with Larry</span>
              </div>
              <ArrowRight className="w-4 h-4 hidden md:block" />
              <div className="flex items-center gap-2" data-testid="step-funding">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">4</div>
                <span>Secure Funding</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* PARTNERSHIP SECTION - Funding & Equipment Partners */}
        <CombinedPartnershipSection />
        
        {/* CTA SECTION - Final conversion */}
        <CTASection />
        
        {/* PREMIUM FOOTER */}
        <PremiumFooter />

        {/* TESTIMONIALS - Social proof with real results */}
        <section className="py-16 bg-gray-50 hidden" data-testid="section-testimonials">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
                Real Results from Real Investors
              </h2>
              <p className="text-gray-600">See why 72,000+ professionals trust WashBizHub</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="p-6 bg-white border border-gray-200" data-testid={`testimonial-${idx}`}>
                  <Quote className="w-8 h-8 text-gray-300 mb-4" />
                  <p className="text-gray-900 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      {testimonial.dealSize}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRY PULSE & DEAL SCOUT - Hidden for now, using premium layout */}
        <section className="py-16 bg-gray-50 border-t border-b border-gray-200 hidden" data-testid="section-engagement">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Live Intelligence
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Real-Time Market Insights
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Stay ahead with live industry data and AI-powered deal discovery
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <IndustryPulse />
              <DealScout />
            </div>
            
            <div className="mt-8 flex justify-center">
              <IndustryPulseMini />
            </div>
          </div>
        </section>

        {/* CHOOSE YOUR PATH - Hidden for now, using premium layout */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 hidden" data-testid="section-choose-path">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Your Next Step
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-choose-path-heading">
                What Brings You Here Today?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Pick your situation - we'll show you exactly what you need
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {journeyPaths.map((path) => {
                const Icon = path.icon;
                const colors = colorClasses[path.color];
                return (
                  <Link key={path.id} href={path.link}>
                    <Card 
                      className={`p-6 h-full border-2 ${colors.border} ${colors.hover} hover-elevate transition-all cursor-pointer group bg-card`}
                      data-testid={`card-path-${path.id}`}
                    >
                      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2" data-testid={`text-path-title-${path.id}`}>
                        {path.headline}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {path.description}
                      </p>
                      <ul className="space-y-2 mb-5">
                        {path.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className={`w-4 h-4 ${colors.text} flex-shrink-0`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className={`flex items-center ${colors.text} text-sm font-semibold group-hover:translate-x-1 transition-transform`}>
                        Explore
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* DEAL RISK CALCULATOR - Hidden, using premium layout */}
        <section className="py-16 bg-muted/20 hidden" data-testid="section-deal-calculator">
          <div className="max-w-2xl mx-auto px-6 lg:px-8">
            <Card className="p-6 md:p-8 bg-card border-2 border-accent/30">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-foreground">Quick Deal Check</h3>
              </div>
              <p className="text-muted-foreground text-center mb-6">
                Is the asking price reasonable? Find out in 10 seconds.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Asking Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="350,000"
                      value={dealCalcPrice}
                      onChange={(e) => setDealCalcPrice(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-accent"
                      data-testid="input-deal-price"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Annual Gross Revenue</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="120,000"
                      value={dealCalcRevenue}
                      onChange={(e) => setDealCalcRevenue(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-accent"
                      data-testid="input-deal-revenue"
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={calculateDealRisk} 
                className="w-full mb-4"
                data-testid="button-calculate-deal"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Check This Deal
              </Button>
              
              {dealCalcResult && (
                <div className="p-4 rounded-lg bg-muted/50 text-center" data-testid="deal-result">
                  <p className="text-sm text-muted-foreground mb-1">
                    Price-to-Revenue Multiple: <span className="font-bold text-foreground">{dealCalcResult.multiple.toFixed(1)}x</span>
                  </p>
                  <p className={`font-semibold ${dealCalcResult.color}`}>{dealCalcResult.verdict}</p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Based on industry-standard valuation multiples. For a complete analysis, use our full valuation calculator.
              </p>
            </Card>
          </div>
        </section>

        {/* 4. VALUE LADDER - Hidden, using premium layout */}
        <section className="py-16 bg-muted/30 border-t border-border/50 hidden" data-testid="section-value-ladder">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Start Free, Upgrade as You Grow
              </h2>
              <p className="text-muted-foreground">
                From free tools to enterprise solutions - pay only for what you need
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 border border-border/50 bg-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Free</div>
                  <div className="text-3xl font-bold text-accent mt-1">$0</div>
                  <p className="text-sm text-muted-foreground mt-2">5 CLEANBI total, basic tools</p>
                  <Link href="/subscribe">
                    <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-free-tier">
                      Get Started
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">45,000+ users</p>
                </div>
              </Card>
              
              <Card className="p-5 border-2 border-accent/30 bg-card relative">
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs">
                  Most Popular
                </Badge>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Starter</div>
                  <div className="text-3xl font-bold text-accent mt-1">$29<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground mt-2">Unlimited CLEANBI, 3D views</p>
                  <Link href="/pricing">
                    <Button size="sm" className="mt-4 w-full" data-testid="button-starter-tier">
                      View Details
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">12,400+ active</p>
                </div>
              </Card>
              
              <Card className="p-5 border border-border/50 bg-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Pro</div>
                  <div className="text-3xl font-bold text-accent mt-1">$99<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground mt-2">AI insights, bulk analysis</p>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-pro-tier">
                      View Details
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">8,200+ active</p>
                </div>
              </Card>
              
              <Card className="p-5 border border-border/50 bg-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Enterprise</div>
                  <div className="text-3xl font-bold text-accent mt-1">$699<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground mt-2">API access, white-label</p>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="mt-4 w-full" data-testid="button-enterprise-tier">
                      View Details
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">320+ businesses</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* NEWSLETTER SECTION - Email capture with benefits */}
        <HomepageNewsletter source="homepage" />
        
        {/* TRUST SIGNALS - Testimonials */}
        <section className="py-16 md:py-20 bg-muted/30" data-testid="section-homepage-testimonials">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <TrustSignals variant="testimonials" showTitle />
          </div>
        </section>

        {/* HOT MARKETS CAROUSEL - Hidden, using premium layout */}
        <section className="py-12 bg-background border-t border-border/50 hidden" data-testid="section-hot-markets">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-bold text-foreground">Hot Markets This Week</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {hotMarkets.map((market, idx) => (
                <Card 
                  key={idx} 
                  className="flex-shrink-0 w-64 p-4 bg-card border border-border/50 snap-start"
                  data-testid={`hot-market-${idx}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{market.city}</span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      {market.score}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{market.insight}</p>
                  <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>Trending</span>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Based on aggregate CLEANBI scores and search volume. Updated weekly.
            </p>
          </div>
        </section>

        {/* PARTNER LOGOS / AS SEEN IN - Hidden, using premium layout */}
        <section className="py-10 bg-muted/20 hidden" data-testid="section-partner-logos">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <p className="text-center text-sm text-muted-foreground mb-6">Trusted by industry leaders</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">SB</div>
                <span className="text-sm font-medium">Speed Queen</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">CD</div>
                <span className="text-sm font-medium">CoinDry</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">LO</div>
                <span className="text-sm font-medium">LaundryOwner</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">CL</div>
                <span className="text-sm font-medium">CLA</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold text-sm">PD</div>
                <span className="text-sm font-medium">PayDry</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SINGLE SPOTLIGHT CTA - Hidden, using premium layout */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-muted/20 to-background border-t border-border/50 hidden" data-testid="section-spotlight-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Trusted by 72,000+ Professionals
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Stop Guessing. Start Knowing.
            </h2>
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              Our proprietary algorithm crunches 17 weighted factors into one clear score. 
              Know if a location is worth it in 30 seconds - not 30 hours.
            </p>
            <p className="text-sm text-accent mb-10 italic">
              Developed by laundromat veterans with 50+ years combined experience
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/cleanbi-explorer">
                <Button size="lg" className="w-full sm:w-auto px-8 font-semibold" data-testid="button-try-cleanbi">
                  <Zap className="w-5 h-5 mr-2" />
                  Get Your Free Score
                </Button>
              </Link>
              <Link href="/cleanbi-explorer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" data-testid="button-explore-map">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore the Map
                </Button>
              </Link>
            </div>

            {/* Key benefits */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Spot Winners Fast</span>
                <span className="text-xs text-muted-foreground">Industry-calibrated scoring</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Avoid Bad Deals</span>
                <span className="text-xs text-muted-foreground">See red flags instantly</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Negotiate Smarter</span>
                <span className="text-xs text-muted-foreground">Data backs your offer</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SIMPLE FOOTER CTA - Hidden, using premium layout */}
        <section className="py-16 bg-primary text-primary-foreground hidden" data-testid="section-footer-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Your Next Laundromat Shouldn't Be a Gamble
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              72,000+ owners and investors trust WashBizHub to find winning locations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cleanbi-explorer">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 font-semibold" data-testid="button-get-started">
                  Score a Location Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-talk-expert">
                  See All Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* STICKY MOBILE CTA - Hidden for premium layout */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border md:hidden z-50 hidden" data-testid="sticky-mobile-cta">
        <Link href="/cleanbi-explorer">
          <Button className="w-full font-semibold" size="lg" data-testid="button-sticky-cta">
            <Zap className="w-5 h-5 mr-2" />
            Score a Location Free
          </Button>
        </Link>
      </div>
    </>
  );
}
