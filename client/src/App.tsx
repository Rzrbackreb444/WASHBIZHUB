import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { LocationDesignProvider } from "@/contexts/LocationDesignContext";
import { PersonaProvider } from "@/contexts/PersonaContext";
import { AuthModalProvider } from "@/components/AuthModal";
import { SignOutConfirmationProvider } from "@/components/SignOutConfirmation";
import { NavigationMenu } from "@/components/NavigationMenu";
import { PersonaHeader } from "@/components/PersonaHeader";
import { Footer } from "@/components/Footer";
import { DeferredAIChatWidget } from "@/components/DeferredAIChatWidget";
import { FloatingFeedbackButton } from "@/components/FloatingFeedbackButton";
import { usePageTracking } from "@/components/Analytics";
import { useAuth } from "@/hooks/useAuth";
import { LoadingFallback, FullPageLoadingFallback } from "@/components/LoadingFallback";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import AdminBar from "@/components/AdminBar";
import { TrialBanner } from "@/components/monetization";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { StickyUpgradeBanner } from "@/components/StickyUpgradeBanner";
import { FloatingCTA } from "@/components/EmailCaptureModal";
import { LiveActivityNotification } from "@/components/ConversionOptimization";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  
  return null;
}

// Lazy load analytics to defer non-critical tracking scripts
const DeferredAnalytics = lazy(() => import("@/components/DeferredAnalytics"));

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "WashBizHub",
  "alternateName": "The Laundromat Bible",
  "url": "https://washbizhub.com",
  "logo": "https://washbizhub.com/logo.png",
  "description": "The #1 laundromat resource and educational hub. AI-powered tools, professional calculators, courses, equipment marketplace, and expert consulting for laundromat owners, investors, and operators.",
  "foundingDate": "2024",
  "sameAs": [
    "https://facebook.com/groups/thelaundromat",
    "https://twitter.com/washbizhub",
    "https://linkedin.com/company/washbizhub"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "consult@washbizhub.com",
    "availableLanguage": ["English"]
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "499",
    "offerCount": "50+"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "WashBizHub",
  "url": "https://washbizhub.com",
  "description": "The #1 laundromat resource hub with AI-powered tools, 50+ calculators, courses, marketplace, and expert consulting.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://washbizhub.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CLEANBI",
  "alternateName": ["CLEANBI Location Analyzer", "Laundromat Location Intelligence Tool"],
  "description": "AI-powered laundromat location analysis tool that scores any address for laundromat viability using demographics, competition, foot traffic, and market data. Get instant insights for investment decisions.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "url": "https://washbizhub.com/cleanbi",
  "featureList": [
    "Location viability scoring (0-100)",
    "Demographic analysis within radius",
    "Competition mapping and density",
    "Foot traffic estimation",
    "Income and population metrics",
    "Investment risk assessment",
    "PDF report generation",
    "Multi-location comparison"
  ],
  "screenshot": [
    "https://washbizhub.com/washbizhub-og-image.png"
  ],
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "499",
    "offerCount": "4",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Tier",
        "price": "0",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer",
        "name": "Pro Monthly",
        "price": "49",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer",
        "name": "Pro Annual",
        "price": "399",
        "priceCurrency": "USD"
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "WashBizHub"
  }
};

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is CLEANBI and how does it work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CLEANBI is WashBizHub's AI-powered location intelligence tool that analyzes any address for laundromat investment viability. It scores locations from 0-100 based on demographics, competition density, foot traffic, income levels, and population data within customizable radius zones. Simply enter an address to get an instant analysis with actionable insights."
      }
    },
    {
      "@type": "Question",
      "name": "How much does a laundromat cost to buy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Laundromat prices vary widely based on location, size, equipment age, and revenue. Small laundromats typically sell for $50,000-$200,000, mid-size operations for $200,000-$500,000, and large profitable locations can exceed $1 million. Use WashBizHub's valuation calculator for accurate estimates based on actual financials."
      }
    },
    {
      "@type": "Question",
      "name": "What ROI can I expect from a laundromat investment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Well-managed laundromats typically generate 20-35% cash-on-cash returns annually. ROI depends on purchase price, operating costs, location demographics, and management efficiency. WashBizHub's ROI calculator helps you model different scenarios with actual expense ratios and revenue projections."
      }
    },
    {
      "@type": "Question",
      "name": "How do I find laundromats for sale near me?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "WashBizHub's marketplace features laundromats for sale across the US with verified listings, financial data, and CLEANBI scores. You can search by location, price range, revenue, and other criteria. We also have broker connections and off-market deal alerts for premium members."
      }
    },
    {
      "@type": "Question",
      "name": "What equipment do I need to start a laundromat?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A typical laundromat needs commercial washers (various sizes from 20-80 lb capacity), dryers, a payment system (coin, card, or app-based), folding tables, seating, and utility infrastructure. Equipment costs range from $100,000-$500,000+ depending on size. Use our equipment mix optimizer and distributor locator to plan your setup."
      }
    }
  ]
};

// ============================================================================
// STATIC IMPORTS - Only absolute critical path (minimal main bundle)
// ============================================================================
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// ============================================================================
// LAZY IMPORTS - SEO pages (still indexable, but code-split)
// ============================================================================
const CleanBI = lazy(() => import("@/pages/cleanbi"));
const CLEANBIMethodology = lazy(() => import("@/pages/cleanbi-methodology"));
const Pricing = lazy(() => import("@/pages/pricing"));
const EnterprisePricing = lazy(() => import("@/pages/enterprise-pricing"));
const EnterpriseBranding = lazy(() => import("@/pages/enterprise-branding"));
const EnterpriseOnboarding = lazy(() => import("@/pages/enterprise-onboarding"));
const SingleAnalysis = lazy(() => import("@/pages/single-analysis"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const CoursesHub = lazy(() => import("@/pages/courses-hub"));
const Academy = lazy(() => import("@/pages/academy"));
const ForensicAcademy = lazy(() => import("@/pages/forensic-academy"));
const AboutUs = lazy(() => import("@/pages/about-us"));
const WhyWashBizHub = lazy(() => import("@/pages/why-washbizhub"));

// ============================================================================
// LAZY IMPORTS - Code split by feature area for optimal chunking
// ============================================================================

// Design Studio / 3D Features (heavy Three.js dependencies)
const DesignStudio = lazy(() => import("@/pages/design-studio"));
const DesignStudioPro = lazy(() => import("@/pages/design-studio-pro"));

// POS Command Center (large dashboard)
const POSCommandCenter = lazy(() => import("@/pages/pos-command-center"));
const PosSuite = lazy(() => import("@/pages/pos-suite"));
const PosLanding = lazy(() => import("@/pages/landing/pos-landing"));
const MarketingLoyalty = lazy(() => import("@/pages/marketing-loyalty"));
const QRGenerator = lazy(() => import("@/pages/qr-generator"));

// IoT Dashboard (machine monitoring & dynamic pricing)
const IoTDashboard = lazy(() => import("@/pages/iot-dashboard"));

// Machine Booking System
const Bookings = lazy(() => import("@/pages/bookings"));
const BookingManagement = lazy(() => import("@/pages/booking-management"));

// Admin Pages (authenticated only)
const AdminDashboard = lazy(() => import("@/pages/admin/index"));
const AdminAds = lazy(() => import("@/pages/admin/ads"));
const AdminBlog = lazy(() => import("@/pages/admin/blog"));
const AdminCourses = lazy(() => import("@/pages/admin/courses"));
const AdminResources = lazy(() => import("@/pages/admin/resources"));
const AdminMarketplace = lazy(() => import("@/pages/admin/marketplace"));
const AdminForum = lazy(() => import("@/pages/admin/forum"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const AdminPromoCodes = lazy(() => import("@/pages/admin/promo-codes"));
const AdminFeedbackDashboard = lazy(() => import("@/pages/admin/feedback-dashboard"));
const AdminIndexing = lazy(() => import("@/pages/admin-indexing"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminCommandCenter = lazy(() => import("@/pages/admin-dashboard"));

// AI Features
const AIBlogging = lazy(() => import("@/pages/ai-blogging"));
const SEOOptimizer = lazy(() => import("@/pages/seo-optimizer"));
const AIContentStudio = lazy(() => import("@/pages/ai-content-studio"));
const ServiceGuyAI = lazy(() => import("@/pages/service-guy-ai"));
const FaultClassifier = lazy(() => import("@/pages/fault-classifier"));
const SeoCommandCenter = lazy(() => import("@/pages/seo-command-center"));
const UtilityBillScanner = lazy(() => import("@/pages/utility-bill-scanner"));
const SmartLocationScout = lazy(() => import("@/pages/smart-location-scout"));
const CompetitorIntelligence = lazy(() => import("@/pages/competitor-intelligence"));
const EquipmentAppraiser = lazy(() => import("@/pages/equipment-appraiser"));
const DemographicClusterer = lazy(() => import("@/pages/demographic-clusterer"));
const UtilityLoadForecaster = lazy(() => import("@/pages/utility-load-forecaster"));
const PricingElasticity = lazy(() => import("@/pages/pricing-elasticity"));
const DeliveryRouteOptimizer = lazy(() => import("@/pages/delivery-route-optimizer"));
const MarketingAttribution = lazy(() => import("@/pages/marketing-attribution"));
const AIBookSuite = lazy(() => import("@/pages/ai-book-suite"));
const AICommandCenter = lazy(() => import("@/pages/ai-command-center"));
const BookStudio = lazy(() => import("@/pages/book-studio"));
const AIMediaStudio = lazy(() => import("@/pages/ai-media-studio"));
const ContentEditor = lazy(() => import("@/pages/content-editor"));
const LarrysCommandCenter = lazy(() => import("@/pages/larrys-command-center"));
const LarrysContentEmpire = lazy(() => import("@/pages/larrys-content-empire"));
const LarrysEditor = lazy(() => import("@/pages/larrys-editor"));
const AskLarry = lazy(() => import("@/pages/ask-larry"));

// Persona Hub Pages
const ForBuyers = lazy(() => import("@/pages/for-buyers"));
const ForOwners = lazy(() => import("@/pages/for-owners"));
const ForSellers = lazy(() => import("@/pages/for-sellers"));
const LaundromatExpert = lazy(() => import("@/pages/laundromat-expert"));

// Calculator Pages
const Calculator = lazy(() => import("@/pages/calculator"));
const ROICalculator = lazy(() => import("@/pages/roi-calculator"));
const ROICalculatorAdvanced = lazy(() => import("@/pages/roi-calculator-advanced"));
const ROICalculatorEnhanced = lazy(() => import("@/pages/roi-calculator-enhanced"));
const ValuationCalculator = lazy(() => import("@/pages/valuation-calculator"));
const TPDCalculator = lazy(() => import("@/pages/tpd-calculator"));
const CLEANBICalculator = lazy(() => import("@/pages/cleanbi-calculator"));
const LoanCalculator = lazy(() => import("@/pages/loan-calculator"));
const UtilityCalculator = lazy(() => import("@/pages/utility-calculator"));
const LaborCalculator = lazy(() => import("@/pages/labor-calculator"));
const LTVCalculator = lazy(() => import("@/pages/ltv-calculator"));
const UtilityRateForecaster = lazy(() => import("@/pages/utility-rate-forecaster"));
const CACCalculator = lazy(() => import("@/pages/cac-calculator"));
const LTVCACDashboard = lazy(() => import("@/pages/ltv-cac-dashboard"));
const WDFEfficiencyCalculator = lazy(() => import("@/pages/wdf-efficiency-calculator"));
const WDFPricingOptimizer = lazy(() => import("@/pages/wdf-pricing-optimizer"));
const WhatIfAnalysis = lazy(() => import("@/pages/what-if-analysis"));
const EquipmentMixOptimizer = lazy(() => import("@/pages/equipment-mix-optimizer"));
const CalculatorsHub = lazy(() => import("@/pages/calculators"));
const CalculatorsSuite = lazy(() => import("@/pages/calculators-suite"));
const CalculatorBuilder = lazy(() => import("@/pages/calculator-builder"));
const CalculatorMarketplace = lazy(() => import("@/pages/calculator-marketplace"));
const StaffingLevelCalculator = lazy(() => import("@/pages/staffing-level-calculator"));
const DowntimeCostCalculator = lazy(() => import("@/pages/downtime-cost-calculator"));
const BreakEvenCalculator = lazy(() => import("@/pages/break-even-calculator"));
const FinancingScenarioMixer = lazy(() => import("@/pages/financing-scenario-mixer"));
const RouteProfitOptimizer = lazy(() => import("@/pages/route-profit-optimizer"));
const MarketGapFinder = lazy(() => import("@/pages/market-gap-finder"));
const DueDiligenceVerifier = lazy(() => import("@/pages/due-diligence-verifier"));
const CustomerChurnPredictor = lazy(() => import("@/pages/customer-churn-predictor"));
const RevenueDiversificationPlanner = lazy(() => import("@/pages/revenue-diversification-planner"));
const ExpansionFeasibilityScorecard = lazy(() => import("@/pages/expansion-feasibility-scorecard"));

// Platform Directory
const PlatformDirectory = lazy(() => import("@/pages/platform-directory"));

// CLEANBI Explorer (Immersive Map Experience)
const CleanBIExplorer = lazy(() => import("@/pages/cleanbi-explorer"));
const CleanBIReports = lazy(() => import("@/pages/cleanbi-reports"));
const CLEANBIMarketReport = lazy(() => import("@/pages/cleanbi-market-report"));
const ExpansionPlanner = lazy(() => import("@/pages/expansion-planner"));
const CompetitorDashboard = lazy(() => import("@/pages/competitor-dashboard"));
const BulkAnalysis = lazy(() => import("@/pages/bulk-analysis"));
const ProductsHub = lazy(() => import("@/pages/products"));
const ListYourLaundromat = lazy(() => import("@/pages/list-your-laundromat"));

// Forum Pages
const Forum = lazy(() => import("@/pages/forum"));
const ForumCategory = lazy(() => import("@/pages/forum-category"));
const ForumTopic = lazy(() => import("@/pages/forum-topic"));
const ForumNewTopic = lazy(() => import("@/pages/forum-new-topic"));

// Messages / Direct Messaging
const Messages = lazy(() => import("@/pages/messages"));

// Network / Community
const Network = lazy(() => import("@/pages/network"));
const Activity = lazy(() => import("@/pages/activity"));

// User Profile Features
const SavedAnalyses = lazy(() => import("@/pages/saved-analyses"));

// SRA (Stroke Recovery App) Pages
const SRAHome = lazy(() => import("@/pages/sra/home"));
const SRAPricing = lazy(() => import("@/pages/sra/pricing"));
const SRATracker = lazy(() => import("@/pages/sra/tracker"));
const SRACompanion = lazy(() => import("@/pages/sra/companion"));
const SRAGhostwriting = lazy(() => import("@/pages/sra/ghostwriting"));
const SRAStore = lazy(() => import("@/pages/sra/store"));
const SRACommunity = lazy(() => import("@/pages/sra/community"));
const SRADashboard = lazy(() => import("@/pages/sra/dashboard"));
const SRAMarketplace = lazy(() => import("@/pages/sra/marketplace"));
const SRAProductionConsole = lazy(() => import("@/pages/sra/production-console"));

// Marketplace & Equipment
const Marketplace = lazy(() => import("@/pages/marketplace"));
const BuyLaundromat = lazy(() => import("@/pages/buy-laundromat"));
const Brokers = lazy(() => import("@/pages/brokers"));
const Classifieds = lazy(() => import("@/pages/classifieds"));
const ClassifiedsSubmit = lazy(() => import("@/pages/classifieds-submit"));
const EquipmentHub = lazy(() => import("@/pages/equipment-hub"));
const IndustryEventsHub = lazy(() => import("@/pages/industry-events").then(m => ({ default: m.IndustryEventsHub })));
const IndustryEventDetail = lazy(() => import("@/pages/industry-events").then(m => ({ default: m.IndustryEventDetail })));
const EquipmentBlogList = lazy(() => import("@/pages/equipment-blog").then(m => ({ default: m.EquipmentBlogList })));
const EquipmentBlogPost = lazy(() => import("@/pages/equipment-blog").then(m => ({ default: m.EquipmentBlogPost })));
const EquipmentMarketplace = lazy(() => import("@/pages/equipment-marketplace"));
const EquipmentDetail = lazy(() => import("@/pages/equipment-detail"));
const EquipmentMatcher = lazy(() => import("@/pages/equipment-matcher"));
const EquipmentWizard = lazy(() => import("@/pages/equipment-wizard"));
const EquipmentGuides = lazy(() => import("@/pages/equipment-guides"));
const EquipmentDiagnostics = lazy(() => import("@/pages/equipment-diagnostics"));
const EquipmentFinancing = lazy(() => import("@/pages/equipment-financing"));
const PartsInventory = lazy(() => import("@/pages/parts-inventory"));
const ListEquipment = lazy(() => import("@/pages/list-equipment"));
const ListSupplies = lazy(() => import("@/pages/list-supplies"));
const ListServices = lazy(() => import("@/pages/list-services"));
const ListOnWashBizHub = lazy(() => import("@/pages/list-on-washbizhub"));

// Superstore
const Superstore = lazy(() => import("@/pages/superstore"));
const SuperstoreProduct = lazy(() => import("@/pages/superstore-product"));
const ProductComparison = lazy(() => import("@/pages/product-comparison"));
const BuyersGuides = lazy(() => import("@/pages/buyers-guides"));

// Website Builder
const WebsiteBuilder = lazy(() => import("@/pages/website-builder"));
const WebsiteTemplates = lazy(() => import("@/pages/website-templates"));
const PublishingDashboard = lazy(() => import("@/pages/publishing-dashboard"));

// Dashboards
const Dashboard = lazy(() => import("@/pages/dashboard"));
const UserDashboard = lazy(() => import("@/pages/user-dashboard"));
const OwnerDashboard = lazy(() => import("@/pages/owner-dashboard"));
const OwnerCommandCenter = lazy(() => import("@/pages/owner-command-center"));
const CommandCenter = lazy(() => import("@/pages/command-center"));
const OperatorDashboard = lazy(() => import("@/pages/operator-dashboard"));
const BusinessBuilder = lazy(() => import("@/pages/business-builder"));
const AffiliateDashboard = lazy(() => import("@/pages/affiliate-dashboard"));
const BrokerDashboard = lazy(() => import("@/pages/broker-dashboard"));
const BrokerStorefront = lazy(() => import("@/pages/broker-storefront"));
const BrokerStorefrontPage = lazy(() => import("@/pages/broker/[brokerId]"));
const VendorDashboard = lazy(() => import("@/pages/vendor-dashboard"));
const SellerDashboard = lazy(() => import("@/pages/seller-dashboard"));

// Courses & Learning
const Courses = lazy(() => import("@/pages/courses"));
const CourseDetail = lazy(() => import("@/pages/course-detail"));
const Lesson = lazy(() => import("@/pages/lesson"));
const LearningPage = lazy(() => import("@/pages/learning"));
const CoursesLanding = lazy(() => import("@/pages/landing/courses-landing"));
const ServiceTechAcademy = lazy(() => import("@/pages/service-tech-academy"));

// Journey Landing Pages
const LearnLanding = lazy(() => import("@/pages/landing/learn"));
const BuyLanding = lazy(() => import("@/pages/landing/buy"));
const SellLanding = lazy(() => import("@/pages/landing/sell"));
const OperateLanding = lazy(() => import("@/pages/landing/operate"));
const StartLanding = lazy(() => import("@/pages/landing/start"));
const FundLanding = lazy(() => import("@/pages/landing/fund"));
const PartnerLanding = lazy(() => import("@/pages/landing/partner"));
const ServiceLanding = lazy(() => import("@/pages/landing/service"));
const DistributorsLanding = lazy(() => import("@/pages/landing/distributors"));
const DistributorCommandCenter = lazy(() => import("@/pages/distributor-command-center"));
const ServiceAIEnterpriseDemo = lazy(() => import("@/pages/service-ai-enterprise-demo"));
const ServiceGuyAdmin = lazy(() => import("@/pages/service-guy-admin"));
const ServiceGuyDemo = lazy(() => import("@/pages/service-guy-demo"));

// Funding Pages
const FundingMatcher = lazy(() => import("@/pages/funding-matcher"));
const FundingWizard = lazy(() => import("@/pages/funding-wizard"));
const Funding = lazy(() => import("@/pages/funding"));
const Investors = lazy(() => import("@/pages/investors"));
const RealEstateFinancing = lazy(() => import("@/pages/real-estate-financing"));
const GoKapital = lazy(() => import("@/pages/gokapital"));
const WorkingCapitalFinancing = lazy(() => import("@/pages/working-capital-financing"));
const StartupFunding = lazy(() => import("@/pages/startup-funding"));
const AcquisitionsFunding = lazy(() => import("@/pages/acquisitions-funding"));
const SBAReadiness = lazy(() => import("@/pages/sba-readiness"));
const SBALoans = lazy(() => import("@/pages/sba-loans"));
const BusinessPlanGenerator = lazy(() => import("@/pages/business-plan-generator"));
const PreferredFundingGroupPage = lazy(() => import("@/pages/funding/preferred-funding-group"));
const GoKapitalPage = lazy(() => import("@/pages/funding/gokapital"));
const SouthEndCapitalPage = lazy(() => import("@/pages/funding/south-end-capital"));
const RokFinancialPage = lazy(() => import("@/pages/funding/rok-financial"));
const AdvanceFundsNetworkPage = lazy(() => import("@/pages/funding/advance-funds-network"));
const DavidAllenCapitalPage = lazy(() => import("@/pages/funding/david-allen-capital"));
const NationalBusinessCapitalPage = lazy(() => import("@/pages/funding/national-business-capital"));

// Listings & Vendors
const ListingsHub = lazy(() => import("@/pages/listings-hub"));
const VendorsHub = lazy(() => import("@/pages/vendors-hub"));
const CityLanding = lazy(() => import("@/pages/city-landing"));
const AddListing = lazy(() => import("@/pages/add-listing"));
const SellYourLaundromat = lazy(() => import("@/pages/sell-your-laundromat"));
const ListingForm = lazy(() => import("@/pages/listing-form"));
const AddListingFromImage = lazy(() => import("@/pages/add-listing-from-image"));
const VendorForm = lazy(() => import("@/pages/vendor-form"));
const ListingDetail = lazy(() => import("@/pages/listing-detail"));
const FeaturedListings = lazy(() => import("@/pages/featured-listings"));
const VendorSpotlight = lazy(() => import("@/pages/vendor-spotlight"));
const LaundromatListings = lazy(() => import("@/pages/laundromat-listings"));
const Listings = lazy(() => import("@/pages/listings"));
const Vendors = lazy(() => import("@/pages/vendors"));
const VendorStorefront = lazy(() => import("@/pages/vendor-store"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));

// Business Directory
const ListBusiness = lazy(() => import("@/pages/list-business"));
const Directory = lazy(() => import("@/pages/directory"));
const DirectoryListing = lazy(() => import("@/pages/directory-listing"));

// State SEO Landing Pages
const StatesDirectory = lazy(() => import("@/pages/seo/states-directory"));
const StateLanding = lazy(() => import("@/pages/state-landing"));

// Parts & Repair
const Parts = lazy(() => import("@/pages/parts"));
const PartsStore = lazy(() => import("@/pages/parts-store"));
const PartsCatalogue = lazy(() => import("@/pages/parts-catalogue"));
const RepairGuide = lazy(() => import("@/pages/repair-guide"));
const ErrorCodes = lazy(() => import("@/pages/error-codes"));
const ErrorCodeDetail = lazy(() => import("@/pages/error-code-detail"));
const ErrorCodeScanner = lazy(() => import("@/pages/error-code-scanner"));

// Utility Bill Auditor
const UtilityBillAuditor = lazy(() => import("@/pages/utility-bill-auditor"));

// Locator Pages
const Locator = lazy(() => import("@/pages/locator"));
const DistributorLocator = lazy(() => import("@/pages/distributor-locator"));
const EquipmentBuilder = lazy(() => import("@/pages/equipment-builder"));
const LaundromatLocatorPage = lazy(() => import("@/pages/laundromat-locator"));

// Advertising
const Advertising = lazy(() => import("@/pages/advertising"));
const AdBuilder = lazy(() => import("@/pages/ad-builder"));

// Consultation & Partners
const ConsultantInquiry = lazy(() => import("@/pages/consultant-inquiry"));
const Feedback = lazy(() => import("@/pages/feedback"));
const Consultation = lazy(() => import("@/pages/consultation"));
const AIConsultationCouncil = lazy(() => import("@/pages/ai-consultation-council"));
const ConsultationLanding = lazy(() => import("@/pages/consultation-landing"));
const InsurancePartners = lazy(() => import("@/pages/insurance-partners"));
const LarryLarsen = lazy(() => import("@/pages/larry-larsen"));
const LarrysAcademy = lazy(() => import("@/pages/larrys-academy"));
const OurPartnership = lazy(() => import("@/pages/our-partnership"));

// Order Portal
const LaundryOrderPortal = lazy(() => import("@/pages/laundry-order-portal"));

// CLEANBI Auto
const CleanbiAuto = lazy(() => import("@/pages/cleanbi-auto"));

// Engagement & User Features
const ScoreHistory = lazy(() => import("@/pages/score-history"));
const ReferralProgram = lazy(() => import("@/pages/referral-program"));
const Referrals = lazy(() => import("@/pages/referrals"));
const HelpCenter = lazy(() => import("@/pages/help-center"));

// Customer Portal
const CustomerPortal = lazy(() => import("@/pages/customer-portal"));

// Buyer Engagement System
const BuyerDashboard = lazy(() => import("@/pages/buyer-dashboard"));
const BuyerMessaging = lazy(() => import("@/pages/buyer-messaging"));
const ListingComparison = lazy(() => import("@/pages/listing-comparison"));

// Route Optimization (PUD Operations)
const RouteOptimization = lazy(() => import("@/pages/route-optimization"));
const DriverMobile = lazy(() => import("@/pages/driver-mobile"));
const CustomerTracking = lazy(() => import("@/pages/customer-tracking"));

// Power Tools Hub
const ToolsHub = lazy(() => import("@/pages/tools-hub"));

// Other Pages
const Book = lazy(() => import("@/pages/book"));
const BookAdPreview = lazy(() => import("@/pages/book-ad-preview"));
const LaundromatBible = lazy(() => import("@/pages/laundromat-bible"));
const Doctrine = lazy(() => import("@/pages/doctrine"));
const Subscribe = lazy(() => import("@/pages/subscribe"));
const SubscriptionSuccess = lazy(() => import("@/pages/subscription-success"));
const FacebookGroup = lazy(() => import("@/pages/FacebookGroup"));
const AtmServices = lazy(() => import("@/pages/AtmServices"));
const Templates = lazy(() => import("@/pages/templates"));
const Vault = lazy(() => import("@/pages/vault"));
const TemplateVault = lazy(() => import("@/pages/template-vault"));
const UserLibrary = lazy(() => import("@/pages/user-library"));
const VaultBusinessPlan = lazy(() => import("@/pages/vault/business-plan"));
const VaultLeaseChecklist = lazy(() => import("@/pages/vault/lease-checklist"));
const VaultTemplateDetail = lazy(() => import("@/pages/vault/template-detail"));
const Resources = lazy(() => import("@/pages/resources"));
const ResourceDetail = lazy(() => import("@/pages/resource-detail"));
const Settings = lazy(() => import("@/pages/settings"));
const AccountSubscription = lazy(() => import("@/pages/account-subscription"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const SignedOut = lazy(() => import("@/pages/signed-out"));
const AuthVerify = lazy(() => import("@/pages/auth-verify"));
const AuthPage = lazy(() => import("@/pages/auth"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const AffiliateBlogsPage = lazy(() => import("@/pages/affiliate-blogs"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy"));
const TermsOfService = lazy(() => import("@/pages/terms"));
const LegalDisclaimer = lazy(() => import("@/pages/legal-disclaimer"));
const MarketplaceLanding = lazy(() => import("@/pages/landing/marketplace-landing"));
const ROICalculatorLanding = lazy(() => import("@/pages/landing/roi-calculator-landing"));
const ValuationCalculatorLanding = lazy(() => import("@/pages/landing/valuation-calculator-landing"));
const UtilityBillLanding = lazy(() => import("@/pages/landing/utility-bill-landing"));
const SellLaundromatStatePage = lazy(() => import("@/pages/landing/sell-laundromat-state"));
const PlanPage = lazy(() => import("@/pages/plan"));
const EvaluatePage = lazy(() => import("@/pages/evaluate"));
const OperatePage = lazy(() => import("@/pages/operate"));
const PartnerPage = lazy(() => import("@/pages/partner"));

// SEO Landing Pages (Multi-keyword optimization)
const LaundromatValuationSEO = lazy(() => import("@/pages/seo/laundromat-valuation"));
const LaundromatForSaleSEO = lazy(() => import("@/pages/seo/laundromat-for-sale"));
const LaundromatDueDiligenceSEO = lazy(() => import("@/pages/seo/laundromat-due-diligence"));
const LaundromatLocationAnalysisSEO = lazy(() => import("@/pages/seo/laundromat-location-analysis"));
const LaundromatROICalculatorSEO = lazy(() => import("@/pages/seo/laundromat-roi-calculator"));
const LaundromatEquipmentRepairSEO = lazy(() => import("@/pages/seo/laundromat-equipment-repair"));
const HowToStartLaundromatSEO = lazy(() => import("@/pages/seo/how-to-start-laundromat"));
const LaundromatFinancingSEO = lazy(() => import("@/pages/seo/laundromat-financing"));
const LaundromatBusinessPlanSEO = lazy(() => import("@/pages/seo/laundromat-business-plan"));
const BuyCoinLaundrySEO = lazy(() => import("@/pages/seo/buy-coin-laundry"));

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Static routes - essential for SEO */}
      <Route path="/" component={Home} />
      <Route path="/cleanbi" component={CleanBI} />
      <Route path="/cleanbi-tool" component={CleanBI} />
      <Route path="/cleanbi-explorer">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <CleanBIExplorer />
        </Suspense>
      </Route>
      <Route path="/cleanbi-reports">
        <Suspense fallback={<LoadingFallback />}>
          <CleanBIReports />
        </Suspense>
      </Route>
      <Route path="/market-report">
        <Suspense fallback={<LoadingFallback />}>
          <CLEANBIMarketReport />
        </Suspense>
      </Route>
      <Route path="/cleanbi-market-report">
        <Suspense fallback={<LoadingFallback />}>
          <CLEANBIMarketReport />
        </Suspense>
      </Route>
      <Route path="/cleanbi-methodology">
        <Suspense fallback={<LoadingFallback />}>
          <CLEANBIMethodology />
        </Suspense>
      </Route>
      <Route path="/expansion-planner">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <ExpansionPlanner />
        </Suspense>
      </Route>
      <Route path="/competitor-dashboard">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <CompetitorDashboard />
        </Suspense>
      </Route>
      <Route path="/bulk-analysis">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <BulkAnalysis />
        </Suspense>
      </Route>
      <Route path="/products">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <ProductsHub />
        </Suspense>
      </Route>
      <Route path="/tools">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <ToolsHub />
        </Suspense>
      </Route>
      <Route path="/list-your-laundromat">
        <Suspense fallback={<LoadingFallback />}>
          <ListYourLaundromat />
        </Suspense>
      </Route>
      <Route path="/sell-your-laundromat">
        <Suspense fallback={<LoadingFallback />}>
          <SellYourLaundromat />
        </Suspense>
      </Route>
      <Route path="/pricing" component={Pricing} />
      <Route path="/enterprise-pricing">
        <Suspense fallback={<LoadingFallback />}>
          <EnterprisePricing />
        </Suspense>
      </Route>
      <Route path="/enterprise-branding">
        <Suspense fallback={<LoadingFallback />}>
          <EnterpriseBranding />
        </Suspense>
      </Route>
      <Route path="/enterprise-branding/:distributorId">
        <Suspense fallback={<LoadingFallback />}>
          <EnterpriseBranding />
        </Suspense>
      </Route>
      <Route path="/enterprise-onboarding">
        <Suspense fallback={<LoadingFallback />}>
          <EnterpriseOnboarding />
        </Suspense>
      </Route>
      <Route path="/single-analysis">
        <Suspense fallback={<LoadingFallback />}>
          <SingleAnalysis />
        </Suspense>
      </Route>
      <Route path="/reports">
        <Suspense fallback={<LoadingFallback />}>
          <SingleAnalysis />
        </Suspense>
      </Route>
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id">
        <Suspense fallback={<LoadingFallback />}>
          <BlogPost />
        </Suspense>
      </Route>
      <Route path="/courses" component={CoursesHub} />
      <Route path="/academy" component={Academy} />
      <Route path="/forensic-academy">
        <Suspense fallback={<LoadingFallback />}>
          <ForensicAcademy />
        </Suspense>
      </Route>
      <Route path="/ai-book-suite">
        <Suspense fallback={<LoadingFallback />}>
          <AIBookSuite />
        </Suspense>
      </Route>
      <Route path="/book-studio">
        <Suspense fallback={<LoadingFallback />}>
          <BookStudio />
        </Suspense>
      </Route>
      <Route path="/media-studio">
        <Suspense fallback={<LoadingFallback />}>
          <AIMediaStudio />
        </Suspense>
      </Route>
      <Route path="/ai-media-studio">
        <Suspense fallback={<LoadingFallback />}>
          <AIMediaStudio />
        </Suspense>
      </Route>
      <Route path="/ai-command-center">
        <Suspense fallback={<LoadingFallback />}>
          <AICommandCenter />
        </Suspense>
      </Route>
      <Route path="/larrys-command-center">
        <Suspense fallback={<LoadingFallback />}>
          <LarrysCommandCenter />
        </Suspense>
      </Route>
      <Route path="/content-command-center">
        <Suspense fallback={<LoadingFallback />}>
          <LarrysCommandCenter />
        </Suspense>
      </Route>
      <Route path="/larrys-content-empire">
        <Suspense fallback={<LoadingFallback />}>
          <LarrysContentEmpire />
        </Suspense>
      </Route>
      <Route path="/content-empire">
        <Suspense fallback={<LoadingFallback />}>
          <LarrysContentEmpire />
        </Suspense>
      </Route>
      <Route path="/larrys-editor">
        <Suspense fallback={<LoadingFallback />}>
          <LarrysEditor />
        </Suspense>
      </Route>
      <Route path="/content-editor">
        <Suspense fallback={<LoadingFallback />}>
          <ContentEditor />
        </Suspense>
      </Route>
      <Route path="/content-editor/:id">
        <Suspense fallback={<LoadingFallback />}>
          <ContentEditor />
        </Suspense>
      </Route>
      <Route path="/ask-larry">
        <Suspense fallback={<LoadingFallback />}>
          <AskLarry />
        </Suspense>
      </Route>
      <Route path="/about-us" component={AboutUs} />
      <Route path="/about" component={AboutUs} />
      
      {/* Persona Hub Pages */}
      <Route path="/for-buyers">
        <Suspense fallback={<LoadingFallback />}>
          <ForBuyers />
        </Suspense>
      </Route>
      <Route path="/for-owners">
        <Suspense fallback={<LoadingFallback />}>
          <ForOwners />
        </Suspense>
      </Route>
      <Route path="/for-sellers">
        <Suspense fallback={<LoadingFallback />}>
          <ForSellers />
        </Suspense>
      </Route>
      <Route path="/laundromat-expert">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatExpert />
        </Suspense>
      </Route>
      <Route path="/laundromat-ai">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatExpert />
        </Suspense>
      </Route>
      
      <Route path="/platform-directory" component={PlatformDirectory} />
      <Route path="/features" component={PlatformDirectory} />
      <Route path="/all-features" component={PlatformDirectory} />
      <Route path="/why-washbizhub" component={WhyWashBizHub} />

      {/* SEO Landing Pages (Multi-keyword optimization) */}
      <Route path="/laundromat-valuation">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatValuationSEO />
        </Suspense>
      </Route>
      <Route path="/laundromat-for-sale">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatForSaleSEO />
        </Suspense>
      </Route>
      <Route path="/laundromat-due-diligence">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatDueDiligenceSEO />
        </Suspense>
      </Route>
      <Route path="/laundromat-location-analysis">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatLocationAnalysisSEO />
        </Suspense>
      </Route>
      <Route path="/laundromat-roi-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatROICalculatorSEO />
        </Suspense>
      </Route>
      <Route path="/laundromat-equipment-repair">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatEquipmentRepairSEO />
        </Suspense>
      </Route>
      <Route path="/how-to-start-laundromat">
        <Suspense fallback={<LoadingFallback />}>
          <HowToStartLaundromatSEO />
        </Suspense>
      </Route>
      <Route path="/laundromat-financing">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatFinancingSEO />
        </Suspense>
      </Route>
      <Route path="/laundromat-business-plan">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatBusinessPlanSEO />
        </Suspense>
      </Route>
      <Route path="/buy-coin-laundry">
        <Suspense fallback={<LoadingFallback />}>
          <BuyCoinLaundrySEO />
        </Suspense>
      </Route>

      {/* Lazy-loaded routes wrapped in Suspense */}
      <Route path="/plan">
        <Suspense fallback={<LoadingFallback />}>
          <PlanPage />
        </Suspense>
      </Route>
      <Route path="/evaluate">
        <Suspense fallback={<LoadingFallback />}>
          <EvaluatePage />
        </Suspense>
      </Route>
      <Route path="/operate">
        <Suspense fallback={<LoadingFallback />}>
          <OperatePage />
        </Suspense>
      </Route>
      <Route path="/partner">
        <Suspense fallback={<LoadingFallback />}>
          <PartnerPage />
        </Suspense>
      </Route>

      {/* Design Studio / 3D Features */}
      <Route path="/design-studio">
        <Suspense fallback={<LoadingFallback />}>
          <DesignStudio />
        </Suspense>
      </Route>
      <Route path="/design-studio-pro">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <DesignStudioPro />
        </Suspense>
      </Route>

      {/* POS Command Center */}
      <Route path="/pos">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <POSCommandCenter />
        </Suspense>
      </Route>
      <Route path="/pos-system">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <POSCommandCenter />
        </Suspense>
      </Route>
      <Route path="/pos-command-center">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <POSCommandCenter />
        </Suspense>
      </Route>

      {/* IoT Dashboard - Machine Monitoring & Dynamic Pricing */}
      <Route path="/iot-dashboard">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <IoTDashboard />
        </Suspense>
      </Route>
      
      {/* Machine Booking System */}
      <Route path="/bookings">
        <Suspense fallback={<LoadingFallback />}>
          <Bookings />
        </Suspense>
      </Route>
      <Route path="/book-machine">
        <Suspense fallback={<LoadingFallback />}>
          <Bookings />
        </Suspense>
      </Route>
      <Route path="/booking-management">
        <Suspense fallback={<LoadingFallback />}>
          <BookingManagement />
        </Suspense>
      </Route>
      <Route path="/pos-landing">
        <Suspense fallback={<LoadingFallback />}>
          <PosLanding />
        </Suspense>
      </Route>
      <Route path="/pos-suite">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <PosSuite />
        </Suspense>
      </Route>
      <Route path="/marketing-loyalty">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <MarketingLoyalty />
        </Suspense>
      </Route>
      <Route path="/qr-generator">
        <Suspense fallback={<LoadingFallback />}>
          <QRGenerator />
        </Suspense>
      </Route>
      <Route path="/tools/qr-generator">
        <Suspense fallback={<LoadingFallback />}>
          <QRGenerator />
        </Suspense>
      </Route>

      {/* CLEANBI Auto */}
      <Route path="/cleanbi-auto">
        <Suspense fallback={<LoadingFallback />}>
          <CleanbiAuto />
        </Suspense>
      </Route>

      {/* Engagement & User Features */}
      <Route path="/score-history">
        <Suspense fallback={<LoadingFallback />}>
          <ScoreHistory />
        </Suspense>
      </Route>
      <Route path="/referral-program">
        <Suspense fallback={<LoadingFallback />}>
          <ReferralProgram />
        </Suspense>
      </Route>
      <Route path="/referrals">
        <Suspense fallback={<LoadingFallback />}>
          <Referrals />
        </Suspense>
      </Route>
      <Route path="/help-center">
        <Suspense fallback={<LoadingFallback />}>
          <HelpCenter />
        </Suspense>
      </Route>

      {/* Calculator Routes */}
      <Route path="/calculators">
        <Suspense fallback={<LoadingFallback />}>
          <CalculatorsHub />
        </Suspense>
      </Route>
      <Route path="/calculators-suite">
        <Suspense fallback={<LoadingFallback />}>
          <CalculatorsSuite />
        </Suspense>
      </Route>
      <Route path="/calculators/builder">
        <Suspense fallback={<LoadingFallback />}>
          <CalculatorBuilder />
        </Suspense>
      </Route>
      <Route path="/calculator-builder">
        <Suspense fallback={<LoadingFallback />}>
          <CalculatorBuilder />
        </Suspense>
      </Route>
      <Route path="/calculator-marketplace">
        <Suspense fallback={<LoadingFallback />}>
          <CalculatorMarketplace />
        </Suspense>
      </Route>
      <Route path="/tools">
        <Suspense fallback={<LoadingFallback />}>
          <CalculatorMarketplace />
        </Suspense>
      </Route>
      <Route path="/calc/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <CalculatorsHub />
        </Suspense>
      </Route>
      <Route path="/calculator">
        <Suspense fallback={<LoadingFallback />}>
          <Calculator />
        </Suspense>
      </Route>
      <Route path="/roi-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <ROICalculator />
        </Suspense>
      </Route>
      <Route path="/roi-calculator-advanced">
        <Suspense fallback={<LoadingFallback />}>
          <ROICalculatorAdvanced />
        </Suspense>
      </Route>
      <Route path="/roi-calculator-enhanced">
        <Suspense fallback={<LoadingFallback />}>
          <ROICalculatorEnhanced />
        </Suspense>
      </Route>
      <Route path="/valuation-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <ValuationCalculator />
        </Suspense>
      </Route>
      <Route path="/tpd-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <TPDCalculator />
        </Suspense>
      </Route>
      <Route path="/cleanbi-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <CLEANBICalculator />
        </Suspense>
      </Route>
      <Route path="/loan-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <LoanCalculator />
        </Suspense>
      </Route>
      <Route path="/utility-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <UtilityCalculator />
        </Suspense>
      </Route>
      <Route path="/labor-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <LaborCalculator />
        </Suspense>
      </Route>
      <Route path="/ltv-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <LTVCalculator />
        </Suspense>
      </Route>
      <Route path="/customer-churn-predictor">
        <Suspense fallback={<LoadingFallback />}>
          <CustomerChurnPredictor />
        </Suspense>
      </Route>
      <Route path="/revenue-diversification-planner">
        <Suspense fallback={<LoadingFallback />}>
          <RevenueDiversificationPlanner />
        </Suspense>
      </Route>
      <Route path="/expansion-feasibility-scorecard">
        <Suspense fallback={<LoadingFallback />}>
          <ExpansionFeasibilityScorecard />
        </Suspense>
      </Route>
      <Route path="/utility-rate-forecaster">
        <Suspense fallback={<LoadingFallback />}>
          <UtilityRateForecaster />
        </Suspense>
      </Route>
      <Route path="/utility-bill-scanner">
        <Suspense fallback={<LoadingFallback />}>
          <UtilityBillScanner />
        </Suspense>
      </Route>
      <Route path="/equipment-appraiser">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentAppraiser />
        </Suspense>
      </Route>
      <Route path="/smart-location-scout">
        <Suspense fallback={<LoadingFallback />}>
          <SmartLocationScout />
        </Suspense>
      </Route>
      <Route path="/competitor-intelligence">
        <Suspense fallback={<LoadingFallback />}>
          <CompetitorIntelligence />
        </Suspense>
      </Route>
      <Route path="/demographic-clusterer">
        <Suspense fallback={<LoadingFallback />}>
          <DemographicClusterer />
        </Suspense>
      </Route>
      <Route path="/utility-load-forecaster">
        <Suspense fallback={<LoadingFallback />}>
          <UtilityLoadForecaster />
        </Suspense>
      </Route>
      <Route path="/pricing-elasticity">
        <Suspense fallback={<LoadingFallback />}>
          <PricingElasticity />
        </Suspense>
      </Route>
      <Route path="/delivery-route-optimizer">
        <Suspense fallback={<LoadingFallback />}>
          <DeliveryRouteOptimizer />
        </Suspense>
      </Route>
      <Route path="/marketing-attribution">
        <Suspense fallback={<LoadingFallback />}>
          <MarketingAttribution />
        </Suspense>
      </Route>
      <Route path="/cac-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <CACCalculator />
        </Suspense>
      </Route>
      <Route path="/ltv-cac-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <LTVCACDashboard />
        </Suspense>
      </Route>
      <Route path="/wdf-efficiency-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <WDFEfficiencyCalculator />
        </Suspense>
      </Route>
      <Route path="/wdf-pricing-optimizer">
        <Suspense fallback={<LoadingFallback />}>
          <WDFPricingOptimizer />
        </Suspense>
      </Route>
      <Route path="/what-if-analysis">
        <Suspense fallback={<LoadingFallback />}>
          <WhatIfAnalysis />
        </Suspense>
      </Route>
      <Route path="/equipment-mix-optimizer">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentMixOptimizer />
        </Suspense>
      </Route>
      <Route path="/staffing-level-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <StaffingLevelCalculator />
        </Suspense>
      </Route>
      <Route path="/downtime-cost-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <DowntimeCostCalculator />
        </Suspense>
      </Route>
      <Route path="/break-even-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <BreakEvenCalculator />
        </Suspense>
      </Route>
      <Route path="/financing-scenario-mixer">
        <Suspense fallback={<LoadingFallback />}>
          <FinancingScenarioMixer />
        </Suspense>
      </Route>
      <Route path="/route-profit-optimizer">
        <Suspense fallback={<LoadingFallback />}>
          <RouteProfitOptimizer />
        </Suspense>
      </Route>
      <Route path="/market-gap-finder">
        <Suspense fallback={<LoadingFallback />}>
          <MarketGapFinder />
        </Suspense>
      </Route>
      <Route path="/due-diligence-verifier">
        <Suspense fallback={<LoadingFallback />}>
          <DueDiligenceVerifier />
        </Suspense>
      </Route>

      {/* Dashboards */}
      <Route path="/owner">
        <Suspense fallback={<LoadingFallback />}>
          <OwnerCommandCenter />
        </Suspense>
      </Route>
      <Route path="/owner-command-center">
        <Suspense fallback={<LoadingFallback />}>
          <OwnerCommandCenter />
        </Suspense>
      </Route>
      <Route path="/route-optimization">
        <Suspense fallback={<LoadingFallback />}>
          <RouteOptimization />
        </Suspense>
      </Route>
      <Route path="/driver">
        <Suspense fallback={<LoadingFallback />}>
          <DriverMobile />
        </Suspense>
      </Route>
      <Route path="/track/:token">
        <Suspense fallback={<LoadingFallback />}>
          <CustomerTracking />
        </Suspense>
      </Route>
      <Route path="/owner-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <OwnerDashboard />
        </Suspense>
      </Route>
      <Route path="/my-business">
        <Suspense fallback={<LoadingFallback />}>
          <OwnerDashboard />
        </Suspense>
      </Route>
      <Route path="/business-builder">
        <Suspense fallback={<LoadingFallback />}>
          <BusinessBuilder />
        </Suspense>
      </Route>
      <Route path="/build-my-business">
        <Suspense fallback={<LoadingFallback />}>
          <BusinessBuilder />
        </Suspense>
      </Route>
      <Route path="/affiliate">
        <Suspense fallback={<LoadingFallback />}>
          <AffiliateDashboard />
        </Suspense>
      </Route>
      <Route path="/affiliate-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <AffiliateDashboard />
        </Suspense>
      </Route>
      <Route path="/broker">
        <Suspense fallback={<LoadingFallback />}>
          <BrokerDashboard />
        </Suspense>
      </Route>
      <Route path="/broker-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <BrokerDashboard />
        </Suspense>
      </Route>
      <Route path="/broker/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <BrokerStorefront />
        </Suspense>
      </Route>
      <Route path="/brokers/:brokerId">
        <Suspense fallback={<LoadingFallback />}>
          <BrokerStorefrontPage />
        </Suspense>
      </Route>
      <Route path="/vendor-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <VendorDashboard />
        </Suspense>
      </Route>
      <Route path="/seller-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <SellerDashboard />
        </Suspense>
      </Route>
      <Route path="/seller">
        <Suspense fallback={<LoadingFallback />}>
          <SellerDashboard />
        </Suspense>
      </Route>

      {/* Order Portal */}
      <Route path="/order">
        <Suspense fallback={<LoadingFallback />}>
          <LaundryOrderPortal />
        </Suspense>
      </Route>
      <Route path="/laundry-order">
        <Suspense fallback={<LoadingFallback />}>
          <LaundryOrderPortal />
        </Suspense>
      </Route>

      {/* Customer Portal */}
      <Route path="/customer-portal">
        <Suspense fallback={<LoadingFallback />}>
          <CustomerPortal />
        </Suspense>
      </Route>

      {/* Website Builder */}
      <Route path="/website-builder">
        <Suspense fallback={<LoadingFallback />}>
          <WebsiteBuilder />
        </Suspense>
      </Route>
      <Route path="/website-templates">
        <Suspense fallback={<LoadingFallback />}>
          <WebsiteTemplates />
        </Suspense>
      </Route>
      <Route path="/publishing-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <PublishingDashboard />
        </Suspense>
      </Route>

      {/* Funding */}
      <Route path="/funding-matcher">
        <Suspense fallback={<LoadingFallback />}>
          <FundingMatcher />
        </Suspense>
      </Route>
      <Route path="/funding-wizard">
        <Suspense fallback={<LoadingFallback />}>
          <FundingWizard />
        </Suspense>
      </Route>
      <Route path="/funding">
        <Suspense fallback={<LoadingFallback />}>
          <Funding />
        </Suspense>
      </Route>
      <Route path="/equipment-financing">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentFinancing />
        </Suspense>
      </Route>
      <Route path="/real-estate-financing">
        <Suspense fallback={<LoadingFallback />}>
          <RealEstateFinancing />
        </Suspense>
      </Route>
      <Route path="/gokapital">
        <Suspense fallback={<LoadingFallback />}>
          <GoKapital />
        </Suspense>
      </Route>
      <Route path="/working-capital-financing">
        <Suspense fallback={<LoadingFallback />}>
          <WorkingCapitalFinancing />
        </Suspense>
      </Route>
      <Route path="/startup-funding">
        <Suspense fallback={<LoadingFallback />}>
          <StartupFunding />
        </Suspense>
      </Route>
      <Route path="/funding/preferred-funding-group">
        <PageTransition>
          <PreferredFundingGroupPage />
        </PageTransition>
      </Route>
      <Route path="/funding/gokapital">
        <PageTransition>
          <GoKapitalPage />
        </PageTransition>
      </Route>
      <Route path="/funding/south-end-capital">
        <PageTransition>
          <SouthEndCapitalPage />
        </PageTransition>
      </Route>
      <Route path="/funding/rok-financial">
        <PageTransition>
          <RokFinancialPage />
        </PageTransition>
      </Route>
      <Route path="/funding/advance-funds-network">
        <PageTransition>
          <AdvanceFundsNetworkPage />
        </PageTransition>
      </Route>
      <Route path="/funding/david-allen-capital">
        <PageTransition>
          <DavidAllenCapitalPage />
        </PageTransition>
      </Route>
      <Route path="/funding/national-business-capital">
        <PageTransition>
          <NationalBusinessCapitalPage />
        </PageTransition>
      </Route>
      <Route path="/acquisitions-funding">
        <Suspense fallback={<LoadingFallback />}>
          <AcquisitionsFunding />
        </Suspense>
      </Route>
      <Route path="/sba-readiness">
        <Suspense fallback={<LoadingFallback />}>
          <SBAReadiness />
        </Suspense>
      </Route>
      <Route path="/sba-loans">
        <Suspense fallback={<LoadingFallback />}>
          <SBALoans />
        </Suspense>
      </Route>
      <Route path="/business-plan-generator">
        <Suspense fallback={<LoadingFallback />}>
          <BusinessPlanGenerator />
        </Suspense>
      </Route>
      <Route path="/insurance-partners">
        <Suspense fallback={<LoadingFallback />}>
          <InsurancePartners />
        </Suspense>
      </Route>
      <Route path="/investors">
        <Suspense fallback={<LoadingFallback />}>
          <Investors />
        </Suspense>
      </Route>

      {/* Journey Landing Pages */}
      <Route path="/learn">
        <Suspense fallback={<LoadingFallback />}>
          <LearnLanding />
        </Suspense>
      </Route>
      <Route path="/buy">
        <Suspense fallback={<LoadingFallback />}>
          <BuyLanding />
        </Suspense>
      </Route>
      <Route path="/sell">
        <Suspense fallback={<LoadingFallback />}>
          <SellLanding />
        </Suspense>
      </Route>
      <Route path="/operate">
        <Suspense fallback={<LoadingFallback />}>
          <OperateLanding />
        </Suspense>
      </Route>
      <Route path="/start">
        <Suspense fallback={<LoadingFallback />}>
          <StartLanding />
        </Suspense>
      </Route>
      <Route path="/fund">
        <Suspense fallback={<LoadingFallback />}>
          <FundLanding />
        </Suspense>
      </Route>
      <Route path="/partner">
        <Suspense fallback={<LoadingFallback />}>
          <PartnerLanding />
        </Suspense>
      </Route>
      <Route path="/service">
        <Suspense fallback={<LoadingFallback />}>
          <ServiceLanding />
        </Suspense>
      </Route>
      <Route path="/distributors">
        <Suspense fallback={<LoadingFallback />}>
          <DistributorsLanding />
        </Suspense>
      </Route>
      <Route path="/distributor-command-center">
        <Suspense fallback={<LoadingFallback />}>
          <DistributorCommandCenter />
        </Suspense>
      </Route>
      <Route path="/service-ai-demo">
        <Suspense fallback={<LoadingFallback />}>
          <ServiceAIEnterpriseDemo />
        </Suspense>
      </Route>

      {/* Superstore */}
      <Route path="/superstore">
        <Suspense fallback={<LoadingFallback />}>
          <Superstore />
        </Suspense>
      </Route>
      <Route path="/superstore/product/:asin">
        <Suspense fallback={<LoadingFallback />}>
          <SuperstoreProduct />
        </Suspense>
      </Route>
      <Route path="/superstore/compare">
        <Suspense fallback={<LoadingFallback />}>
          <ProductComparison />
        </Suspense>
      </Route>
      <Route path="/buyers-guides">
        <Suspense fallback={<LoadingFallback />}>
          <BuyersGuides />
        </Suspense>
      </Route>

      {/* Courses & Learning */}
      <Route path="/courses/:courseId">
        <Suspense fallback={<LoadingFallback />}>
          <CourseDetail />
        </Suspense>
      </Route>
      <Route path="/courses/:courseId/lessons/:lessonId">
        <Suspense fallback={<LoadingFallback />}>
          <Lesson />
        </Suspense>
      </Route>
      <Route path="/learning">
        <Suspense fallback={<LoadingFallback />}>
          <LearningPage />
        </Suspense>
      </Route>
      <Route path="/courses-landing">
        <Suspense fallback={<LoadingFallback />}>
          <CoursesLanding />
        </Suspense>
      </Route>
      <Route path="/service-tech-academy">
        <Suspense fallback={<LoadingFallback />}>
          <ServiceTechAcademy />
        </Suspense>
      </Route>

      {/* Book & Content */}
      <Route path="/book">
        <Suspense fallback={<LoadingFallback />}>
          <Book />
        </Suspense>
      </Route>
      <Route path="/laundromat-bible">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatBible />
        </Suspense>
      </Route>
      <Route path="/playbook">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatBible />
        </Suspense>
      </Route>
      <Route path="/book-ad-preview">
        <Suspense fallback={<LoadingFallback />}>
          <BookAdPreview />
        </Suspense>
      </Route>
      <Route path="/doctrine">
        <Suspense fallback={<LoadingFallback />}>
          <Doctrine />
        </Suspense>
      </Route>

      {/* AI Features */}
      <Route path="/ai-blogging">
        <Suspense fallback={<LoadingFallback />}>
          <AIBlogging />
        </Suspense>
      </Route>
      <Route path="/seo-optimizer">
        <Suspense fallback={<LoadingFallback />}>
          <SEOOptimizer />
        </Suspense>
      </Route>
      <Route path="/seo">
        <Suspense fallback={<LoadingFallback />}>
          <SeoCommandCenter />
        </Suspense>
      </Route>
      <Route path="/seo-command-center">
        <Suspense fallback={<LoadingFallback />}>
          <SeoCommandCenter />
        </Suspense>
      </Route>
      <Route path="/ai-content-studio">
        <Suspense fallback={<LoadingFallback />}>
          <AIContentStudio />
        </Suspense>
      </Route>
      <Route path="/service-guy-ai">
        <Suspense fallback={<LoadingFallback />}>
          <ServiceGuyAI />
        </Suspense>
      </Route>
      <Route path="/service-guy-admin">
        <Suspense fallback={<LoadingFallback />}>
          <ServiceGuyAdmin />
        </Suspense>
      </Route>
      <Route path="/service-guy-demo">
        <Suspense fallback={<LoadingFallback />}>
          <ServiceGuyDemo />
        </Suspense>
      </Route>
      <Route path="/fault-classifier">
        <Suspense fallback={<LoadingFallback />}>
          <FaultClassifier />
        </Suspense>
      </Route>

      {/* Marketplace & Equipment */}
      <Route path="/marketplace">
        <Suspense fallback={<LoadingFallback />}>
          <Marketplace />
        </Suspense>
      </Route>
      <Route path="/buy-laundromat">
        <Suspense fallback={<LoadingFallback />}>
          <BuyLaundromat />
        </Suspense>
      </Route>
      <Route path="/brokers">
        <Suspense fallback={<LoadingFallback />}>
          <Brokers />
        </Suspense>
      </Route>
      <Route path="/marketplace-landing">
        <Suspense fallback={<LoadingFallback />}>
          <MarketplaceLanding />
        </Suspense>
      </Route>
      <Route path="/landing/roi-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <ROICalculatorLanding />
        </Suspense>
      </Route>
      <Route path="/landing/valuation-calculator">
        <Suspense fallback={<LoadingFallback />}>
          <ValuationCalculatorLanding />
        </Suspense>
      </Route>
      <Route path="/landing/utility-bill">
        <Suspense fallback={<LoadingFallback />}>
          <UtilityBillLanding />
        </Suspense>
      </Route>
      <Route path="/sell-laundromat/:state">
        <Suspense fallback={<LoadingFallback />}>
          <SellLaundromatStatePage />
        </Suspense>
      </Route>
      <Route path="/equipment">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentHub />
        </Suspense>
      </Route>
      <Route path="/equipment/blog">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentBlogList />
        </Suspense>
      </Route>
      <Route path="/equipment/blog/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentBlogPost />
        </Suspense>
      </Route>
      
      {/* Industry Events */}
      <Route path="/events">
        <Suspense fallback={<LoadingFallback />}>
          <IndustryEventsHub />
        </Suspense>
      </Route>
      <Route path="/events/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <IndustryEventDetail />
        </Suspense>
      </Route>
      
      <Route path="/equipment-marketplace">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentMarketplace />
        </Suspense>
      </Route>
      <Route path="/equipment/:id">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentDetail />
        </Suspense>
      </Route>
      <Route path="/equipment-matcher">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentMatcher />
        </Suspense>
      </Route>
      <Route path="/equipment-wizard">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentWizard />
        </Suspense>
      </Route>
      <Route path="/equipment-guides">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentGuides />
        </Suspense>
      </Route>
      <Route path="/parts-inventory">
        <Suspense fallback={<LoadingFallback />}>
          <PartsInventory />
        </Suspense>
      </Route>
      <Route path="/equipment-diagnostics">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentDiagnostics />
        </Suspense>
      </Route>
      <Route path="/list-equipment">
        <Suspense fallback={<LoadingFallback />}>
          <ListEquipment />
        </Suspense>
      </Route>
      <Route path="/list-supplies">
        <Suspense fallback={<LoadingFallback />}>
          <ListSupplies />
        </Suspense>
      </Route>
      <Route path="/list-services">
        <Suspense fallback={<LoadingFallback />}>
          <ListServices />
        </Suspense>
      </Route>
      <Route path="/list-on-washbizhub">
        <Suspense fallback={<LoadingFallback />}>
          <ListOnWashBizHub />
        </Suspense>
      </Route>

      {/* Classifieds - User-to-User Marketplace */}
      <Route path="/classifieds">
        <Suspense fallback={<LoadingFallback />}>
          <Classifieds />
        </Suspense>
      </Route>
      <Route path="/classifieds/submit">
        <Suspense fallback={<LoadingFallback />}>
          <ClassifiedsSubmit />
        </Suspense>
      </Route>

      {/* Parts & Repair */}
      <Route path="/parts">
        <Suspense fallback={<LoadingFallback />}>
          <Parts />
        </Suspense>
      </Route>
      <Route path="/parts-store">
        <Suspense fallback={<LoadingFallback />}>
          <PartsStore />
        </Suspense>
      </Route>
      <Route path="/parts-catalogue">
        <Suspense fallback={<LoadingFallback />}>
          <PartsCatalogue />
        </Suspense>
      </Route>
      <Route path="/repair-guide">
        <Suspense fallback={<LoadingFallback />}>
          <RepairGuide />
        </Suspense>
      </Route>
      <Route path="/error-codes">
        <Suspense fallback={<LoadingFallback />}>
          <ErrorCodes />
        </Suspense>
      </Route>
      <Route path="/error-codes/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <ErrorCodeDetail />
        </Suspense>
      </Route>
      <Route path="/error-scanner">
        <Suspense fallback={<LoadingFallback />}>
          <ErrorCodeScanner />
        </Suspense>
      </Route>
      
      {/* Utility Bill Auditor */}
      <Route path="/utility-bill-auditor">
        <Suspense fallback={<LoadingFallback />}>
          <UtilityBillAuditor />
        </Suspense>
      </Route>

      {/* Locator */}
      <Route path="/locator">
        <Suspense fallback={<LoadingFallback />}>
          <Locator />
        </Suspense>
      </Route>
      <Route path="/distributor-locator">
        <Suspense fallback={<LoadingFallback />}>
          <DistributorLocator />
        </Suspense>
      </Route>
      <Route path="/equipment-builder">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentBuilder />
        </Suspense>
      </Route>
      <Route path="/laundromat-locator">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatLocatorPage />
        </Suspense>
      </Route>

      {/* Subscription & Newsletter */}
      <Route path="/subscribe">
        <Suspense fallback={<LoadingFallback />}>
          <Subscribe />
        </Suspense>
      </Route>
      <Route path="/subscription-success">
        <Suspense fallback={<LoadingFallback />}>
          <SubscriptionSuccess />
        </Suspense>
      </Route>

      {/* Consultation */}
      <Route path="/consultation">
        <Suspense fallback={<LoadingFallback />}>
          <Consultation />
        </Suspense>
      </Route>
      <Route path="/consultation-landing">
        <Suspense fallback={<LoadingFallback />}>
          <ConsultationLanding />
        </Suspense>
      </Route>
      <Route path="/consultant-inquiry">
        <Suspense fallback={<LoadingFallback />}>
          <ConsultantInquiry />
        </Suspense>
      </Route>
      <Route path="/feedback">
        <Suspense fallback={<LoadingFallback />}>
          <Feedback />
        </Suspense>
      </Route>
      <Route path="/ai-consultation">
        <Suspense fallback={<LoadingFallback />}>
          <AIConsultationCouncil />
        </Suspense>
      </Route>
      <Route path="/larry-larsen">
        <Suspense fallback={<LoadingFallback />}>
          <LarryLarsen />
        </Suspense>
      </Route>
      <Route path="/larrys-academy">
        <Suspense fallback={<LoadingFallback />}>
          <LarrysAcademy />
        </Suspense>
      </Route>
      <Route path="/our-partnership">
        <Suspense fallback={<LoadingFallback />}>
          <OurPartnership />
        </Suspense>
      </Route>

      {/* Listings & Vendors */}
      <Route path="/listings">
        <Suspense fallback={<LoadingFallback />}>
          <ListingsHub />
        </Suspense>
      </Route>
      <Route path="/listings/:listingId">
        <Suspense fallback={<LoadingFallback />}>
          <ListingDetail />
        </Suspense>
      </Route>
      <Route path="/listing/:listingId">
        <Suspense fallback={<LoadingFallback />}>
          <ListingDetail />
        </Suspense>
      </Route>
      <Route path="/add-listing">
        <Suspense fallback={<LoadingFallback />}>
          <AddListing />
        </Suspense>
      </Route>
      <Route path="/sell">
        <Suspense fallback={<LoadingFallback />}>
          <SellYourLaundromat />
        </Suspense>
      </Route>
      <Route path="/sell-your-laundromat">
        <Suspense fallback={<LoadingFallback />}>
          <SellYourLaundromat />
        </Suspense>
      </Route>
      <Route path="/listing-form">
        <Suspense fallback={<LoadingFallback />}>
          <ListingForm />
        </Suspense>
      </Route>
      <Route path="/add-listing-from-image">
        <Suspense fallback={<LoadingFallback />}>
          <AddListingFromImage />
        </Suspense>
      </Route>
      
      {/* Business Directory */}
      <Route path="/directory">
        <Suspense fallback={<LoadingFallback />}>
          <Directory />
        </Suspense>
      </Route>
      <Route path="/directory/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <DirectoryListing />
        </Suspense>
      </Route>
      <Route path="/list-business">
        <Suspense fallback={<LoadingFallback />}>
          <ListBusiness />
        </Suspense>
      </Route>
      
      <Route path="/featured-listings">
        <Suspense fallback={<LoadingFallback />}>
          <FeaturedListings />
        </Suspense>
      </Route>
      <Route path="/laundromat-listings">
        <Suspense fallback={<LoadingFallback />}>
          <LaundromatListings />
        </Suspense>
      </Route>

      {/* Geo-targeted City Landing Pages for Local SEO - most specific first */}
      <Route path="/laundromats-for-sale/:state/:city">
        <Suspense fallback={<LoadingFallback />}>
          <CityLanding />
        </Suspense>
      </Route>
      
      {/* State SEO Landing Pages */}
      <Route path="/laundromats-for-sale/:state">
        {(params) => (
          <Suspense fallback={<LoadingFallback />}>
            <StateLanding stateSlug={params.state} />
          </Suspense>
        )}
      </Route>
      <Route path="/laundromats-for-sale">
        <Suspense fallback={<LoadingFallback />}>
          <StatesDirectory />
        </Suspense>
      </Route>
      <Route path="/cleanbi/:state/:city">
        <Suspense fallback={<LoadingFallback />}>
          <CityLanding />
        </Suspense>
      </Route>

      <Route path="/vendors">
        <Suspense fallback={<LoadingFallback />}>
          <VendorsHub />
        </Suspense>
      </Route>
      <Route path="/vendors/:storeSlug/products/:productSlug">
        <Suspense fallback={<LoadingFallback />}>
          <ProductDetail />
        </Suspense>
      </Route>
      <Route path="/vendors/:storeSlug">
        <Suspense fallback={<LoadingFallback />}>
          <VendorStorefront />
        </Suspense>
      </Route>
      <Route path="/vendor-form">
        <Suspense fallback={<LoadingFallback />}>
          <VendorForm />
        </Suspense>
      </Route>
      <Route path="/vendor-spotlight">
        <Suspense fallback={<LoadingFallback />}>
          <VendorSpotlight />
        </Suspense>
      </Route>

      {/* Advertising */}
      <Route path="/advertising">
        <Suspense fallback={<LoadingFallback />}>
          <Advertising />
        </Suspense>
      </Route>
      <Route path="/advertise">
        <Suspense fallback={<LoadingFallback />}>
          <Advertising />
        </Suspense>
      </Route>
      <Route path="/ad-builder">
        <Suspense fallback={<LoadingFallback />}>
          <AdBuilder />
        </Suspense>
      </Route>

      {/* Resources & Templates */}
      <Route path="/templates">
        <Suspense fallback={<LoadingFallback />}>
          <Templates />
        </Suspense>
      </Route>
      <Route path="/vault">
        <Suspense fallback={<LoadingFallback />}>
          <Vault />
        </Suspense>
      </Route>
      <Route path="/template-vault">
        <Suspense fallback={<LoadingFallback />}>
          <TemplateVault />
        </Suspense>
      </Route>
      <Route path="/vault/business-plan">
        <Suspense fallback={<LoadingFallback />}>
          <VaultBusinessPlan />
        </Suspense>
      </Route>
      <Route path="/vault/lease-checklist">
        <Suspense fallback={<LoadingFallback />}>
          <VaultLeaseChecklist />
        </Suspense>
      </Route>
      <Route path="/vault/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <VaultTemplateDetail />
        </Suspense>
      </Route>
      <Route path="/my-library">
        <Suspense fallback={<LoadingFallback />}>
          <UserLibrary />
        </Suspense>
      </Route>
      <Route path="/resources">
        <Suspense fallback={<LoadingFallback />}>
          <Resources />
        </Suspense>
      </Route>
      <Route path="/resources/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <ResourceDetail />
        </Suspense>
      </Route>

      {/* Social */}
      <Route path="/facebook-group">
        <Suspense fallback={<LoadingFallback />}>
          <FacebookGroup />
        </Suspense>
      </Route>
      <Route path="/atm-services">
        <Suspense fallback={<LoadingFallback />}>
          <AtmServices />
        </Suspense>
      </Route>
      <Route path="/affiliate-blogs">
        <Suspense fallback={<LoadingFallback />}>
          <AffiliateBlogsPage />
        </Suspense>
      </Route>

      {/* Forum */}
      <Route path="/forum">
        <Suspense fallback={<LoadingFallback />}>
          <Forum />
        </Suspense>
      </Route>
      <Route path="/forum/new">
        <Suspense fallback={<LoadingFallback />}>
          <ForumNewTopic />
        </Suspense>
      </Route>
      <Route path="/forum/category/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <ForumCategory />
        </Suspense>
      </Route>
      <Route path="/forum/topic/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <ForumTopic />
        </Suspense>
      </Route>

      {/* Direct Messages */}
      <Route path="/messages">
        <Suspense fallback={<LoadingFallback />}>
          <Messages />
        </Suspense>
      </Route>
      <Route path="/messages/:conversationId">
        <Suspense fallback={<LoadingFallback />}>
          <Messages />
        </Suspense>
      </Route>

      {/* Network / Community */}
      <Route path="/network">
        <Suspense fallback={<LoadingFallback />}>
          <Network />
        </Suspense>
      </Route>
      <Route path="/activity">
        <Suspense fallback={<LoadingFallback />}>
          <Activity />
        </Suspense>
      </Route>

      {/* User Dashboard */}
      <Route path="/dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard />
        </Suspense>
      </Route>
      <Route path="/my-dashboard">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <UserDashboard />
        </Suspense>
      </Route>
      
      {/* Operator Dashboard - Unified Command Center */}
      <Route path="/operator-dashboard">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <OperatorDashboard />
        </Suspense>
      </Route>
      <Route path="/command-center">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <CommandCenter />
        </Suspense>
      </Route>

      {/* User Profile */}
      <Route path="/profile/:username">
        <Suspense fallback={<LoadingFallback />}>
          <ProfilePage />
        </Suspense>
      </Route>

      {/* Saved Analyses */}
      <Route path="/saved-analyses">
        <Suspense fallback={<LoadingFallback />}>
          <SavedAnalyses />
        </Suspense>
      </Route>

      {/* Settings & Auth */}
      <Route path="/settings">
        <Suspense fallback={<LoadingFallback />}>
          <Settings />
        </Suspense>
      </Route>
      <Route path="/account/subscription">
        <Suspense fallback={<LoadingFallback />}>
          <AccountSubscription />
        </Suspense>
      </Route>
      
      {/* Buyer Engagement */}
      <Route path="/buyer/dashboard">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <BuyerDashboard />
        </Suspense>
      </Route>
      <Route path="/buyer/messages/:threadId">
        <Suspense fallback={<LoadingFallback />}>
          <BuyerMessaging />
        </Suspense>
      </Route>
      <Route path="/buyer/comparison/:comparisonId">
        <Suspense fallback={<LoadingFallback />}>
          <ListingComparison />
        </Suspense>
      </Route>
      <Route path="/login">
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      </Route>
      <Route path="/auth">
        <Suspense fallback={<LoadingFallback />}>
          <AuthPage />
        </Suspense>
      </Route>
      <Route path="/signin">
        <Suspense fallback={<LoadingFallback />}>
          <AuthPage />
        </Suspense>
      </Route>
      <Route path="/signup">
        <Suspense fallback={<LoadingFallback />}>
          <Signup />
        </Suspense>
      </Route>
      <Route path="/signed-out">
        <Suspense fallback={<LoadingFallback />}>
          <SignedOut />
        </Suspense>
      </Route>
      <Route path="/auth/verify">
        <Suspense fallback={<LoadingFallback />}>
          <AuthVerify />
        </Suspense>
      </Route>
      <Route path="/auth/callback">
        <Suspense fallback={<LoadingFallback />}>
          <AuthCallback />
        </Suspense>
      </Route>
      <Route path="/forgot-password">
        <Suspense fallback={<LoadingFallback />}>
          <ForgotPassword />
        </Suspense>
      </Route>
      <Route path="/verify-email">
        <Suspense fallback={<LoadingFallback />}>
          <VerifyEmail />
        </Suspense>
      </Route>

      {/* Legal */}
      <Route path="/privacy-policy">
        <Suspense fallback={<LoadingFallback />}>
          <PrivacyPolicy />
        </Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<LoadingFallback />}>
          <PrivacyPolicy />
        </Suspense>
      </Route>
      <Route path="/terms-of-service">
        <Suspense fallback={<LoadingFallback />}>
          <TermsOfService />
        </Suspense>
      </Route>
      <Route path="/terms">
        <Suspense fallback={<LoadingFallback />}>
          <TermsOfService />
        </Suspense>
      </Route>
      <Route path="/legal-disclaimer">
        <Suspense fallback={<LoadingFallback />}>
          <LegalDisclaimer />
        </Suspense>
      </Route>
      <Route path="/disclaimer">
        <Suspense fallback={<LoadingFallback />}>
          <LegalDisclaimer />
        </Suspense>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminDashboard />
        </Suspense>
      </Route>
      <Route path="/admin/ads">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminAds />
        </Suspense>
      </Route>
      <Route path="/admin/blog">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminBlog />
        </Suspense>
      </Route>
      <Route path="/admin/courses">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminCourses />
        </Suspense>
      </Route>
      <Route path="/admin/resources">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminResources />
        </Suspense>
      </Route>
      <Route path="/admin/marketplace">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminMarketplace />
        </Suspense>
      </Route>
      <Route path="/admin/forum">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminForum />
        </Suspense>
      </Route>
      <Route path="/admin/users">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminUsers />
        </Suspense>
      </Route>
      <Route path="/admin/analytics">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminAnalytics />
        </Suspense>
      </Route>
      <Route path="/admin/promo-codes">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminPromoCodes />
        </Suspense>
      </Route>
      <Route path="/admin/feedback">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminFeedbackDashboard />
        </Suspense>
      </Route>
      <Route path="/admin/settings">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminSettings />
        </Suspense>
      </Route>
      <Route path="/admin/indexing">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminIndexing />
        </Suspense>
      </Route>
      <Route path="/admin-login">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminLogin />
        </Suspense>
      </Route>
      <Route path="/admin/login">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminLogin />
        </Suspense>
      </Route>
      <Route path="/admin/dashboard">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <AdminCommandCenter />
        </Suspense>
      </Route>

      {/* SRA (Stroke Recovery App) Routes */}
      <Route path="/sra">
        <Suspense fallback={<LoadingFallback />}>
          <SRAHome />
        </Suspense>
      </Route>
      <Route path="/sra/pricing">
        <Suspense fallback={<LoadingFallback />}>
          <SRAPricing />
        </Suspense>
      </Route>
      <Route path="/sra/tracker">
        <Suspense fallback={<LoadingFallback />}>
          <SRATracker />
        </Suspense>
      </Route>
      <Route path="/sra/companion">
        <Suspense fallback={<LoadingFallback />}>
          <SRACompanion />
        </Suspense>
      </Route>
      <Route path="/sra/ghostwriting">
        <Suspense fallback={<LoadingFallback />}>
          <SRAGhostwriting />
        </Suspense>
      </Route>
      <Route path="/sra/store">
        <Suspense fallback={<LoadingFallback />}>
          <SRAStore />
        </Suspense>
      </Route>
      <Route path="/sra/community">
        <Suspense fallback={<LoadingFallback />}>
          <SRACommunity />
        </Suspense>
      </Route>
      <Route path="/sra/dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <SRADashboard />
        </Suspense>
      </Route>
      <Route path="/sra/marketplace">
        <Suspense fallback={<LoadingFallback />}>
          <SRAMarketplace />
        </Suspense>
      </Route>
      <Route path="/sra/factory">
        <Suspense fallback={<FullPageLoadingFallback />}>
          <SRAProductionConsole />
        </Suspense>
      </Route>

      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

const ROUTES_WITH_CUSTOM_FOOTER = new Set(['/']);

function AppContent() {
  usePageTracking();
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const fullScreenRoutes = ['/sra/factory', '/design-studio-pro', '/pos', '/admin/dashboard', '/admin/login', '/admin-login', '/cleanbi-explorer'];
  const isFullScreenApp = fullScreenRoutes.includes(location);
  const hasCustomFooter = ROUTES_WITH_CUSTOM_FOOTER.has(location);
  const hideChatWidget = location === '/service-guy-ai';
  
  if (isFullScreenApp) {
    return (
      <>
        <AdminBar />
        {isAuthenticated && user?.trialEndDate && (
          <TrialBanner trialEndDate={user.trialEndDate} />
        )}
        <ScrollToTop />
        <Suspense fallback={null}>
          <DeferredAnalytics />
        </Suspense>
        <RouteErrorBoundary>
          <PageTransition>
            <Suspense fallback={<FullPageLoadingFallback />}>
              <Router />
            </Suspense>
          </PageTransition>
        </RouteErrorBoundary>
      </>
    );
  }
  
  return (
    <>
      <AdminBar />
      {isAuthenticated && user?.trialEndDate && (
        <TrialBanner trialEndDate={user.trialEndDate} />
      )}
      <ScrollToTop />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(softwareApplicationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqPageSchema)}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <DeferredAnalytics />
        </Suspense>
        <PersonaHeader />
        <main id="main-content" role="main" className="flex-1">
          <RouteErrorBoundary>
            <PageTransition>
              <Suspense fallback={<LoadingFallback />}>
                <Router />
              </Suspense>
            </PageTransition>
          </RouteErrorBoundary>
        </main>
        {!hasCustomFooter && <Footer />}
      </div>
      {!hideChatWidget && <DeferredAIChatWidget />}
      <FloatingFeedbackButton />
      <StickyUpgradeBanner position="bottom" dismissible={true} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary variant="page" showError={process.env.NODE_ENV === "development"}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          {GOOGLE_CLIENT_ID ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <TenantProvider>
                <ThemeProvider>
                  <PersonaProvider>
                    <LocationDesignProvider>
                      <TooltipProvider>
                        <SignOutConfirmationProvider>
                          <AuthModalProvider>
                            <AppContent />
                            <Toaster />
                            <ExitIntentModal />
                            <FloatingCTA />
                            <LiveActivityNotification />
                          </AuthModalProvider>
                        </SignOutConfirmationProvider>
                      </TooltipProvider>
                    </LocationDesignProvider>
                  </PersonaProvider>
                </ThemeProvider>
              </TenantProvider>
            </GoogleOAuthProvider>
          ) : (
            <TenantProvider>
              <ThemeProvider>
                <PersonaProvider>
                  <LocationDesignProvider>
                    <TooltipProvider>
                      <SignOutConfirmationProvider>
                        <AuthModalProvider>
                          <AppContent />
                          <Toaster />
                          <ExitIntentModal />
                          <FloatingCTA />
                          <LiveActivityNotification />
                        </AuthModalProvider>
                      </SignOutConfirmationProvider>
                    </TooltipProvider>
                  </LocationDesignProvider>
                </PersonaProvider>
              </ThemeProvider>
            </TenantProvider>
          )}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
