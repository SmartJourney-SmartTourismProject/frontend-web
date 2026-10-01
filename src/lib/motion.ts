import type { Transition, Variants } from 'framer-motion';

/** One shared motion language: every page pulls its easing/durations from here. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const DURATION = { fast: 0.2, base: 0.5, slow: 0.8 } as const;

export const SPRING: Transition = { type: 'spring', stiffness: 380, damping: 26 };
export const SPRING_BOUNCY: Transition = { type: 'spring', stiffness: 300, damping: 14 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

export const staggerContainer = (stagger = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});
