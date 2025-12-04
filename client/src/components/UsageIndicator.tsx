import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import { useUpgradeModal, UpgradeModal } from "@/components/monetization/UpgradeModal";
import { Zap, Infinity, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UsageIndicatorProps {
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function UsageIndicator({
  className,
  showIcon = true,
  compact = false,
}: UsageIndicatorProps) {
  const { 
    used, 
    limit, 
    remaining, 
    percentUsed, 
    isLoading, 
    isUnlimited, 
    isAtLimit,
    tier,
    isAuthenticated 
  } = useUsageQuota();
  
  const { isOpen, openUpgradeModal, closeUpgradeModal, UpgradeModalComponent } = useUpgradeModal();

  const handleClick = () => {
    if (isAtLimit || tier === "FREE") {
      openUpgradeModal({
        feature: "cleanbi-unlimited",
        suggestedTier: "starter",
        title: isAtLimit ? "Analysis Limit Reached" : "Unlock Unlimited CLEANBI",
        description: isAtLimit 
          ? "You've used all your free CLEANBI analyses. Upgrade for unlimited access."
          : "Upgrade to get unlimited location analyses and advanced insights."
      });
    }
  };

  const getStatusColor = (): string => {
    if (isUnlimited) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    if (isAtLimit) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    if (percentUsed >= 75) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  };

  const getIcon = () => {
    if (isUnlimited) return <Infinity className="h-3 w-3" />;
    if (isAtLimit) return <AlertCircle className="h-3 w-3" />;
    return <Zap className="h-3 w-3" />;
  };

  const getLabel = () => {
    if (isUnlimited) return compact ? "∞" : "Unlimited";
    return compact ? `${remaining}/${limit}` : `${remaining}/${limit} left`;
  };

  const getTooltipContent = () => {
    if (!isAuthenticated) {
      return "Sign in to track your CLEANBI usage";
    }
    if (isUnlimited) {
      return `${tier} tier - Unlimited CLEANBI analyses`;
    }
    if (isAtLimit) {
      return "Analysis limit reached. Click to upgrade for unlimited analyses.";
    }
    return `${remaining} of ${limit} CLEANBI analyses remaining`;
  };

  if (isLoading) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "animate-pulse bg-muted/50",
          className
        )}
      >
        <span className="opacity-0">0/0</span>
      </Badge>
    );
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors gap-1.5 font-medium",
              getStatusColor(),
              (isAtLimit || tier === "FREE") && "cursor-pointer",
              className
            )}
            onClick={handleClick}
            data-testid="badge-usage-indicator"
          >
            {showIcon && getIcon()}
            <span data-testid="text-usage-count">{getLabel()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
      
      <UpgradeModalComponent />
    </>
  );
}
