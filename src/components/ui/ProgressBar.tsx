'use client';

import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

/** Horizontal bar that fills from 0 when scrolled into view. `barClassName` carries the status color. */
export function ProgressBar({
  percent,
  barClassName = 'bg-brand-gradient',
  barColor,
  className,
}: {
  percent: number;
  barClassName?: string;
  /** Raw CSS color; used by charts whose palette is not a Tailwind class. */
  barColor?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={clsx('h-2 w-full overflow-hidden rounded-full bg-gray-100', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={clsx('h-full rounded-full', !barColor && barClassName)}
        style={barColor ? { backgroundColor: barColor } : undefined}
        initial={{ width: reduced ? `${pct}%` : 0 }}
        whileInView={{ width: `${pct}%` }}
        animate={reduced ? { width: `${pct}%` } : undefined}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
