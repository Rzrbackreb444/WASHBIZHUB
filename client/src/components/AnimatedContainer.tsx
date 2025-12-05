import { motion, HTMLMotionProps, useInView } from "framer-motion";
import { useRef, forwardRef, useState, useEffect } from "react";
import {
  AnimationPresetName,
  getAnimationPreset,
  springy,
  smooth,
  bounce,
  gentleSpring,
  snappy,
  TransitionPresetName,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Transition, Variants } from "framer-motion";

export interface AnimatedContainerProps
  extends Omit<HTMLMotionProps<"div">, "transition"> {
  animation?: AnimationPresetName;
  transitionPreset?: TransitionPresetName;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  amount?: number | "some" | "all";
  disabled?: boolean;
  customVariants?: Variants;
}

const transitionPresets: Record<TransitionPresetName, Transition> = {
  springy,
  smooth,
  bounce,
  gentleSpring,
  snappy,
};

export const AnimatedContainer = forwardRef<
  HTMLDivElement,
  AnimatedContainerProps
>(
  (
    {
      animation = "fadeInUp",
      transitionPreset = "smooth",
      delay = 0,
      duration,
      children,
      className,
      once = true,
      amount = 0.3,
      disabled = false,
      customVariants,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
    const isInView = useInView(ref, { once, amount });

    if (disabled) {
      return (
        <div ref={ref} className={className} {...(props as any)}>
          {children}
        </div>
      );
    }

    const variants = customVariants || getAnimationPreset(animation);
    const baseTransition = transitionPresets[transitionPreset];

    const modifiedVariants: Variants = {
      ...variants,
      visible: {
        ...(variants.visible as object),
        transition: {
          ...baseTransition,
          ...(typeof variants.visible === "object" &&
          "transition" in variants.visible
            ? (variants.visible as any).transition
            : {}),
          delay,
          ...(duration !== undefined ? { duration } : {}),
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        variants={modifiedVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="exit"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedContainer.displayName = "AnimatedContainer";

export interface AnimatedListProps extends AnimatedContainerProps {
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  staggerDelay = 0.08,
  className,
  once = true,
  amount = 0.2,
  disabled = false,
  ...props
}: AnimatedListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  if (disabled) {
    return (
      <div ref={ref} className={className} {...(props as any)}>
        {children}
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface AnimatedListItemProps
  extends Omit<HTMLMotionProps<"div">, "transition"> {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function AnimatedListItem({
  children,
  className,
  index = 0,
  ...props
}: AnimatedListItemProps) {
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: smooth,
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={itemVariants}
      data-testid={`animated-list-item-${index}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface AnimatedPageProps extends Omit<HTMLMotionProps<"div">, "transition"> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className, ...props }: AnimatedPageProps) {
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 1, 1],
      },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface AnimatedSectionProps extends AnimatedContainerProps {
  as?: "section" | "div" | "article";
}

export function AnimatedSection({
  children,
  className,
  as = "section",
  once = true,
  amount = 0.2,
  delay = 0,
  disabled = false,
  ...props
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  if (disabled) {
    const Component = as;
    return (
      <Component ref={ref as any} className={className}>
        {children}
      </Component>
    );
  }

  const sectionVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        delay,
        staggerChildren: 0.15,
      },
    },
  };

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      ref={ref}
      className={cn(className)}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

export interface HoverCardProps extends Omit<HTMLMotionProps<"div">, "whileHover" | "whileTap"> {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverLift?: number;
  tapScale?: number;
  disabled?: boolean;
}

export function HoverCard({
  children,
  className,
  hoverScale = 1.02,
  hoverLift = -2,
  tapScale = 0.98,
  disabled = false,
  ...props
}: HoverCardProps) {
  if (disabled) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      whileHover={{
        scale: hoverScale,
        y: hoverLift,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: tapScale,
        transition: { duration: 0.1 },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface NumberCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function NumberCounter({
  value,
  duration = 1000,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: NumberCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrame: number;
    let delayTimeout: NodeJS.Timeout;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = easedProgress * value;

      setDisplayValue(Number(currentValue.toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    delayTimeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(delayTimeout);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, value, duration, delay, decimals]);

  return (
    <span ref={ref} className={cn(className)} data-testid="number-counter">
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
