import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { 
  Lock, LogIn, Mail, Eye, EyeOff, AlertCircle, Sparkles, 
  Loader2, ArrowRight, Shield, Users, CheckCircle2, KeyRound
} from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const fadeInItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

function LoginSkeleton() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, hsl(210 57% 15% / 0.03) 0%, hsl(43 89% 38% / 0.05) 50%, hsl(210 57% 15% / 0.03) 100%)"
      }}
      data-testid="skeleton-login"
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-px flex-1" />
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

const loginFaqs = [
  {
    question: "How do I sign in to WashBizHub?",
    answer: "You can sign in using your email and password, a secure magic link sent to your email, or continue with Google for quick access."
  },
  {
    question: "Is my login information secure?",
    answer: "Yes, WashBizHub uses bank-level 256-bit SSL encryption and secure authentication protocols to protect your account. We never store passwords in plain text."
  },
  {
    question: "What if I forgot my password?",
    answer: "Click the 'Forgot password?' link on the login page, enter your email, and we'll send you a secure link to reset your password."
  },
  {
    question: "Can I use WashBizHub on mobile devices?",
    answer: "Absolutely! WashBizHub is fully responsive and works seamlessly on smartphones, tablets, and desktop computers."
  }
];

const loginStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Sign In to WashBizHub",
  "description": "Secure login to WashBizHub - The #1 laundromat business platform. Access CLEANBI scoring, calculators, courses, and marketplace.",
  "url": "https://washbizhub.com/login",
  "mainEntity": {
    "@type": "WebApplication",
    "name": "WashBizHub",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  },
  "potentialAction": {
    "@type": "LoginAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://washbizhub.com/login",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    },
    "description": "Sign in to your WashBizHub account"
  }
};

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleMagicLinkRequest = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSendingMagicLink(true);

    try {
      const response = await fetch("/api/auth/email/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicLinkEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send magic link");
        return;
      }

      setMagicLinkSent(true);
      toast({
        title: "Check your email!",
        description: "We've sent you a magic link to sign in.",
      });
    } catch (err) {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsSendingMagicLink(false);
    }
  }, [magicLinkEmail, toast]);

  const handleReplitLogin = useCallback(() => {
    window.location.href = "/api/login";
  }, []);

  const handleEmailLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, toast, setLocation]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const breadcrumbs = useMemo(() => [
    { name: "Home", url: "/" },
    { name: "Sign In", url: "/login" }
  ], []);

  if (isLoading) {
    return <LoginSkeleton />;
  }

  return (
    <>
      <SEO
        title="Sign In to WashBizHub - Secure Account Login"
        description="Sign in to your WashBizHub account. Access CLEANBI scoring, laundromat calculators, courses, marketplace listings, and AI-powered business tools. Secure login with email, magic link, or Google."
        canonicalUrl="/login"
        ogType="website"
        keywords={[
          "washbizhub login",
          "laundromat software login",
          "cleanbi sign in",
          "laundromat business tools",
          "laundromat owner portal"
        ]}
        breadcrumbs={breadcrumbs}
        faqs={loginFaqs}
        structuredData={loginStructuredData}
      />

      <div 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
        style={{
          background: "linear-gradient(135deg, hsl(210 57% 15% / 0.03) 0%, hsl(43 89% 38% / 0.05) 50%, hsl(210 57% 15% / 0.03) 100%)"
        }}
      >
        <motion.div 
          className="w-full max-w-md space-y-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div 
            className="text-center space-y-3"
            variants={fadeIn}
          >
            <div className="flex justify-center">
              <div 
                className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg"
                aria-hidden="true"
              >
                <KeyRound className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Sign in to your WashBizHub account
            </p>
          </motion.div>

          <motion.div variants={fadeInItem}>
            <Card className="shadow-lg border-border/50">
              <CardHeader className="pb-4 space-y-1">
                <CardTitle className="text-xl">Sign In</CardTitle>
                <CardDescription>Choose your preferred sign in method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <Tabs defaultValue="password" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger 
                      value="password" 
                      className="h-9 text-sm"
                      data-testid="tab-password"
                    >
                      <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                      Email & Password
                    </TabsTrigger>
                    <TabsTrigger 
                      value="magic-link" 
                      className="h-9 text-sm"
                      data-testid="tab-magic-link"
                    >
                      <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                      Magic Link
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="magic-link" className="space-y-4 mt-4">
                    {!magicLinkSent ? (
                      <form onSubmit={handleMagicLinkRequest} className="space-y-4">
                        <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                          <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" aria-hidden="true" />
                          <p className="text-sm text-muted-foreground">
                            No password needed! We'll email you a secure link to sign in instantly.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="magicEmail" className="text-sm font-medium">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail 
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                              aria-hidden="true" 
                            />
                            <Input
                              id="magicEmail"
                              type="email"
                              placeholder="you@example.com"
                              value={magicLinkEmail}
                              onChange={(e) => setMagicLinkEmail(e.target.value)}
                              className="pl-10 h-11"
                              disabled={isSendingMagicLink}
                              autoComplete="email"
                              inputMode="email"
                              aria-describedby="magic-link-description"
                              data-testid="input-magic-email"
                              required
                            />
                          </div>
                          <p id="magic-link-description" className="sr-only">
                            Enter your email to receive a secure magic link
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 text-base font-semibold"
                          disabled={isSendingMagicLink || !magicLinkEmail}
                          data-testid="button-send-magic-link"
                        >
                          {isSendingMagicLink ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Magic Link
                              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 space-y-4"
                      >
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Check your email!</h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            We sent a magic link to{" "}
                            <span className="font-medium text-foreground">{magicLinkEmail}</span>
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Click the link in the email to sign in. The link expires in 15 minutes.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => setMagicLinkSent(false)}
                          className="mt-4 h-10"
                          data-testid="button-resend-magic-link"
                        >
                          Send another link
                        </Button>
                      </motion.div>
                    )}
                  </TabsContent>

                  <TabsContent value="password" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail 
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                            aria-hidden="true" 
                          />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-11"
                            disabled={isSubmitting}
                            autoComplete="email"
                            inputMode="email"
                            data-testid="input-email"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="password" className="text-sm font-medium">
                            Password
                          </Label>
                          <Link 
                            href="/forgot-password" 
                            className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
                            data-testid="link-forgot-password"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock 
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                            aria-hidden="true" 
                          />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-11"
                            disabled={isSubmitting}
                            autoComplete="current-password"
                            data-testid="input-password"
                            required
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <Eye className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-semibold"
                        disabled={isSubmitting}
                        data-testid="button-login-email"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleReplitLogin}
                  variant="outline"
                  className="w-full h-11 text-base font-medium"
                  data-testid="button-login-google"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            variants={fadeInItem}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-500" aria-hidden="true" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" aria-hidden="true" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>72K+ Users</span>
            </div>
          </motion.div>

          <motion.p 
            variants={fadeInItem}
            className="text-center text-sm text-muted-foreground"
          >
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
              data-testid="link-signup"
            >
              Create one for free
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
