import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  centerLabel?: string | number;
  showPercentage?: boolean;
  labelClassName?: string;
  className?: string;
  animated?: boolean;
  testId?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  trackColor,
  progressColor,
  centerLabel,
  showPercentage = true,
  labelClassName,
  className,
  animated = true,
  testId,
}: ProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const displayLabel =
    centerLabel !== undefined
      ? centerLabel
      : showPercentage
        ? `${Math.round(clampedProgress)}%`
        : null;

  const defaultTrackColor = "hsl(var(--muted))";
  const defaultProgressColor = "hsl(var(--accent))";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      data-testid={testId || "progress-ring"}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        data-testid={`${testId || "progress-ring"}-svg`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || defaultTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-30"
          data-testid={`${testId || "progress-ring"}-track`}
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor || defaultProgressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset }}
          transition={
            animated
              ? {
                  duration: 1,
                  ease: "easeOut",
                  delay: 0.2,
                }
              : undefined
          }
          style={!animated ? { strokeDashoffset } : undefined}
          data-testid={`${testId || "progress-ring"}-progress`}
        />
      </svg>

      {displayLabel !== null && (
        <motion.div
          initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            animated
              ? {
                  duration: 0.4,
                  delay: 0.5,
                  ease: "easeOut",
                }
              : undefined
          }
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "text-lg font-bold text-foreground",
            labelClassName
          )}
          data-testid={`${testId || "progress-ring"}-label`}
        >
          {displayLabel}
        </motion.div>
      )}
    </div>
  );
}

interface MultiProgressRingProps {
  segments: Array<{
    id: string;
    progress: number;
    color: string;
  }>;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  centerLabel?: string | number;
  labelClassName?: string;
  className?: string;
  animated?: boolean;
  testId?: string;
}

export function MultiProgressRing({
  segments,
  size = 120,
  strokeWidth = 8,
  trackColor,
  centerLabel,
  labelClassName,
  className,
  animated = true,
  testId,
}: MultiProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const defaultTrackColor = "hsl(var(--muted))";

  let accumulatedOffset = 0;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      data-testid={testId || "multi-progress-ring"}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        data-testid={`${testId || "multi-progress-ring"}-svg`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || defaultTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
          data-testid={`${testId || "multi-progress-ring"}-track`}
        />

        {segments.map((segment) => {
          const segmentLength = (segment.progress / 100) * circumference;
          const currentOffset = accumulatedOffset;
          accumulatedOffset += segmentLength;

          return (
            <motion.circle
              key={segment.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              initial={
                animated
                  ? {
                      strokeDashoffset: circumference,
                      opacity: 0,
                    }
                  : undefined
              }
              animate={{
                strokeDashoffset: -currentOffset,
                opacity: 1,
              }}
              transition={
                animated
                  ? {
                      duration: 0.8,
                      ease: "easeOut",
                      delay: 0.2,
                    }
                  : undefined
              }
              data-testid={`${testId || "multi-progress-ring"}-segment-${segment.id}`}
            />
          );
        })}
      </svg>

      {centerLabel !== undefined && (
        <motion.div
          initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            animated
              ? {
                  duration: 0.4,
                  delay: 0.5,
                  ease: "easeOut",
                }
              : undefined
          }
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "text-lg font-bold text-foreground",
            labelClassName
          )}
          data-testid={`${testId || "multi-progress-ring"}-label`}
        >
          {centerLabel}
        </motion.div>
      )}
    </div>
  );
}

export type { ProgressRingProps, MultiProgressRingProps };
