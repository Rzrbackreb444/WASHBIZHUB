import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CLEANBIGradeBadgeProps {
  score: number;
  grade: string;
  size?: "sm" | "md" | "lg" | "xl";
  percentile?: number;
  showPercentile?: boolean;
  animated?: boolean;
  className?: string;
}

const GRADE_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  "A": { color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.15)", label: "Excellent" },
  "B": { color: "#A3E635", bgColor: "rgba(163, 230, 53, 0.15)", label: "Good" },
  "C": { color: "#FBBF24", bgColor: "rgba(251, 191, 36, 0.15)", label: "Fair" },
  "Needs Work": { color: "#C8A661", bgColor: "rgba(200, 166, 97, 0.15)", label: "Needs Work" }
};

const SIZE_CONFIG = {
  sm: { container: "w-16 h-16", ring: 56, stroke: 4, text: "text-lg", subtext: "text-[8px]" },
  md: { container: "w-24 h-24", ring: 88, stroke: 5, text: "text-2xl", subtext: "text-[10px]" },
  lg: { container: "w-32 h-32", ring: 120, stroke: 6, text: "text-3xl", subtext: "text-xs" },
  xl: { container: "w-40 h-40", ring: 152, stroke: 8, text: "text-4xl", subtext: "text-sm" }
};

export function CLEANBIGradeBadge({
  score,
  grade,
  size = "md",
  percentile,
  showPercentile = true,
  animated = true,
  className
}: CLEANBIGradeBadgeProps) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG["Needs Work"];
  const sizeConfig = SIZE_CONFIG[size];
  
  const radius = (sizeConfig.ring - sizeConfig.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const gradientId = `cleanbi-gradient-${score}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div 
      className={cn("relative flex items-center justify-center", sizeConfig.container, className)}
      data-testid="cleanbi-grade-badge"
    >
      <svg
        width={sizeConfig.ring}
        height={sizeConfig.ring}
        viewBox={`0 0 ${sizeConfig.ring} ${sizeConfig.ring}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.color} stopOpacity="1" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        <circle
          cx={sizeConfig.ring / 2}
          cy={sizeConfig.ring / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={sizeConfig.stroke}
        />
        
        <motion.circle
          cx={sizeConfig.ring / 2}
          cy={sizeConfig.ring / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={sizeConfig.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={animated ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <span 
          className={cn("font-bold", sizeConfig.text)}
          style={{ color: config.color }}
          data-testid="text-grade-score"
        >
          {score}
        </span>
        {showPercentile && percentile !== undefined && (
          <span 
            className={cn("text-muted-foreground font-medium", sizeConfig.subtext)}
            data-testid="text-grade-percentile"
          >
            Top {percentile}%
          </span>
        )}
      </motion.div>
    </div>
  );
}

export default CLEANBIGradeBadge;
