import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import Home from "@/pages/home";
import DesignStudio from "@/pages/design-studio";
import CleanBI from "@/pages/cleanbi";
import Calculator from "@/pages/calculator";
import Blog from "@/pages/blog";
import Marketplace from "@/pages/marketplace";
import Parts from "@/pages/parts";
import Locator from "@/pages/locator";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/design-studio" component={DesignStudio} />
      <Route path="/cleanbi" component={CleanBI} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/blog" component={Blog} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/parts" component={Parts} />
      <Route path="/locator" component={Locator} />
      <Route path="/subscribe" component={Subscribe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          <Header />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
