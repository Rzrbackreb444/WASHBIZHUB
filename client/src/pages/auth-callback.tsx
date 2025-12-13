import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const REDIRECT_STORAGE_KEY = "washbizhub_auth_redirect";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, authResolved } = useAuth();
  const { toast } = useToast();
  const [hasError, setHasError] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (!authResolved || hasProcessed) return;

    const storedRedirect = sessionStorage.getItem(REDIRECT_STORAGE_KEY);
    const finalRedirect = storedRedirect || "/";

    if (isAuthenticated && user) {
      sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
      setHasProcessed(true);

      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.firstName || user.username || "User"}`,
      });

      setTimeout(() => {
        setLocation(finalRedirect);
      }, 100);
    } else {
      sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
      setHasProcessed(true);
      setHasError(true);
    }
  }, [authResolved, isAuthenticated, user, setLocation, toast, hasProcessed]);

  const handleRetry = () => {
    window.location.href = "/api/auth/cloudflare/login";
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  if (hasError) {
    return (
      <>
        <Helmet>
          <title>Authentication Error | WashBizHub</title>
        </Helmet>

        <div 
          className="min-h-screen bg-muted/30 flex items-center justify-center p-4"
          data-testid="auth-callback-error"
        >
          <Card className="bg-card border shadow-sm overflow-hidden max-w-md w-full">
            <div className="h-1 bg-red-500" />
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 
                className="text-xl font-bold text-foreground mb-2"
                data-testid="text-error-title"
              >
                Authentication Failed
              </h1>
              <p 
                className="text-muted-foreground mb-6"
                data-testid="text-error-message"
              >
                We couldn't complete your sign in. Please try again.
              </p>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleRetry}
                  className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                  data-testid="button-retry-login"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGoHome}
                  data-testid="button-go-home"
                >
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Signing In... | WashBizHub</title>
      </Helmet>

      <div 
        className="min-h-screen bg-muted/30 flex items-center justify-center p-4"
        data-testid="auth-callback-loading"
      >
        <div className="text-center">
          <Loader2 
            className="h-12 w-12 text-[#C8A661] animate-spin mx-auto mb-4" 
            data-testid="spinner-loading"
          />
          <p 
            className="text-lg font-medium text-foreground mb-1"
            data-testid="text-signing-in"
          >
            Signing you in...
          </p>
          <p 
            className="text-sm text-muted-foreground"
            data-testid="text-please-wait"
          >
            Please wait while we complete your authentication
          </p>
        </div>
      </div>
    </>
  );
}
