import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Footer } from "@/components/Footer";
import { AIChatWidget } from "@/components/AIChatWidget";
import { GoogleAnalytics, FacebookPixel, usePageTracking } from "@/components/Analytics";
import { useAuth } from "@/hooks/useAuth";
import { APIProvider } from "@vis.gl/react-google-maps";
import { LoadingFallback, FullPageLoadingFallback } from "@/components/LoadingFallback";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

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

// ============================================================================
// STATIC IMPORTS - Essential pages for SEO (kept in main bundle)
// ============================================================================
import Home from "@/pages/home-new";
import CleanBI from "@/pages/cleanbi";
import Pricing from "@/pages/pricing";
import Blog from "@/pages/blog";
import CoursesHub from "@/pages/courses-hub";
import AboutUs from "@/pages/about-us";
import WhyWashBizHub from "@/pages/why-washbizhub";
import NotFound from "@/pages/not-found";

// ============================================================================
// LAZY IMPORTS - Code split by feature area for optimal chunking
// ============================================================================

// Design Studio / 3D Features (heavy Three.js dependencies)
const DesignStudio = lazy(() => import("@/pages/design-studio"));
const DesignStudioPro = lazy(() => import("@/pages/design-studio-pro"));

// POS Command Center (large dashboard)
const POSCommandCenter = lazy(() => import("@/pages/pos-command-center"));
const PosLanding = lazy(() => import("@/pages/landing/pos-landing"));

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
const AdminIndexing = lazy(() => import("@/pages/admin-indexing"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminCommandCenter = lazy(() => import("@/pages/admin-dashboard"));

// AI Features
const AIBlogging = lazy(() => import("@/pages/ai-blogging"));
const SEOOptimizer = lazy(() => import("@/pages/seo-optimizer"));
const AIContentStudio = lazy(() => import("@/pages/ai-content-studio"));
const ServiceGuyAI = lazy(() => import("@/pages/service-guy-ai"));
const SeoCommandCenter = lazy(() => import("@/pages/seo-command-center"));

// Calculator Pages
const Calculator = lazy(() => import("@/pages/calculator"));
const ROICalculator = lazy(() => import("@/pages/roi-calculator"));
const ROICalculatorAdvanced = lazy(() => import("@/pages/roi-calculator-advanced"));
const ROICalculatorEnhanced = lazy(() => import("@/pages/roi-calculator-enhanced"));
const ValuationCalculator = lazy(() => import("@/pages/valuation-calculator"));
const TPDCalculator = lazy(() => import("@/pages/tpd-calculator"));
const CLEANBICalculator = lazy(() => import("@/pages/cleanbi-calculator"));
const LoanCalculator = lazy(() => import("@/pages/loan-calculator"));
const CalculatorsHub = lazy(() => import("@/pages/calculators"));
const CalculatorsSuite = lazy(() => import("@/pages/calculators-suite"));
const CalculatorBuilder = lazy(() => import("@/pages/calculator-builder"));
const CalculatorMarketplace = lazy(() => import("@/pages/calculator-marketplace"));

// Forum Pages
const Forum = lazy(() => import("@/pages/forum"));
const ForumCategory = lazy(() => import("@/pages/forum-category"));
const ForumTopic = lazy(() => import("@/pages/forum-topic"));
const ForumNewTopic = lazy(() => import("@/pages/forum-new-topic"));

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
const EquipmentMarketplace = lazy(() => import("@/pages/equipment-marketplace"));
const EquipmentMatcher = lazy(() => import("@/pages/equipment-matcher"));
const EquipmentDiagnostics = lazy(() => import("@/pages/equipment-diagnostics"));
const EquipmentFinancing = lazy(() => import("@/pages/equipment-financing"));
const ListEquipment = lazy(() => import("@/pages/list-equipment"));
const ListSupplies = lazy(() => import("@/pages/list-supplies"));

// Superstore
const Superstore = lazy(() => import("@/pages/superstore"));
const SuperstoreProduct = lazy(() => import("@/pages/superstore-product"));
const ProductComparison = lazy(() => import("@/pages/product-comparison"));
const BuyersGuides = lazy(() => import("@/pages/buyers-guides"));

// Website Builder
const WebsiteBuilder = lazy(() => import("@/pages/website-builder"));
const WebsiteTemplates = lazy(() => import("@/pages/website-templates"));

// Dashboards
const Dashboard = lazy(() => import("@/pages/dashboard"));
const OwnerDashboard = lazy(() => import("@/pages/owner-dashboard"));
const BusinessBuilder = lazy(() => import("@/pages/business-builder"));
const AffiliateDashboard = lazy(() => import("@/pages/affiliate-dashboard"));
const BrokerDashboard = lazy(() => import("@/pages/broker-dashboard"));
const VendorDashboard = lazy(() => import("@/pages/vendor-dashboard"));

// Courses & Learning
const Courses = lazy(() => import("@/pages/courses"));
const CourseDetail = lazy(() => import("@/pages/course-detail"));
const Lesson = lazy(() => import("@/pages/lesson"));
const LearningPage = lazy(() => import("@/pages/learning"));
const CoursesLanding = lazy(() => import("@/pages/landing/courses-landing"));

// Funding Pages
const FundingMatcher = lazy(() => import("@/pages/funding-matcher"));
const Funding = lazy(() => import("@/pages/funding"));
const RealEstateFinancing = lazy(() => import("@/pages/real-estate-financing"));
const GoKapital = lazy(() => import("@/pages/gokapital"));
const WorkingCapitalFinancing = lazy(() => import("@/pages/working-capital-financing"));
const StartupFunding = lazy(() => import("@/pages/startup-funding"));
const AcquisitionsFunding = lazy(() => import("@/pages/acquisitions-funding"));

// Listings & Vendors
const ListingsHub = lazy(() => import("@/pages/listings-hub"));
const VendorsHub = lazy(() => import("@/pages/vendors-hub"));
const ListingForm = lazy(() => import("@/pages/listing-form"));
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

// Parts & Repair
const Parts = lazy(() => import("@/pages/parts"));
const PartsStore = lazy(() => import("@/pages/parts-store"));
const PartsCatalogue = lazy(() => import("@/pages/parts-catalogue"));
const RepairGuide = lazy(() => import("@/pages/repair-guide"));
const ErrorCodes = lazy(() => import("@/pages/error-codes"));
const ErrorCodeDetail = lazy(() => import("@/pages/error-code-detail"));

// Locator Pages
const Locator = lazy(() => import("@/pages/locator"));
const DistributorLocator = lazy(() => import("@/pages/distributor-locator"));
const LaundromatLocatorPage = lazy(() => import("@/pages/laundromat-locator"));

// Advertising
const Advertising = lazy(() => import("@/pages/advertising"));
const AdBuilder = lazy(() => import("@/pages/ad-builder"));

// Consultation & Partners
const ConsultantInquiry = lazy(() => import("@/pages/consultant-inquiry"));
const Consultation = lazy(() => import("@/pages/consultation"));
const ConsultationLanding = lazy(() => import("@/pages/consultation-landing"));
const InsurancePartners = lazy(() => import("@/pages/insurance-partners"));

// Order & Londr
const LaundryOrderPortal = lazy(() => import("@/pages/laundry-order-portal"));
const LondrDemo = lazy(() => import("@/pages/londr-demo"));
const LondrPartnership = lazy(() => import("@/pages/londr-partnership"));

// CLEANBI Auto
const CleanbiAuto = lazy(() => import("@/pages/cleanbi-auto"));

// Customer Portal
const CustomerPortal = lazy(() => import("@/pages/customer-portal"));

// Other Pages
const Book = lazy(() => import("@/pages/book"));
const BookAdPreview = lazy(() => import("@/pages/book-ad-preview"));
const Doctrine = lazy(() => import("@/pages/doctrine"));
const Subscribe = lazy(() => import("@/pages/subscribe"));
const FacebookGroup = lazy(() => import("@/pages/FacebookGroup"));
const AtmServices = lazy(() => import("@/pages/AtmServices"));
const Templates = lazy(() => import("@/pages/templates"));
const Vault = lazy(() => import("@/pages/vault"));
const Resources = lazy(() => import("@/pages/resources"));
const ResourceDetail = lazy(() => import("@/pages/resource-detail"));
const Settings = lazy(() => import("@/pages/settings"));
const Login = lazy(() => import("@/pages/login"));
const AffiliateBlogsPage = lazy(() => import("@/pages/affiliate-blogs"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy"));
const TermsOfService = lazy(() => import("@/pages/terms"));
const MarketplaceLanding = lazy(() => import("@/pages/landing/marketplace-landing"));
const PlanPage = lazy(() => import("@/pages/plan"));
const EvaluatePage = lazy(() => import("@/pages/evaluate"));
const OperatePage = lazy(() => import("@/pages/operate"));
const PartnerPage = lazy(() => import("@/pages/partner"));

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Static routes - essential for SEO */}
      <Route path="/" component={Home} />
      <Route path="/cleanbi" component={CleanBI} />
      <Route path="/cleanbi-tool" component={CleanBI} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/blog" component={Blog} />
      <Route path="/courses" component={CoursesHub} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/about" component={AboutUs} />
      <Route path="/why-washbizhub" component={WhyWashBizHub} />

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
      <Route path="/pos-landing">
        <Suspense fallback={<LoadingFallback />}>
          <PosLanding />
        </Suspense>
      </Route>

      {/* CLEANBI Auto */}
      <Route path="/cleanbi-auto">
        <Suspense fallback={<LoadingFallback />}>
          <CleanbiAuto />
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

      {/* Dashboards */}
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
      <Route path="/vendor-dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <VendorDashboard />
        </Suspense>
      </Route>

      {/* Order & Londr */}
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
      <Route path="/demo/londr">
        <Suspense fallback={<LoadingFallback />}>
          <LondrDemo />
        </Suspense>
      </Route>
      <Route path="/londr-demo">
        <Suspense fallback={<LoadingFallback />}>
          <LondrDemo />
        </Suspense>
      </Route>
      <Route path="/londr">
        <Suspense fallback={<LoadingFallback />}>
          <LondrPartnership />
        </Suspense>
      </Route>
      <Route path="/partners/londr">
        <Suspense fallback={<LoadingFallback />}>
          <LondrPartnership />
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

      {/* Funding */}
      <Route path="/funding-matcher">
        <Suspense fallback={<LoadingFallback />}>
          <FundingMatcher />
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
      <Route path="/acquisitions-funding">
        <Suspense fallback={<LoadingFallback />}>
          <AcquisitionsFunding />
        </Suspense>
      </Route>
      <Route path="/insurance-partners">
        <Suspense fallback={<LoadingFallback />}>
          <InsurancePartners />
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

      {/* Book & Content */}
      <Route path="/book">
        <Suspense fallback={<LoadingFallback />}>
          <Book />
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

      {/* Marketplace & Equipment */}
      <Route path="/marketplace">
        <Suspense fallback={<LoadingFallback />}>
          <Marketplace />
        </Suspense>
      </Route>
      <Route path="/marketplace-landing">
        <Suspense fallback={<LoadingFallback />}>
          <MarketplaceLanding />
        </Suspense>
      </Route>
      <Route path="/equipment">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentMarketplace />
        </Suspense>
      </Route>
      <Route path="/equipment-marketplace">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentMarketplace />
        </Suspense>
      </Route>
      <Route path="/equipment-matcher">
        <Suspense fallback={<LoadingFallback />}>
          <EquipmentMatcher />
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
      <Route path="/listing-form">
        <Suspense fallback={<LoadingFallback />}>
          <ListingForm />
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

      {/* User Dashboard */}
      <Route path="/dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard />
        </Suspense>
      </Route>

      {/* Settings & Auth */}
      <Route path="/settings">
        <Suspense fallback={<LoadingFallback />}>
          <Settings />
        </Suspense>
      </Route>
      <Route path="/login">
        <Suspense fallback={<LoadingFallback />}>
          <Login />
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

function AppContent() {
  usePageTracking();
  const [location] = useLocation();
  
  const fullScreenRoutes = ['/sra/factory', '/design-studio-pro', '/pos', '/admin/dashboard', '/admin/login', '/admin-login'];
  const isFullScreenApp = fullScreenRoutes.includes(location);
  
  if (isFullScreenApp) {
    return (
      <>
        <GoogleAnalytics />
        <FacebookPixel />
        <RouteErrorBoundary>
          <Suspense fallback={<FullPageLoadingFallback />}>
            <Router />
          </Suspense>
        </RouteErrorBoundary>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <GoogleAnalytics />
        <FacebookPixel />
        <NavigationMenu />
        <div className="flex-1">
          <RouteErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Router />
            </Suspense>
          </RouteErrorBoundary>
        </div>
        <Footer />
      </div>
      <AIChatWidget />
    </>
  );
}

function App() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <ThemeProvider>
            <TooltipProvider>
              <APIProvider apiKey={googleMapsApiKey}>
                <AppContent />
                <Toaster />
              </APIProvider>
            </TooltipProvider>
          </ThemeProvider>
        </TenantProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
