'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BedDouble,
  CalendarDays,
  CloudSun,
  Lightbulb,
  MapPinned,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Ticket,
  Train,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

type Pop = { icon: LucideIcon; title: string; sub: string };

const POOL: Pop[] = [
  { icon: Sparkles, title: 'Itinerary ready', sub: 'Day-by-day plan in seconds' },
  { icon: MapPinned, title: 'Kandy → Ella', sub: 'Route optimized' },
  { icon: Wallet, title: 'Within budget', sub: '92,000 of 120,000 LKR' },
  { icon: BedDouble, title: 'Stay booked', sub: 'Ella · mountain view' },
  { icon: CloudSun, title: '24°C, sunny', sub: 'Perfect for Kandy' },
  { icon: Train, title: 'Train seats held', sub: 'Kandy → Ella · 08:30' },
  { icon: Lightbulb, title: 'Local tip', sub: 'Nine Arches at sunrise' },
  { icon: CalendarDays, title: 'Event nearby', sub: 'Esala Perahera parade' },
  { icon: ShieldCheck, title: 'Verified guide', sub: 'Rated 4.9 by travelers' },
  { icon: Ticket, title: 'Entry fee', sub: 'Temple · 2,000 LKR' },
  { icon: PiggyBank, title: 'Saved 12%', sub: 'Best-value stay chosen' },
];

// Spots around the chat; no two visible cards share one.
const SLOTS = [
  'right-6 top-4',
  'left-0 top-44',
  'bottom-2 right-16',
  'left-2 top-0',
  'right-0 top-[120px]',
  'left-0 top-[300px]',
  'right-2 top-[300px]',
  'left-10 bottom-[56px]',
  'right-24 top-[430px]',
];

const MAX_VISIBLE = 4;

type Active = { id: number; slot: number; card: number };

/** Floating cards (the original three included) that randomly pop in around the chat, linger a few seconds, then fade out. */
export function HeroPopCards() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<Active[]>([]);
  const activeRef = useRef<Active[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (reduced) return;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let stopped = false;

    const spawn = () => {
      const cur = activeRef.current;
      if (cur.length < MAX_VISIBLE) {
        const freeSlots = SLOTS.map((_, i) => i).filter((i) => !cur.some((a) => a.slot === i));
        const freeCards = POOL.map((_, i) => i).filter((i) => !cur.some((a) => a.card === i));
        const slot = freeSlots[Math.floor(Math.random() * freeSlots.length)];
        const card = freeCards[Math.floor(Math.random() * freeCards.length)];
        const item = { id: nextId.current++, slot, card };
        activeRef.current = [...cur, item];
        setActive(activeRef.current);
        const life = 3000 + Math.random() * 2500;
        timers.add(
          setTimeout(() => {
            activeRef.current = activeRef.current.filter((a) => a.id !== item.id);
            setActive(activeRef.current);
          }, life),
        );
      }
      if (!stopped) timers.add(setTimeout(spawn, 1100 + Math.random() * 1500));
    };

    timers.add(setTimeout(spawn, 1200));
    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      <AnimatePresence>
        {active.map(({ id, slot, card }) => {
          const { icon: Icon, title, sub } = POOL[card];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.6, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -8, transition: { duration: 0.3 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className={`absolute w-56 ${SLOTS[slot]}`}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/95 p-3 shadow-xl backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-600">{title}</p>
                  <p className="truncate text-xs text-gray-500">{sub}</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
