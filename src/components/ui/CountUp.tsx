'use client';

import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Counts from 0 to `value` once scrolled into view. Renders the final value
 * immediately under reduced motion (and on the server, so there is no
 * layout shift or hydration mismatch).
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  duration = 1.4,
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  // Starts at the real value so server HTML and first client render agree
  // (reduced-motion is only known on the client); the effect below rewinds to
  // 0 for the count-up when it is actually going to animate.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    // No IntersectionObserver (old browsers, jsdom) means inView never flips,
    // so show the real number instead of leaving it stuck at 0.
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }
    if (!inView) {
      setDisplay(0);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
