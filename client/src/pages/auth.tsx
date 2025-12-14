import { useEffect, useState } from "react";
import { useLocation, useSearch, Redirect } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Shield, 
  TrendingUp, 
  Star, 
  Save,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { MdEmail } from "react-icons/md";

const REDIRECT_STORAGE_KEY = "washbizhub_auth_redirect";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { user, isLoading, isAuthenticated, authResolved } = useAuth();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const params = new URLSearchParams(searchString);
  const redirectUrl = params.get("redirect") || "/";

  useEffect(() => {
    if (authResolved && isAuthenticated && user) {
      const storedRedirect = sessionStorage.getItem(REDIRECT_STORAGE_KEY);
      const finalRedirect = storedRedirect || redirectUrl || "/";
      sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
      
      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.firstName || user.username || "User"}`,
      });
      
      setLocation(finalRedirect);
    }
  }, [authResolved, isAuthenticated, user, redirectUrl, setLocation, toast]);

  const handleContinueWithGoogle = () => {
    setIsRedirecting(true);
    
    const redirect = redirectUrl && redirectUrl !== "/" 
      ? `?redirect=${encodeURIComponent(redirectUrl)}`
      : "";
    
    window.location.href = `/api/auth/cloudflare/login${redirect}`;
  };

  if (isLoading || !authResolved) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4" data-testid="auth-loading">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#C8A661] animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect to={redirectUrl} />;
  }

  const benefits = [
    {
      icon: Save,
      title: "Save Your Analyses",
      description: "Keep track of all your CLEANBI location scores and comparisons"
    },
    {
      icon: TrendingUp,
      title: "Access Premium Tools",
      description: "Unlock advanced calculators, reports, and market insights"
    },
    {
      icon: Star,
      title: "Personalized Dashboard",
      description: "Track your journey with saved listings and custom alerts"
    },
    {
      icon: Shield,
      title: "Exclusive Content",
      description: "Get access to member-only guides, courses, and resources"
    }
  ];

  const authProviders = [
    { icon: SiGoogle, label: "Google" },
    { icon: SiGithub, label: "GitHub" },
    { icon: SiApple, label: "Apple" },
    { icon: MdEmail, label: "Email" }
  ];

  return (
    <>
      <Helmet>
        <title>Sign In | WashBizHub</title>
        <meta name="description" content="Sign in to WashBizHub to save analyses, access premium features, and unlock the full power of the #1 laundromat business platform." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 md:p-8" data-testid="auth-page">
        <div className="w-full max-w-lg">
          <Card className="bg-card border shadow-sm overflow-hidden" data-testid="auth-card">
            <div className="h-1 bg-[#C8A661]" />
            
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-8">
                <img 
                  src="/washbizhub-logo.png" 
                  alt="WashBizHub Logo" 
                  className="h-16 w-auto mx-auto mb-6"
                  data-testid="img-logo"
                />
                
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="text-welcome">
                  Welcome to WashBizHub
                </h1>
                <p className="text-muted-foreground" data-testid="text-subtitle">
                  The #1 Platform for Laundromat Professionals
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-start gap-3"
                      data-testid={`benefit-${index}`}
                    >
                      <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-[#C8A661]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">
                          {benefit.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={handleContinueWithGoogle}
                disabled={isRedirecting}
                className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white h-12 text-base font-semibold mb-4"
                data-testid="button-continue-google"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <SiGoogle className="h-5 w-5 mr-2" />
                    Continue with Google or OTP
                  </>
                )}
              </Button>

              <div className="text-center mb-6">
                <p className="text-xs text-muted-foreground mb-3">
                  Sign in using your preferred method
                </p>
                <div className="flex items-center justify-center gap-4">
                  {authProviders.map((provider, index) => {
                    const Icon = provider.icon;
                    return (
                      <div
                        key={index}
                        className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"
                        title={provider.label}
                        data-testid={`icon-provider-${provider.label.toLowerCase()}`}
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground font-medium">
                      Secure & Private
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your data is encrypted and never shared. We respect your privacy.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                By signing in, you agree to our{" "}
                <a 
                  href="/terms" 
                  className="text-[#C8A661] hover:underline"
                  data-testid="link-terms"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a 
                  href="/privacy" 
                  className="text-[#C8A661] hover:underline"
                  data-testid="link-privacy"
                >
                  Privacy Policy
                </a>
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6" data-testid="text-trusted">
            Trusted by <span className="text-[#C8A661] font-semibold">73,000+</span> laundromat professionals worldwide
          </p>
        </div>
      </div>
    </>
  );
}
