import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Shield, 
  TrendingUp, 
  Star, 
  Save,
  Mail,
  ArrowLeft,
  CheckCircle,
  Lock
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthModalContextType {
  isOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}

interface AuthModalProviderProps {
  children: React.ReactNode;
}

export function AuthModalProvider({ children }: AuthModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openAuthModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, openAuthModal, closeAuthModal }}>
      {children}
      <AuthModalContent isOpen={isOpen} onClose={closeAuthModal} />
    </AuthModalContext.Provider>
  );
}

interface AuthModalContentProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'choose' | 'email' | 'otp' | 'success';

function AuthModalContent({ isOpen, onClose }: AuthModalContentProps) {
  const [step, setStep] = useState<AuthStep>('choose');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('choose');
        setEmail('');
        setOtpCode(['', '', '', '', '', '']);
        setError('');
      }, 300);
    }
  }, [isOpen]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    const currentUrl = window.location.pathname + window.location.search;
    const redirect = currentUrl && currentUrl !== "/" 
      ? `?redirect=${encodeURIComponent(currentUrl)}`
      : "";
    window.location.href = `/api/auth/google/login${redirect}`;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/otp/request", { email });
      const data = await response.json();
      
      if (data.success) {
        setStep('otp');
        toast({
          title: "Check your email",
          description: "We've sent a 6-digit code to verify your identity.",
        });
      } else {
        setError(data.error || "Failed to send code");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtpCode(newOtp);
      verifyOTP(pasted);
    }
  };

  const verifyOTP = async (code: string) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/otp/verify", { email, code });
      const data = await response.json();
      
      if (data.success) {
        setStep('success');
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        setTimeout(() => {
          onClose();
          toast({
            title: "Welcome back!",
            description: "You're now signed in to WashBizHub.",
          });
        }, 1500);
      } else {
        setError(data.error || "Invalid code");
        setOtpCode(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
      setOtpCode(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Save, title: "Save Analyses", description: "Track your CLEANBI scores" },
    { icon: TrendingUp, title: "Premium Tools", description: "Advanced calculators" },
    { icon: Star, title: "Dashboard", description: "Personalized insights" },
    { icon: Shield, title: "Exclusive", description: "Member-only content" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden border-0"
        data-testid="auth-modal"
      >
        {/* Gold accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#C8A661] via-[#E5C990] to-[#C8A661]" />
        
        <div className="p-6">
          {/* STEP: Choose Method */}
          {step === 'choose' && (
            <>
              <DialogHeader className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#0A1628] to-[#1a3a5c] flex items-center justify-center">
                    <Lock className="h-7 w-7 text-[#C8A661]" />
                  </div>
                </div>
                <DialogTitle className="text-xl font-bold" data-testid="text-modal-title">
                  Sign in to WashBizHub
                </DialogTitle>
                <DialogDescription className="text-muted-foreground" data-testid="text-modal-description">
                  Secure access to the #1 laundromat platform
                </DialogDescription>
              </DialogHeader>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg"
                      data-testid={`modal-benefit-${index}`}
                    >
                      <div className="h-6 w-6 rounded-md bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                        <Icon className="h-3 w-3 text-[#C8A661]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-xs">{benefit.title}</h3>
                        <p className="text-[10px] text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-11 text-sm font-medium"
                  data-testid="button-google-login"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <SiGoogle className="h-4 w-4 mr-2" />
                      Continue with Google
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep('email')}
                  className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white h-11 text-sm font-medium"
                  data-testid="button-email-login"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Continue with Email
                </Button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                <span>Secured with enterprise-grade encryption</span>
              </div>
            </>
          )}

          {/* STEP: Email Input */}
          {step === 'email' && (
            <>
              <button
                onClick={() => setStep('choose')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <DialogHeader className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#0A1628] to-[#1a3a5c] flex items-center justify-center">
                    <Mail className="h-7 w-7 text-[#C8A661]" />
                  </div>
                </div>
                <DialogTitle className="text-xl font-bold">
                  Enter your email
                </DialogTitle>
                <DialogDescription>
                  We'll send you a secure 6-digit code
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 text-center text-base"
                    required
                    autoFocus
                    data-testid="input-email"
                  />
                  {error && (
                    <p className="text-sm text-destructive mt-2 text-center">{error}</p>
                  )}
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-[#C8A661] hover:bg-[#B8965A] text-black h-11 text-sm font-semibold"
                  data-testid="button-send-code"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending code...
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                No password needed. We'll email you a secure one-time code.
              </p>
            </>
          )}

          {/* STEP: OTP Verification */}
          {step === 'otp' && (
            <>
              <button
                onClick={() => setStep('email')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                data-testid="button-back-otp"
              >
                <ArrowLeft className="h-4 w-4" />
                Change email
              </button>

              <DialogHeader className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                </div>
                <DialogTitle className="text-xl font-bold">
                  Enter verification code
                </DialogTitle>
                <DialogDescription>
                  Sent to <span className="font-medium text-foreground">{email}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* OTP Input Grid */}
                <div 
                  className="flex justify-center gap-2"
                  onPaste={handleOTPPaste}
                >
                  {otpCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={el => otpRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-11 h-14 text-center text-2xl font-bold"
                      autoFocus={index === 0}
                      data-testid={`input-otp-${index}`}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={isLoading}
                    className="text-sm text-[#C8A661] hover:underline"
                    data-testid="button-resend-code"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Code expires in 10 minutes. Check spam folder if not received.
              </p>
            </>
          )}

          {/* STEP: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-pulse">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <DialogTitle className="text-xl font-bold mb-2">
                Welcome back!
              </DialogTitle>
              <DialogDescription>
                You're now signed in to WashBizHub
              </DialogDescription>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
