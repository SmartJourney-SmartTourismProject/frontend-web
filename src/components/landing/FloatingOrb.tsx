'use client';

import { motion, useReducedMotion } from 'framer-motion';

type FloatingOrbProps = {
  className: string;
  duration?: number;
  delay?: number;
};

/**
 * Ambient looping gradient blob used to add depth to dark section backgrounds.
 * Renders as a static blurred circle when reduced motion is preferred.
 */
export function FloatingOrb({ className, duration = 10, delay = 0 }: FloatingOrbProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div aria-hidden className={className} />;
  }

  return (
    <motion.div
      aria-hidden
      className={className}
      animate={{
        y: [0, -24, 0],
        scale: [1, 1.08, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
