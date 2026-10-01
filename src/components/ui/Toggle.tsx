'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SPRING } from '@/lib/motion';

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      // Flexbox positions the thumb (justify-start/-end within the track's
      // own padding) instead of an absolute + fixed-pixel translate - the
      // old version could put the thumb outside the track under anything
      // that shifts the effective px-per-rem ratio, since a `translate-x-*`
      // arbitrary value doesn't rescale with the track the way this does.
      // The thumb's `layout` spring animates that flex move, and the brand
      // gradient (which can't be color-transitioned) fades in on its own layer.
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full bg-gray-200 p-0.5 ${
        checked ? 'justify-end' : 'justify-start'
      }`}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-brand-gradient"
        initial={false}
        animate={{ opacity: checked ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
      />
      <motion.span
        layout
        transition={reduced ? { duration: 0 } : SPRING}
        className="relative h-5 w-5 rounded-full bg-white shadow"
      />
    </button>
  );
}
