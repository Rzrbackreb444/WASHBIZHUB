import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { 
  UserPlus, LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, User, 
  CheckCircle2, Sparkles, Loader2, ArrowRight, Shield, Users,
  Star, TrendingUp, Calculator, BookOpen, BarChart3
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

function SignupSkeleton() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, hsl(210 57% 15% / 0.03) 0%, hsl(43 89% 38% / 0.05) 50%, hsl(210 57% 15% / 0.03) 100%)"
      }}
      data-testid="skeleton-signup"
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            </div>
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
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

const signupFaqs = [
  {
    question: "How do I create a WashBizHub account?",
    answer: "You can create a free account using your email with a password, a secure passwordless magic link, or by continuing with Google for instant sign-up."
  },
  {
    question: "Is WashBizHub free to use?",
    answer: "Yes! WashBizHub offers a generous free tier that includes 1 CLEANBI analysis per day, access to all calculators, community forum access, and educational resources."
  },
  {
    question: "What do I get with a free account?",
    answer: "Free accounts include daily CLEANBI location analysis, access to ROI calculators, valuation tools, the community forum, educational courses, and marketplace browsing."
  },
  {
    question: "Is my information secure when signing up?",
    answer: "Absolutely! WashBizHub uses bank-level 256-bit SSL encryption and SOC 2 compliant infrastructure to protect your account and personal information."
  }
];

const signupStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Create Free WashBizHub Account",
  "description": "Join 72,000+ laundromat professionals. Create your free WashBizHub account for CLEANBI scoring, calculators, courses, and marketplace access.",
  "url": "https://washbizhub.com/signup",
  "mainEntity": {
    "@type": "WebApplication",
    "name": "WashBizHub",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier with daily CLEANBI analysis, calculators, and community access"
    }
  },
  "potentialAction": {
    "@type": "RegisterAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://washbizhub.com/signup",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    },
    "description": "Create a free WashBizHub account to access laundromat business tools"
  }
};

const freeTierBenefits = [
  { 
    icon: BarChart3, 
    text: "1 CLEANBI analysis daily",
    description: "AI-powered location scoring"
  },
  { 
    icon: Calculator, 
    text: "All calculators & tools",
    description: "ROI, valuation, and more"
  },
  { 
    icon: Users, 
    text: "Community forum access",
    description: "Connect with 72K+ pros"
  },
  { 
    icon: BookOpen, 
    text: "Educational resources",
    description: "Courses and guides"
  }
];

export default function Signup() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleReplitSignup = useCallback(() => {
    window.location.href = "/api/login";
  }, []);

  const handleEmailSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/email/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      toast({
        title: "Welcome to WashBizHub!",
        description: "Your account has been created successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, confirmPassword, firstName, lastName, toast, setLocation]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const breadcrumbs = useMemo(() => [
    { name: "Home", url: "/" },
    { name: "Create Account", url: "/signup" }
  ], []);

  const passwordStrength = useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return { label: "Too short", color: "text-red-500", bgColor: "bg-red-500" };
    if (password.length < 12) return { label: "Good", color: "text-amber-500", bgColor: "bg-amber-500" };
    return { label: "Strong", color: "text-green-500", bgColor: "bg-green-500" };
  }, [password]);

  const passwordsMatch = useMemo(() => {
    return confirmPassword && password === confirmPassword;
  }, [password, confirmPassword]);

  if (isLoading) {
    return <SignupSkeleton />;
  }

  return (
    <>
      <SEO
        title="Create Free Account - Join 72,000+ Laundromat Professionals"
        description="Sign up for WashBizHub free. Get CLEANBI location scoring, ROI calculators, valuation tools, educational courses, and marketplace access. Join 72,000+ laundromat owners, investors, and brokers."
        canonicalUrl="/signup"
        ogType="website"
        keywords={[
          "washbizhub signup",
          "laundromat software free",
          "cleanbi account",
          "laundromat business tools",
          "laundromat owner registration",
          "free laundromat calculators"
        ]}
        breadcrumbs={breadcrumbs}
        faqs={signupFaqs}
        structuredData={signupStructuredData}
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
                className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center shadow-lg"
                aria-hidden="true"
              >
                <UserPlus className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Get Started Free</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Join 72,000+ laundromat professionals
            </p>
          </motion.div>

          <motion.div variants={fadeInItem}>
            <Card className="shadow-lg border-border/50">
              <CardHeader className="pb-4 space-y-1">
                <CardTitle className="text-xl">Create Your Account</CardTitle>
                <CardDescription>Choose your preferred sign up method</CardDescription>
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
                      className="h-9 text-sm min-h-[44px]"
                      data-testid="tab-password"
                    >
                      <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                      Email & Password
                    </TabsTrigger>
                    <TabsTrigger 
                      value="magic-link" 
                      className="h-9 text-sm min-h-[44px]"
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
                              className="pl-10 h-11 min-h-[44px]"
                              disabled={isSendingMagicLink}
                              autoComplete="email"
                              inputMode="email"
                              aria-describedby="magic-link-description"
                              data-testid="input-magic-email"
                              required
                            />
                          </div>
                          <p id="magic-link-description" className="sr-only">
                            Enter your email to receive a secure magic link for passwordless sign up
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 min-h-[44px] text-base font-semibold"
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
                          className="mt-4 h-10 min-h-[44px]"
                          data-testid="button-resend-magic-link"
                        >
                          Send another link
                        </Button>
                      </motion.div>
                    )}
                  </TabsContent>

                  <TabsContent value="password" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium">
                            First Name
                          </Label>
                          <div className="relative">
                            <User 
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                              aria-hidden="true" 
                            />
                            <Input
                              id="firstName"
                              type="text"
                              placeholder="John"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="pl-10 h-11 min-h-[44px]"
                              disabled={isSubmitting}
                              autoComplete="given-name"
                              data-testid="input-firstname"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-11 min-h-[44px]"
                            disabled={isSubmitting}
                            autoComplete="family-name"
                            data-testid="input-lastname"
                          />
                        </div>
                      </div>

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
                            className="pl-10 h-11 min-h-[44px]"
                            disabled={isSubmitting}
                            autoComplete="email"
                            inputMode="email"
                            data-testid="input-email"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock 
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                            aria-hidden="true" 
                          />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-11 min-h-[44px]"
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            aria-describedby="password-strength"
                            data-testid="input-password"
                            required
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1.5"
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
                        {passwordStrength && (
                          <div id="password-strength" className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: passwordStrength.label === "Too short" ? "33%" : 
                                         passwordStrength.label === "Good" ? "66%" : "100%" 
                                }}
                                className={`h-full ${passwordStrength.bgColor} rounded-full`}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock 
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                            aria-hidden="true" 
                          />
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 h-11 min-h-[44px]"
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            data-testid="input-confirm-password"
                            required
                          />
                          {passwordsMatch && (
                            <CheckCircle2 
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" 
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 min-h-[44px] text-base font-semibold"
                        disabled={isSubmitting}
                        data-testid="button-signup-email"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                            Create Account
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
                  onClick={handleReplitSignup}
                  variant="outline"
                  className="w-full h-11 min-h-[44px] text-base font-medium"
                  data-testid="button-signup-google"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-xs text-center text-muted-foreground leading-relaxed">
                  By signing up, you agree to our{" "}
                  <Link 
                    href="/terms" 
                    className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                    data-testid="link-terms"
                  >
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link 
                    href="/privacy" 
                    className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                    data-testid="link-privacy"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInItem}>
            <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent shadow-sm">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-accent fill-accent" aria-hidden="true" />
                  <span className="font-semibold text-sm">Free Tier Benefits</span>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    No Credit Card
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {freeTierBenefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-4 h-4 text-accent" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{benefit.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
              <TrendingUp className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>72K+ Users</span>
            </div>
          </motion.div>

          <motion.p 
            variants={fadeInItem}
            className="text-center text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
              data-testid="link-login"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
