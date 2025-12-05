import { Variants, Transition, TargetAndTransition } from "framer-motion";
import { useEffect, useState } from "react";

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const springy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smooth: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const bounce: Transition = {
  type: "spring",
  bounce: 0.3,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const snappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 35,
};

// ============================================================================
// ANIMATION PRESETS (Variants)
// ============================================================================

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smooth,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smooth,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 },
  },
};

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smooth,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smooth,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springy,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

export const staggerChildren: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const slideInDrawer: Variants = {
  hidden: {
    x: "-100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const slideInDrawerRight: Variants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: springy,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ============================================================================
// HOVER ANIMATION HELPERS
// ============================================================================

export const hoverScale: TargetAndTransition = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const hoverLift: TargetAndTransition = {
  y: -2,
  transition: { duration: 0.2 },
};

export const hoverGlow: TargetAndTransition = {
  scale: 1.02,
  y: -2,
  boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
  transition: { duration: 0.25 },
};

export const tapScale: TargetAndTransition = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const tapPress: TargetAndTransition = {
  scale: 0.96,
  transition: { duration: 0.1 },
};

// ============================================================================
// PAGE TRANSITION VARIANTS
// ============================================================================

export const pageVariants: Variants = {
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

export const sectionVariants: Variants = {
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
      staggerChildren: 0.15,
    },
  },
};

// ============================================================================
// LIST ANIMATION HELPERS
// ============================================================================

export const listContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const listItem: Variants = {
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
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

export const gridItem: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// ============================================================================
// SCROLL REVEAL VARIANTS
// ============================================================================

export const scrollReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const scrollRevealLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const scrollRevealRight: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const scrollRevealScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// ============================================================================
// NUMBER COUNTER ANIMATION HOOK
// ============================================================================

export interface UseAnimatedCounterOptions {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  easing?: (t: number) => number;
}

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export function useAnimatedCounter({
  from = 0,
  to,
  duration = 1000,
  delay = 0,
  decimals = 0,
  easing = easeOutExpo,
}: UseAnimatedCounterOptions): number {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    let delayTimeout: NodeJS.Timeout;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const currentValue = from + (to - from) * easedProgress;

      setValue(Number(currentValue.toFixed(decimals)));

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
  }, [from, to, duration, delay, decimals, easing]);

  return value;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createStaggerDelay(index: number, baseDelay = 0.1): number {
  return index * baseDelay;
}

export function getAnimationPreset(
  name: AnimationPresetName
): Variants {
  const presets: Record<AnimationPresetName, Variants> = {
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    staggerChildren,
    slideInDrawer,
    slideInDrawerRight,
    listContainer,
    listItem,
    gridItem,
    scrollReveal,
    scrollRevealLeft,
    scrollRevealRight,
    scrollRevealScale,
    pageVariants,
    sectionVariants,
  };
  return presets[name];
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AnimationPresetName =
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "scaleIn"
  | "staggerChildren"
  | "slideInDrawer"
  | "slideInDrawerRight"
  | "listContainer"
  | "listItem"
  | "gridItem"
  | "scrollReveal"
  | "scrollRevealLeft"
  | "scrollRevealRight"
  | "scrollRevealScale"
  | "pageVariants"
  | "sectionVariants";

export type TransitionPresetName =
  | "springy"
  | "smooth"
  | "bounce"
  | "gentleSpring"
  | "snappy";

export interface AnimationConfig {
  variants: Variants;
  initial?: string;
  animate?: string;
  exit?: string;
  transition?: Transition;
}
