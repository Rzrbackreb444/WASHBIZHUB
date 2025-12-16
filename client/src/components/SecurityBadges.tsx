import { Badge } from "@/components/ui/badge";
import { 
  Shield, Lock, CheckCircle, Eye, Server, 
  CreditCard, Key, ShieldCheck, Fingerprint,
  AlertTriangle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SecurityBadgeVariant = 
  | "pci" 
  | "ssl" 
  | "encrypted" 
  | "soc2" 
  | "gdpr" 
  | "verified" 
  | "secure-checkout"
  | "bank-grade"
  | "two-factor";

export type SecurityBadgeSize = "sm" | "md" | "lg";

interface SecurityBadgeProps {
  variant: SecurityBadgeVariant;
  size?: SecurityBadgeSize;
  showLabel?: boolean;
  className?: string;
}

const SECURITY_BADGES: Record<SecurityBadgeVariant, {
  icon: typeof Shield;
  label: string;
  sublabel?: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
}> = {
  pci: {
    icon: CreditCard,
    label: "PCI DSS",
    sublabel: "Level 1 Compliant",
    bgColor: "bg-[#0A1628]",
    iconColor: "text-[#C8A661]",
    textColor: "text-white"
  },
  ssl: {
    icon: Lock,
    label: "256-bit SSL",
    sublabel: "Encrypted Connection",
    bgColor: "bg-green-600",
    iconColor: "text-white",
    textColor: "text-white"
  },
  encrypted: {
    icon: Key,
    label: "End-to-End Encrypted",
    sublabel: "AES-256 Protection",
    bgColor: "bg-[#0A1628]",
    iconColor: "text-[#C8A661]",
    textColor: "text-white"
  },
  soc2: {
    icon: ShieldCheck,
    label: "SOC 2",
    sublabel: "Type II Certified",
    bgColor: "bg-blue-600",
    iconColor: "text-white",
    textColor: "text-white"
  },
  gdpr: {
    icon: Eye,
    label: "GDPR",
    sublabel: "Privacy Compliant",
    bgColor: "bg-indigo-600",
    iconColor: "text-white",
    textColor: "text-white"
  },
  verified: {
    icon: CheckCircle,
    label: "Verified Business",
    sublabel: "Identity Confirmed",
    bgColor: "bg-[#C8A661]",
    iconColor: "text-[#0A1628]",
    textColor: "text-[#0A1628]"
  },
  "secure-checkout": {
    icon: Shield,
    label: "Secure Checkout",
    sublabel: "Protected by Stripe",
    bgColor: "bg-[#635BFF]",
    iconColor: "text-white",
    textColor: "text-white"
  },
  "bank-grade": {
    icon: Server,
    label: "Bank-Grade Security",
    sublabel: "Enterprise Infrastructure",
    bgColor: "bg-[#0A1628]",
    iconColor: "text-[#C8A661]",
    textColor: "text-white"
  },
  "two-factor": {
    icon: Fingerprint,
    label: "2FA Protected",
    sublabel: "Multi-Factor Auth",
    bgColor: "bg-purple-600",
    iconColor: "text-white",
    textColor: "text-white"
  }
};

const SIZE_CLASSES: Record<SecurityBadgeSize, {
  container: string;
  icon: string;
  label: string;
  sublabel: string;
}> = {
  sm: {
    container: "px-2 py-1 gap-1.5",
    icon: "h-3 w-3",
    label: "text-[10px] font-semibold",
    sublabel: "text-[8px]"
  },
  md: {
    container: "px-3 py-1.5 gap-2",
    icon: "h-4 w-4",
    label: "text-xs font-semibold",
    sublabel: "text-[10px]"
  },
  lg: {
    container: "px-4 py-2 gap-2.5",
    icon: "h-5 w-5",
    label: "text-sm font-semibold",
    sublabel: "text-xs"
  }
};

export function SecurityBadge({ 
  variant, 
  size = "md", 
  showLabel = true,
  className 
}: SecurityBadgeProps) {
  const config = SECURITY_BADGES[variant];
  const sizeConfig = SIZE_CLASSES[size];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-md",
        config.bgColor,
        sizeConfig.container,
        className
      )}
      data-testid={`security-badge-${variant}`}
    >
      <Icon className={cn(sizeConfig.icon, config.iconColor)} />
      {showLabel && (
        <div className="flex flex-col leading-none">
          <span className={cn(sizeConfig.label, config.textColor)}>
            {config.label}
          </span>
          {config.sublabel && size !== "sm" && (
            <span className={cn(sizeConfig.sublabel, config.textColor, "opacity-80")}>
              {config.sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface SecurityBadgeRowProps {
  badges?: SecurityBadgeVariant[];
  size?: SecurityBadgeSize;
  className?: string;
}

export function SecurityBadgeRow({ 
  badges = ["ssl", "pci", "encrypted"], 
  size = "sm",
  className 
}: SecurityBadgeRowProps) {
  return (
    <div 
      className={cn("flex flex-wrap items-center gap-2", className)}
      data-testid="security-badge-row"
    >
      {badges.map((badge) => (
        <SecurityBadge key={badge} variant={badge} size={size} />
      ))}
    </div>
  );
}

interface TrustIndicatorProps {
  icon?: typeof Shield;
  text: string;
  variant?: "default" | "success" | "warning";
  className?: string;
}

export function TrustIndicator({ 
  icon: Icon = Shield, 
  text, 
  variant = "default",
  className 
}: TrustIndicatorProps) {
  const variantStyles = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-500",
    warning: "text-amber-600 dark:text-amber-500"
  };

  const iconStyles = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-500",
    warning: "text-amber-600 dark:text-amber-500"
  };

  return (
    <div 
      className={cn("flex items-center gap-1.5 text-xs", variantStyles[variant], className)}
      data-testid="trust-indicator"
    >
      <Icon className={cn("h-3.5 w-3.5", iconStyles[variant])} />
      <span>{text}</span>
    </div>
  );
}

interface SecureFormHeaderProps {
  title?: string;
  subtitle?: string;
  badges?: SecurityBadgeVariant[];
  className?: string;
}

export function SecureFormHeader({ 
  title = "Secure Form",
  subtitle = "Your information is encrypted and protected",
  badges = ["ssl", "encrypted"],
  className 
}: SecureFormHeaderProps) {
  return (
    <div 
      className={cn("bg-muted/50 rounded-lg p-4 mb-6", className)}
      data-testid="secure-form-header"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
          <Lock className="h-5 w-5 text-[#C8A661]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
          <SecurityBadgeRow badges={badges} size="sm" />
        </div>
      </div>
    </div>
  );
}

interface EncryptionIndicatorProps {
  isEncrypted?: boolean;
  className?: string;
}

export function EncryptionIndicator({ 
  isEncrypted = true,
  className 
}: EncryptionIndicatorProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full",
        isEncrypted 
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        className
      )}
      data-testid="encryption-indicator"
    >
      {isEncrypted ? (
        <>
          <Lock className="h-3 w-3" />
          <span>Encrypted</span>
        </>
      ) : (
        <>
          <AlertTriangle className="h-3 w-3" />
          <span>Not Encrypted</span>
        </>
      )}
    </div>
  );
}

interface SecureConnectionBannerProps {
  className?: string;
}

export function SecureConnectionBanner({ className }: SecureConnectionBannerProps) {
  return (
    <div 
      className={cn(
        "bg-[#0A1628] text-white py-2 px-4 flex items-center justify-center gap-3 text-xs",
        className
      )}
      data-testid="secure-connection-banner"
    >
      <div className="flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-green-400" />
        <span>Secure Connection</span>
      </div>
      <span className="text-white/40">|</span>
      <div className="flex items-center gap-1.5">
        <Shield className="h-3 w-3 text-[#C8A661]" />
        <span>PCI DSS Compliant</span>
      </div>
      <span className="text-white/40">|</span>
      <div className="flex items-center gap-1.5">
        <Key className="h-3 w-3 text-[#C8A661]" />
        <span>256-bit Encryption</span>
      </div>
    </div>
  );
}

interface SessionSecurityAlertProps {
  type: "timeout" | "new-device" | "suspicious";
  onAction?: () => void;
  onDismiss?: () => void;
  timeRemaining?: number;
  className?: string;
}

export function SessionSecurityAlert({ 
  type,
  onAction,
  onDismiss,
  timeRemaining,
  className 
}: SessionSecurityAlertProps) {
  const configs = {
    timeout: {
      icon: RefreshCw,
      title: "Session Expiring Soon",
      message: timeRemaining 
        ? `Your session will expire in ${Math.floor(timeRemaining / 60)} minutes. Click to stay signed in.`
        : "Your session is about to expire. Click to stay signed in.",
      actionLabel: "Stay Signed In",
      bgColor: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
    },
    "new-device": {
      icon: Fingerprint,
      title: "New Device Detected",
      message: "We noticed a sign-in from a new device. Was this you?",
      actionLabel: "Yes, It Was Me",
      bgColor: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    },
    suspicious: {
      icon: AlertTriangle,
      title: "Suspicious Activity",
      message: "We detected unusual activity on your account. Please verify your identity.",
      actionLabel: "Verify Identity",
      bgColor: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "border rounded-lg p-4 flex items-start gap-3",
        config.bgColor,
        className
      )}
      data-testid={`session-alert-${type}`}
    >
      <div className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-foreground mb-1">{config.title}</h4>
        <p className="text-xs text-muted-foreground mb-3">{config.message}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onAction}
            className="px-3 py-1.5 text-xs font-medium bg-[#0A1628] text-white rounded-md hover:bg-[#1a3a5c] transition-colors"
            data-testid={`session-alert-action-${type}`}
          >
            {config.actionLabel}
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`session-alert-dismiss-${type}`}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PaymentSecurityFooterProps {
  className?: string;
}

export function PaymentSecurityFooter({ className }: PaymentSecurityFooterProps) {
  return (
    <div 
      className={cn("border-t pt-4 mt-6", className)}
      data-testid="payment-security-footer"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SecurityBadge variant="pci" size="sm" />
          <SecurityBadge variant="ssl" size="sm" />
          <SecurityBadge variant="secure-checkout" size="sm" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>Payments securely processed by Stripe</span>
        </div>
      </div>
    </div>
  );
}

interface VerifiedBusinessBadgeProps {
  businessName?: string;
  verifiedDate?: string;
  size?: "sm" | "md";
  className?: string;
}

export function VerifiedBusinessBadge({ 
  businessName,
  verifiedDate,
  size = "md",
  className 
}: VerifiedBusinessBadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 bg-[#C8A661]/10 border border-[#C8A661]/30 rounded-lg",
        size === "sm" ? "px-2 py-1" : "px-3 py-1.5",
        className
      )}
      data-testid="verified-business-badge"
    >
      <div className={cn(
        "rounded-full bg-[#C8A661] flex items-center justify-center",
        size === "sm" ? "h-4 w-4" : "h-5 w-5"
      )}>
        <CheckCircle className={cn(
          "text-[#0A1628]",
          size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"
        )} />
      </div>
      <div className="leading-none">
        <span className={cn(
          "font-semibold text-[#C8A661]",
          size === "sm" ? "text-[10px]" : "text-xs"
        )}>
          Verified Business
        </span>
        {businessName && size !== "sm" && (
          <span className="text-[10px] text-muted-foreground block">
            {businessName}
          </span>
        )}
      </div>
    </div>
  );
}

export function DataProtectionNotice({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "bg-muted/50 rounded-lg p-4 border border-border/50",
        className
      )}
      data-testid="data-protection-notice"
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
          <Shield className="h-4 w-4 text-[#C8A661]" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground mb-1">
            Your Data is Protected
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>256-bit AES encryption at rest</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>TLS 1.3 encryption in transit</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>SOC 2 Type II certified infrastructure</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>GDPR and CCPA compliant</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
