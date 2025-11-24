import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Footer } from "@/components/Footer";
import { AIChatWidget } from "@/components/AIChatWidget";
import { GoogleAnalytics, FacebookPixel, usePageTracking } from "@/components/Analytics";
import { useAuth } from "@/hooks/useAuth";
import { APIProvider } from "@vis.gl/react-google-maps";
import Home from "@/pages/home";
import WhyWashBizHub from "@/pages/why-washbizhub";
import DesignStudio from "@/pages/design-studio";
import CleanBI from "@/pages/cleanbi";
import Calculator from "@/pages/calculator";
import ROICalculator from "@/pages/roi-calculator";
import FundingMatcher from "@/pages/funding-matcher";
import Superstore from "@/pages/superstore";
import SuperstoreProduct from "@/pages/superstore-product";
import ProductComparison from "@/pages/product-comparison";
import BuyersGuides from "@/pages/buyers-guides";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import CoursesHub from "@/pages/courses-hub";
import ListingsHub from "@/pages/listings-hub";
import VendorsHub from "@/pages/vendors-hub";
import Advertising from "@/pages/advertising";
import AdBuilder from "@/pages/ad-builder";
import PartsCatalogue from "@/pages/parts-catalogue";
import VendorDashboard from "@/pages/vendor-dashboard";
import ListingForm from "@/pages/listing-form";
import VendorForm from "@/pages/vendor-form";
import ConsultantInquiry from "@/pages/consultant-inquiry";
import ListingDetail from "@/pages/listing-detail";
import FeaturedListings from "@/pages/featured-listings";
import VendorSpotlight from "@/pages/vendor-spotlight";
import AboutUs from "@/pages/about-us";
import Funding from "@/pages/funding";
import EquipmentFinancing from "@/pages/equipment-financing";
import RealEstateFinancing from "@/pages/real-estate-financing";
import WorkingCapitalFinancing from "@/pages/working-capital-financing";
import StartupFunding from "@/pages/startup-funding";
import AcquisitionsFunding from "@/pages/acquisitions-funding";
import LoanCalculator from "@/pages/loan-calculator";
import InsurancePartners from "@/pages/insurance-partners";
import Book from "@/pages/book";
import AIBlogging from "@/pages/ai-blogging";
import SEOOptimizer from "@/pages/seo-optimizer";
import Blog from "@/pages/blog";
import Marketplace from "@/pages/marketplace";
import Parts from "@/pages/parts";
import PartsStore from "@/pages/parts-store";
import Locator from "@/pages/locator";
import DistributorLocator from "@/pages/distributor-locator";
import Subscribe from "@/pages/subscribe";
import Consultation from "@/pages/consultation";
import Listings from "@/pages/listings";
import Lesson from "@/pages/lesson";
import FacebookGroup from "@/pages/FacebookGroup";
import AtmServices from "@/pages/AtmServices";
import Templates from "@/pages/templates";
import Resources from "@/pages/resources";
import ResourceDetail from "@/pages/resource-detail";
import Vendors from "@/pages/vendors";
import VendorStorefront from "@/pages/vendor-store";
import ProductDetail from "@/pages/product-detail";
import CalculatorsHub from "@/pages/calculators";
import WebsiteBuilder from "@/pages/website-builder";
import WebsiteTemplates from "@/pages/website-templates";
import AffiliateDashboard from "@/pages/affiliate-dashboard";
import BrokerDashboard from "@/pages/broker-dashboard";
import Forum from "@/pages/forum";
import ForumCategory from "@/pages/forum-category";
import ForumTopic from "@/pages/forum-topic";
import Settings from "@/pages/settings";
import Pricing from "@/pages/pricing";
import RepairGuide from "@/pages/repair-guide";
import SeoCommandCenter from "@/pages/seo-command-center";
import AdminDashboard from "@/pages/admin/index";
import AdminAds from "@/pages/admin/ads";
import AdminBlog from "@/pages/admin/blog";
import AdminCourses from "@/pages/admin/courses";
import AdminResources from "@/pages/admin/resources";
import AdminMarketplace from "@/pages/admin/marketplace";
import AdminForum from "@/pages/admin/forum";
import AdminUsers from "@/pages/admin/users";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSettings from "@/pages/admin/settings";
import AdminIndexing from "@/pages/admin-indexing";
import LaundromatListings from "@/pages/laundromat-listings";
import EquipmentMarketplace from "@/pages/equipment-marketplace";
import LearningPage from "@/pages/learning";
import MarketplaceLanding from "@/pages/landing/marketplace-landing";
import PosLanding from "@/pages/landing/pos-landing";
import CoursesLanding from "@/pages/landing/courses-landing";
import LaundromatLocatorPage from "@/pages/laundromat-locator";
import DesignStudioPro from "@/pages/design-studio-pro";
import Login from "@/pages/login";
import AdminLogin from "@/pages/admin-login";
import ValuationCalculator from "@/pages/valuation-calculator";
import EquipmentDiagnostics from "@/pages/equipment-diagnostics";
import TPDCalculator from "@/pages/tpd-calculator";
import CLEANBICalculator from "@/pages/cleanbi-calculator";
import CleanbiAuto from "@/pages/cleanbi-auto";
import ROICalculatorAdvanced from "@/pages/roi-calculator-advanced";
import ROICalculatorEnhanced from "@/pages/roi-calculator-enhanced";
import AffiliateBlogsPage from "@/pages/affiliate-blogs";
import ConsultationLanding from "@/pages/consultation-landing";
import BookAdPreview from "@/pages/book-ad-preview";
import PrivacyPolicy from "@/pages/privacy";
import TermsOfService from "@/pages/terms";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show home page while loading or if not authenticated
  // Once authenticated, show all routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/why-washbizhub" component={WhyWashBizHub} />
      <Route path="/design-studio" component={DesignStudio} />
      <Route path="/cleanbi" component={CleanBI} />
      <Route path="/cleanbi-auto" component={CleanbiAuto} />
      <Route path="/calculators" component={CalculatorsHub} />
      <Route path="/calc/:slug" component={CalculatorsHub} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/roi-calculator" component={ROICalculator} />
      <Route path="/website-builder" component={WebsiteBuilder} />
      <Route path="/website-templates" component={WebsiteTemplates} />
      <Route path="/funding-matcher" component={FundingMatcher} />
      <Route path="/superstore" component={Superstore} />
      <Route path="/superstore/product/:asin" component={SuperstoreProduct} />
      <Route path="/superstore/compare" component={ProductComparison} />
      <Route path="/buyers-guides" component={BuyersGuides} />
      <Route path="/courses" component={CoursesHub} />
      <Route path="/courses/:courseId" component={CourseDetail} />
      <Route path="/courses/:courseId/lessons/:lessonId" component={Lesson} />
      <Route path="/book" component={Book} />
      <Route path="/book-ad-preview" component={BookAdPreview} />
      <Route path="/ai-blogging" component={AIBlogging} />
      <Route path="/seo-optimizer" component={SEOOptimizer} />
      <Route path="/seo" component={SeoCommandCenter} />
      <Route path="/blog" component={Blog} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/parts" component={Parts} />
      <Route path="/locator" component={Locator} />
      <Route path="/distributor-locator" component={DistributorLocator} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/listings" component={ListingsHub} />
      <Route path="/templates" component={Templates} />
      <Route path="/resources" component={Resources} />
      <Route path="/resources/:slug" component={ResourceDetail} />
      <Route path="/vendors" component={VendorsHub} />
      <Route path="/vendors/:storeSlug/products/:productSlug" component={ProductDetail} />
      <Route path="/vendors/:storeSlug" component={VendorStorefront} />
      <Route path="/advertising" component={Advertising} />
      <Route path="/ad-builder" component={AdBuilder} />
      <Route path="/parts-catalogue" component={PartsCatalogue} />
      <Route path="/vendor-dashboard" component={VendorDashboard} />
      <Route path="/listing-form" component={ListingForm} />
      <Route path="/vendor-form" component={VendorForm} />
      <Route path="/consultant-inquiry" component={ConsultantInquiry} />
      <Route path="/listings/:listingId" component={ListingDetail} />
      <Route path="/featured-listings" component={FeaturedListings} />
      <Route path="/vendor-spotlight" component={VendorSpotlight} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/funding" component={Funding} />
      <Route path="/equipment-financing" component={EquipmentFinancing} />
      <Route path="/real-estate-financing" component={RealEstateFinancing} />
      <Route path="/working-capital-financing" component={WorkingCapitalFinancing} />
      <Route path="/startup-funding" component={StartupFunding} />
      <Route path="/acquisitions-funding" component={AcquisitionsFunding} />
      <Route path="/loan-calculator" component={LoanCalculator} />
      <Route path="/insurance-partners" component={InsurancePartners} />
      <Route path="/facebook-group" component={FacebookGroup} />
      <Route path="/atm-services" component={AtmServices} />
      <Route path="/affiliate" component={AffiliateDashboard} />
      <Route path="/broker" component={BrokerDashboard} />
      <Route path="/forum" component={Forum} />
      <Route path="/forum/category/:slug" component={ForumCategory} />
      <Route path="/forum/topic/:slug" component={ForumTopic} />
      <Route path="/settings" component={Settings} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/repair-guide" component={RepairGuide} />
      <Route path="/about" component={AboutUs} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/ads" component={AdminAds} />
      <Route path="/admin/blog" component={AdminBlog} />
      <Route path="/admin/courses" component={AdminCourses} />
      <Route path="/admin/resources" component={AdminResources} />
      <Route path="/admin/marketplace" component={AdminMarketplace} />
      <Route path="/admin/forum" component={AdminForum} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/indexing" component={AdminIndexing} />
      <Route path="/laundromat-listings" component={LaundromatListings} />
      <Route path="/equipment" component={EquipmentMarketplace} />
      <Route path="/learning" component={LearningPage} />
      <Route path="/marketplace-landing" component={MarketplaceLanding} />
      <Route path="/pos-landing" component={PosLanding} />
      <Route path="/courses-landing" component={CoursesLanding} />
      <Route path="/laundromat-locator" component={LaundromatLocatorPage} />
      <Route path="/design-studio-pro" component={DesignStudioPro} />
      <Route path="/login" component={Login} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/valuation-calculator" component={ValuationCalculator} />
      <Route path="/equipment-diagnostics" component={EquipmentDiagnostics} />
      <Route path="/tpd-calculator" component={TPDCalculator} />
      <Route path="/cleanbi-calculator" component={CLEANBICalculator} />
      <Route path="/roi-calculator-advanced" component={ROICalculatorAdvanced} />
      <Route path="/roi-calculator-enhanced" component={ROICalculatorEnhanced} />
      <Route path="/affiliate-blogs" component={AffiliateBlogsPage} />
      <Route path="/consultation-landing" component={ConsultationLanding} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  usePageTracking(); // Track page views on route changes
  
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <GoogleAnalytics />
        <FacebookPixel />
        <NavigationMenu />
        <div className="flex-1">
          <Router />
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
        <ThemeProvider>
          <TooltipProvider>
            <APIProvider apiKey={googleMapsApiKey}>
              <AppContent />
              <Toaster />
            </APIProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
