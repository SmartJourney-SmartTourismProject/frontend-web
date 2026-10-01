'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE_OUT } from '@/lib/motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'span' | 'section';
};

/**
 * Scroll-triggered fade/slide-in wrapper used throughout the landing page.
 * Collapses to a plain, static render when the user prefers reduced motion.
 */
export function Reveal({ children, className, delay = 0, y = 24, as = 'div' }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: EASE_OUT },
    },
  };

  const MotionTag = as === 'span' ? motion.span : as === 'section' ? motion.section : motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
};

/** Wraps a group of Reveal children so they animate in with a staggered delay. */
export function StaggerGroup({ children, className, stagger = 0.12 }: StaggerProps) {
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 20 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : y },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/**
 * Card-sized scroll reveal for rows and grids. `index` staggers neighbours
 * that enter the viewport together (mod 6, so long rows don't wait seconds).
 * Lift-on-hover belongs on an inner element: framer owns this one's transform.
 */
export function RevealCard({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
