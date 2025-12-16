import { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, User, 
  CheckCircle2, Sparkles, Loader2, ArrowRight, Shield, Users,
  Star, TrendingUp, BarChart3, Palette, MessageSquare, Wrench
} from "lucide-react";
import { SiGoogle } from "react-icons/si";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms of Service and Privacy Policy"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof signupSchema>;

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

const benefits = [
  { 
    icon: BarChart3, 
    title: "Access CLEANBI",
    description: "AI-powered location scoring & analysis"
  },
  { 
    icon: Palette, 
    title: "Design Studio",
    description: "3D laundromat layout visualization"
  },
  { 
    icon: MessageSquare, 
    title: "Expert Community",
    description: "Connect with 73,000+ professionals"
  },
  { 
    icon: Wrench, 
    title: "Premium Tools",
    description: "Calculators, courses & resources"
  }
];

function getPasswordStrength(password: string): { 
  label: string; 
  color: string; 
  bgColor: string; 
  progress: number 
} {
  if (!password) return { label: "", color: "", bgColor: "", progress: 0 };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return { 
    label: "Weak", 
    color: "text-red-600", 
    bgColor: "bg-red-500", 
    progress: 33 
  };
  if (score <= 4) return { 
    label: "Medium", 
    color: "text-amber-600", 
    bgColor: "bg-amber-500", 
    progress: 66 
  };
  return { 
    label: "Strong", 
    color: "text-green-600", 
    bgColor: "bg-green-500", 
    progress: 100 
  };
}

export default function Signup() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false
    }
  });

  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: ""
    }
  });

  const watchPassword = form.watch("password");
  const passwordStrength = useMemo(() => getPasswordStrength(watchPassword), [watchPassword]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleGoogleSignup = useCallback(() => {
    window.location.href = "/api/auth/google/login";
  }, []);

  const handleMagicLinkRequest = useCallback(async (data: MagicLinkFormData) => {
    setIsSendingMagicLink(true);
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to send magic link",
          variant: "destructive"
        });
        return;
      }

      setMagicLinkSent(true);
      toast({
        title: "Check your email!",
        description: "We've sent you a magic link to sign in.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingMagicLink(false);
    }
  }, [toast]);

  const onSubmit = useCallback(async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Registration Failed",
          description: result.error || "Unable to create account",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });

      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (err) {
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4" data-testid="loading-signup">
        <Loader2 className="h-12 w-12 text-[#C8A661] animate-spin" />
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <>
        <Helmet>
          <title>Check Your Email | WashBizHub</title>
          <meta name="description" content="Please verify your email to complete registration and join WashBizHub." />
        </Helmet>

        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 md:p-8" data-testid="signup-success-page">
          <div className="w-full max-w-md">
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-success-title">
                  Check Your Email
                </h1>
                <p className="text-muted-foreground mb-2">
                  We've sent a verification link to
                </p>
                <p className="font-semibold text-foreground mb-6" data-testid="text-registered-email">
                  {registeredEmail}
                </p>

                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-sm mb-3">What's next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Check your inbox for the verification email
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Click the verification link in the email
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      You'll be automatically signed in
                    </li>
                  </ul>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-11 mb-4"
                  onClick={() => {
                    setRegistrationSuccess(false);
                    form.reset();
                  }}
                  data-testid="button-use-different-email"
                >
                  Use a different email
                </Button>

                <p className="text-sm text-muted-foreground">
                  Already verified?{" "}
                  <Link href="/login" className="text-[#C8A661] hover:underline font-medium" data-testid="link-signin">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign Up - Join 73,000+ Laundromat Professionals | WashBizHub</title>
        <meta name="description" content="Create your free WashBizHub account. Access CLEANBI location scoring, ROI calculators, Design Studio, and connect with 73,000+ laundromat professionals." />
        <meta property="og:title" content="Join the #1 Laundromat Community | WashBizHub" />
        <meta property="og:description" content="Sign up for free and access CLEANBI, Design Studio, expert community, and premium tools." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://washbizhub.com/signup" />
      </Helmet>

      <div className="min-h-screen bg-muted/30" data-testid="signup-page">
        <div className="bg-[#0A1628] py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Badge className="bg-[#C8A661] text-[#0A1628] mb-4" data-testid="badge-welcome">
              <Star className="w-3 h-3 mr-1.5 fill-current" />
              Free to Join
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="text-hero-title">
              Join the #1 Laundromat Community
            </h1>
            
            <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Where laundromat dreams become reality. Get the tools, insights, and community you need to succeed.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8" data-testid="hero-stats">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#C8A661]" />
                <span className="text-white font-semibold">73,000+</span>
                <span className="text-gray-400">Professionals</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-gray-600" />
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#C8A661]" />
                <span className="text-white font-semibold">$50M+</span>
                <span className="text-gray-400">Analyzed</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-gray-600" />
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-[#C8A661]" />
                <span className="text-white font-semibold">15+</span>
                <span className="text-gray-400">Pro Tools</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-8 pb-16">
          <Card className="bg-card border shadow-sm overflow-hidden" data-testid="signup-card">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-6 md:p-8">
              <Button
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 font-semibold text-base mb-4 gap-3"
                onClick={() => window.location.href = "/api/auth/google/login"}
                data-testid="button-google-signup"
              >
                <SiGoogle className="h-5 w-5 text-[#4285F4]" />
                Continue with Google
              </Button>

              <div className="flex items-center justify-center gap-3 mb-6">
                <Button
                  variant={showMagicLink ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMagicLink(true)}
                  className={showMagicLink ? "bg-[#0A1628]" : ""}
                  data-testid="button-toggle-magic-link"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Magic Link
                </Button>
                <Button
                  variant={!showMagicLink ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMagicLink(false)}
                  className={!showMagicLink ? "bg-[#0A1628]" : ""}
                  data-testid="button-toggle-email"
                >
                  <Mail className="h-4 w-4 mr-1.5" />
                  Email & Password
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">
                    or sign up with email
                  </span>
                </div>
              </div>

              {showMagicLink ? (
                magicLinkSent ? (
                  <div className="text-center py-6" data-testid="magic-link-sent">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Check your email!</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      We sent a magic link to{" "}
                      <span className="font-medium text-foreground">{magicLinkForm.getValues("email")}</span>
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setMagicLinkSent(false)}
                      data-testid="button-send-another-link"
                    >
                      Send another link
                    </Button>
                  </div>
                ) : (
                  <Form {...magicLinkForm}>
                    <form onSubmit={magicLinkForm.handleSubmit(handleMagicLinkRequest)} className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-center mb-4">
                        <Sparkles className="h-8 w-8 text-[#C8A661] mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No password needed! We'll email you a secure link to sign in instantly.
                        </p>
                      </div>

                      <FormField
                        control={magicLinkForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="you@example.com"
                                  className="pl-10 h-11"
                                  disabled={isSendingMagicLink}
                                  data-testid="input-magic-link-email"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#0A1628] hover:bg-[#1a3a5c] text-white font-semibold"
                        disabled={isSendingMagicLink}
                        data-testid="button-send-magic-link"
                      >
                        {isSendingMagicLink ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Magic Link
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  placeholder="John"
                                  className="pl-10 h-11"
                                  disabled={isSubmitting}
                                  data-testid="input-firstname"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Doe"
                                className="h-11"
                                disabled={isSubmitting}
                                data-testid="input-lastname"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10 h-11"
                                disabled={isSubmitting}
                                data-testid="input-email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                className="pl-10 pr-10 h-11"
                                disabled={isSubmitting}
                                data-testid="input-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                data-testid="button-toggle-password-visibility"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          {watchPassword && (
                            <div className="space-y-1 mt-2" data-testid="password-strength-meter">
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${passwordStrength.bgColor}`}
                                  style={{ width: `${passwordStrength.progress}%` }}
                                />
                              </div>
                              <p className={`text-xs font-medium ${passwordStrength.color}`}>
                                Password strength: {passwordStrength.label}
                              </p>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className="pl-10 pr-10 h-11"
                                disabled={isSubmitting}
                                data-testid="input-confirm-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                data-testid="button-toggle-confirm-password-visibility"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                              data-testid="checkbox-accept-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              I agree to the{" "}
                              <Link href="/terms" className="text-[#C8A661] hover:underline" data-testid="link-terms">
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-[#C8A661] hover:underline" data-testid="link-privacy">
                                Privacy Policy
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#0A1628] hover:bg-[#1a3a5c] text-white font-semibold text-base"
                      disabled={isSubmitting}
                      data-testid="button-create-account"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Free Account
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6" data-testid="text-signin-link">
                Already have an account?{" "}
                <Link href="/login" className="text-[#C8A661] hover:underline font-medium" data-testid="link-signin">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm mt-6" data-testid="benefits-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-[#C8A661] fill-current" />
                <span className="font-semibold">What You Get</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs">
                  Free Access
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                    data-testid={`benefit-${index}`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-5 w-5 text-[#C8A661]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{benefit.title}</h3>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-muted-foreground" data-testid="trust-signals">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-600" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#C8A661]" />
              <span>73K+ Trusted</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
