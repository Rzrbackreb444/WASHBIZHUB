import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import DesignStudio from "@/pages/design-studio";
import CleanBI from "@/pages/cleanbi";
import Calculator from "@/pages/calculator";
import ROICalculator from "@/pages/roi-calculator";
import FundingMatcher from "@/pages/funding-matcher";
import Superstore from "@/pages/superstore";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Book from "@/pages/book";
import AIBlogging from "@/pages/ai-blogging";
import SEOOptimizer from "@/pages/seo-optimizer";
import Blog from "@/pages/blog";
import Marketplace from "@/pages/marketplace";
import Parts from "@/pages/parts";
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
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show home page while loading or if not authenticated
  // Once authenticated, show all routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/design-studio" component={DesignStudio} />
      <Route path="/cleanbi" component={CleanBI} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/roi-calculator" component={ROICalculator} />
      <Route path="/funding-matcher" component={FundingMatcher} />
      <Route path="/superstore" component={Superstore} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:courseId" component={CourseDetail} />
      <Route path="/courses/:courseId/lessons/:lessonId" component={Lesson} />
      <Route path="/book" component={Book} />
      <Route path="/ai-blogging" component={AIBlogging} />
      <Route path="/seo-optimizer" component={SEOOptimizer} />
      <Route path="/blog" component={Blog} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/parts" component={Parts} />
      <Route path="/locator" component={Locator} />
      <Route path="/distributor-locator" component={DistributorLocator} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/listings" component={Listings} />
      <Route path="/templates" component={Templates} />
      <Route path="/resources" component={Resources} />
      <Route path="/facebook-group" component={FacebookGroup} />
      <Route path="/atm-services" component={AtmServices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1">
            <Router />
          </div>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
