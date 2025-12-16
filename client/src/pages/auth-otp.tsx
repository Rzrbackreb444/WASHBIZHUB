import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { SecurityBadge, TrustIndicator, DataProtectionNotice } from "@/components/SecurityBadges";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, ArrowRight, ArrowLeft, Loader2, Shield, CheckCircle, 
  Lock, Users, Sparkles, RefreshCw, KeyRound
} from "lucide-react";
import { SiGoogle } from "react-icons/si";

type AuthStep = "email" | "otp" | "success";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const RESEND_COOLDOWN = 60;

export default function AuthOTPPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState("");

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setLocation("/");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 2) return email;
    return `${local[0]}${"*".repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}@${domain}`;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleRequestOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address");
      return;
    }
    
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (isSubmitting) return;
    
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Failed to send verification code");
        return;
      }

      setMaskedEmail(maskEmail(trimmedEmail));
      setResendCooldown(RESEND_COOLDOWN);
      setStep("otp");
      
      toast({
        title: "Code sent!",
        description: "Check your email for the 6-digit verification code.",
      });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, toast]);

  const handleVerifyOTP = useCallback(async (code: string) => {
    if (code.length !== 6) return;
    
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Invalid or expired code");
        setOtp("");
        return;
      }

      setStep("success");
      
      toast({
        title: "Welcome to WashBizHub!",
        description: "You've successfully signed in.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      setTimeout(() => {
        setLocation("/");
      }, 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, toast, setLocation]);

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return;
    
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendCooldown(RESEND_COOLDOWN);
        toast({
          title: "New code sent!",
          description: "Check your email for the new verification code.",
        });
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, resendCooldown, toast]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      handleVerifyOTP(value);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A661]" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Sign In | WashBizHub - Secure Authentication"
        description="Sign in to WashBizHub with enterprise-grade security. Access CLEANBI scoring, POS systems, and laundromat business tools."
        canonicalUrl="/auth"
      />

      <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-muted/30">
        <motion.div 
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Card className="bg-card border shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#0A1628] via-[#C8A661] to-[#0A1628]" />
            
            <CardContent className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {step === "email" && (
                  <motion.div
                    key="email-step"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="text-center mb-8">
                      <div className="h-16 w-16 rounded-2xl bg-[#0A1628] flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <KeyRound className="h-8 w-8 text-[#C8A661]" />
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Welcome to WashBizHub
                      </h1>
                      <p className="text-muted-foreground">
                        The #1 Platform for Laundromat Professionals
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      {[
                        { icon: Shield, text: "Bank-grade 256-bit encryption" },
                        { icon: Lock, text: "No password to remember" },
                        { icon: Sparkles, text: "Sign in with a simple code" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
                            <item.icon className="h-4 w-4 text-[#0A1628]" />
                          </div>
                          <span className="text-sm text-muted-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleRequestOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 text-base"
                            disabled={isSubmitting}
                            autoComplete="email"
                            data-testid="input-email"
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          {error}
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                        disabled={isSubmitting || !email.trim() || !isValidEmail(email)}
                        data-testid="button-send-code"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending Code...
                          </>
                        ) : (
                          <>
                            Continue with Email
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground">or</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full h-12 text-base font-medium gap-3"
                      onClick={handleGoogleLogin}
                      data-testid="button-google-login"
                    >
                      <SiGoogle className="h-5 w-5" />
                      Continue with Google
                    </Button>

                    <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <TrustIndicator icon={Shield} text="256-bit SSL" variant="success" />
                      <TrustIndicator icon={Lock} text="PCI Compliant" variant="success" />
                    </div>
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp-step"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <button
                      onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                      data-testid="button-back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>

                    <div className="text-center mb-8">
                      <div className="h-16 w-16 rounded-full bg-[#C8A661]/10 flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-8 w-8 text-[#C8A661]" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Check Your Email
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        We sent a 6-digit code to
                      </p>
                      <p className="font-medium text-foreground">{maskedEmail}</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={handleOTPChange}
                          disabled={isSubmitting}
                          data-testid="input-otp"
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} className="h-14 w-12 text-xl font-bold border-[#0A1628]/20" />
                            <InputOTPSlot index={1} className="h-14 w-12 text-xl font-bold border-[#0A1628]/20" />
                            <InputOTPSlot index={2} className="h-14 w-12 text-xl font-bold border-[#0A1628]/20" />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} className="h-14 w-12 text-xl font-bold border-[#0A1628]/20" />
                            <InputOTPSlot index={4} className="h-14 w-12 text-xl font-bold border-[#0A1628]/20" />
                            <InputOTPSlot index={5} className="h-14 w-12 text-xl font-bold border-[#0A1628]/20" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2 justify-center"
                        >
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          {error}
                        </motion.div>
                      )}

                      {isSubmitting && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </div>
                      )}

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Didn't receive the code?
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResendCode}
                          disabled={resendCooldown > 0 || isSubmitting}
                          className="text-[#C8A661] hover:text-[#B8964F]"
                          data-testid="button-resend"
                        >
                          {resendCooldown > 0 ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Resend in {resendCooldown}s
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Resend Code
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Secure Verification</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            This code expires in 10 minutes and can only be used once.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    key="success-step"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Welcome Back!
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      You're now signed in to WashBizHub
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to dashboard...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <motion.div 
            variants={fadeIn}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">
              Trusted by <span className="text-[#C8A661] font-semibold">73,000+</span> laundromat professionals
            </p>
            <div className="flex items-center justify-center gap-3">
              <SecurityBadge variant="pci" size="sm" />
              <SecurityBadge variant="ssl" size="sm" />
              <SecurityBadge variant="soc2" size="sm" />
            </div>
          </motion.div>

          <motion.p 
            variants={fadeIn}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-[#C8A661] hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-[#C8A661] hover:underline">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
