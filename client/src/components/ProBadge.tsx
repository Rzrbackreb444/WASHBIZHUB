/**
 * PRO BADGE COMPONENT
 * 
 * Visual indicator for premium features
 * Used throughout the app to mark gated features
 */

import { Crown, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  variant?: "default" | "small" | "icon";
  className?: string;
  text?: string;
}

export function ProBadge({ variant = "default", className, text = "PRO" }: ProBadgeProps) {
  if (variant === "icon") {
    return (
      <Crown className={cn("h-4 w-4 text-primary", className)} data-testid="icon-pro" />
    );
  }

  if (variant === "small") {
    return (
      <Badge 
        variant="default" 
        className={cn("text-xs gap-1", className)}
        data-testid="badge-pro-small"
      >
        <Sparkles className="h-3 w-3" />
        {text}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="default"
      className={cn("bg-gradient-to-r from-primary to-accent gap-1.5", className)}
      data-testid="badge-pro"
    >
      <Crown className="h-3.5 w-3.5" />
      {text}
    </Badge>
  );
}

export function EnterpriseBadge({ className }: { className?: string }) {
  return (
    <Badge 
      variant="default"
      className={cn("bg-gradient-to-r from-purple-600 to-pink-600 gap-1.5", className)}
      data-testid="badge-enterprise"
    >
      <Zap className="h-3.5 w-3.5" />
      ENTERPRISE
    </Badge>
  );
}
