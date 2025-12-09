import { createContext, useContext, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

function AuthModalContent({ isOpen, onClose }: AuthModalContentProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleContinueWithReplit = () => {
    setIsRedirecting(true);
    
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl && currentUrl !== "/") {
      sessionStorage.setItem(REDIRECT_STORAGE_KEY, currentUrl);
    }
    
    window.location.href = "/api/login";
  };

  const benefits = [
    {
      icon: Save,
      title: "Save Your Analyses",
      description: "Keep track of all your CLEANBI scores"
    },
    {
      icon: TrendingUp,
      title: "Premium Tools",
      description: "Unlock advanced calculators & reports"
    },
    {
      icon: Star,
      title: "Personalized Dashboard",
      description: "Track saved listings and alerts"
    },
    {
      icon: Shield,
      title: "Exclusive Content",
      description: "Member-only guides & resources"
    }
  ];

  const authProviders = [
    { icon: SiGoogle, label: "Google" },
    { icon: SiGithub, label: "GitHub" },
    { icon: SiApple, label: "Apple" },
    { icon: MdEmail, label: "Email" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden"
        data-testid="auth-modal"
      >
        <div className="h-1 bg-[#C8A661]" />
        
        <div className="p-6">
          <DialogHeader className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img 
                src="/washbizhub-logo.png" 
                alt="WashBizHub Logo" 
                className="h-12 w-auto"
                data-testid="img-modal-logo"
              />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground" data-testid="text-modal-title">
              Sign in to Continue
            </DialogTitle>
            <DialogDescription className="text-muted-foreground" data-testid="text-modal-description">
              Unlock the full power of WashBizHub
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                  data-testid={`modal-benefit-${index}`}
                >
                  <div className="h-7 w-7 rounded-md bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-[#C8A661]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-xs leading-tight">
                      {benefit.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={handleContinueWithReplit}
            disabled={isRedirecting}
            className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white h-11 text-sm font-semibold mb-4"
            data-testid="button-modal-continue-replit"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Redirecting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Continue with Replit
              </>
            )}
          </Button>

          <div className="text-center mb-4">
            <p className="text-[10px] text-muted-foreground mb-2">
              Sign in using your preferred method
            </p>
            <div className="flex items-center justify-center gap-3">
              {authProviders.map((provider, index) => {
                const Icon = provider.icon;
                return (
                  <div
                    key={index}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                    title={provider.label}
                    data-testid={`modal-icon-provider-${provider.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#C8A661] flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Secure & Private</span> - Your data is encrypted and never shared
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground">
            By signing in, you agree to our{" "}
            <a 
              href="/terms" 
              className="text-[#C8A661] hover:underline"
              data-testid="modal-link-terms"
            >
              Terms
            </a>{" "}
            and{" "}
            <a 
              href="/privacy" 
              className="text-[#C8A661] hover:underline"
              data-testid="modal-link-privacy"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModalProvider;
