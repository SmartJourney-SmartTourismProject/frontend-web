'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Sparkles } from 'lucide-react';
import { EASE_OUT } from '@/lib/motion';

type Turn = { prompt: string; reply: string[]; budget?: boolean };

// A short follow-up conversation: plan -> tweak -> cost. Each turn builds on the last.
const TURNS: Turn[] = [
  {
    prompt: '3 days in Kandy & Ella, mid budget',
    reply: ['Day 1 · Temple of the Tooth', 'Day 2 · Train to Ella', 'Day 3 · Nine Arches'],
  },
  {
    prompt: 'Make day 2 more relaxed',
    reply: ['Done: swapped the hike for a tea estate visit and a late start.'],
  },
  {
    prompt: 'What will it cost?',
    reply: ['92,000 of 120,000 LKR'],
    budget: true,
  },
];

type Phase = 'typing' | 'sending' | 'thinking' | 'result' | 'clearing';

/** Small looping decorative chat: three follow-up turns, then it clears and replays. */
export function HeroChatDemo({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [typed, setTyped] = useState(0);

  const current = TURNS[turn];

  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      timer = setTimeout(
        () => (typed < current.prompt.length ? setTyped((n) => n + 1) : setPhase('sending')),
        typed === 0 ? 800 : typed === current.prompt.length ? 450 : 50,
      );
    } else if (phase === 'sending') {
      timer = setTimeout(() => setPhase('thinking'), 550);
    } else if (phase === 'thinking') {
      timer = setTimeout(() => setPhase('result'), 1400);
    } else if (phase === 'result') {
      const last = turn === TURNS.length - 1;
      timer = setTimeout(
        () => {
          if (last) return setPhase('clearing');
          setTurn(turn + 1);
          setTyped(0);
          setPhase('typing');
        },
        last ? 4500 : 1800,
      );
    } else {
      timer = setTimeout(() => {
        setTurn(0);
        setTyped(0);
        setPhase('typing');
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [phase, typed, turn, current.prompt.length, reduced]);

  // Which turns to render, and how far the newest one has progressed.
  const shown = reduced ? TURNS.length : turn + 1;
  const readyToSend = phase === 'typing' && typed === current.prompt.length;

  return (
    <div
      aria-hidden
      className={`flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/15 shadow-xl backdrop-blur-1xl ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/15 px-3 py-2.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-gradient text-white">
          <Sparkles className="h-3 w-3" />
        </span>
        <span className="text-xs font-semibold text-white">SmartJourney AI</span>
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </div>

      <motion.div
        animate={{ opacity: phase === 'clearing' ? 0 : 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-1 flex-col justify-end gap-2 overflow-hidden px-3 py-3 [mask-image:linear-gradient(to_bottom,transparent,black_18%)]"
      >
        {TURNS.slice(0, shown).map((t, i) => {
          const isCurrent = !reduced && i === turn;
          const userVisible = !isCurrent || phase !== 'typing';
          const thinking = isCurrent && phase === 'thinking';
          const replyVisible = !isCurrent || phase === 'result' || phase === 'clearing';
          return (
            <div key={i} className="flex flex-col gap-2">
              {userVisible && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-brand-gradient px-3 py-1.5 text-xs text-white"
                >
                  {t.prompt}
                </motion.div>
              )}
              {thinking && (
                <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-white/15 px-3 py-2">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-white/80"
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              )}
              {replyVisible && (
                <motion.div
                  initial={reduced || !isCurrent ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[92%] rounded-2xl rounded-bl-sm bg-white/15 px-3 py-2"
                >
                  <ul className="space-y-1">
                    {t.reply.map((line, li) => (
                      <motion.li
                        key={line}
                        initial={reduced || !isCurrent ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + li * 0.35, duration: 0.35, ease: EASE_OUT }}
                        className="text-[11px] leading-snug text-white/90"
                      >
                        {line}
                      </motion.li>
                    ))}
                  </ul>
                  {t.budget && (
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
                      <motion.div
                        initial={reduced || !isCurrent ? { width: '77%' } : { width: 0 }}
                        animate={{ width: '77%' }}
                        transition={{ delay: 0.3, duration: 0.9, ease: EASE_OUT }}
                        className="h-full rounded-full bg-brand-gradient"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </motion.div>

      <div className="flex items-center gap-2 border-t border-white/15 px-3 py-2.5">
        <div className="min-h-[1.25rem] flex-1 truncate text-xs text-white/85">
          {phase === 'typing' && !reduced ? (
            <>
              {current.prompt.slice(0, typed)}
              <span className="ml-px inline-block h-3 w-px translate-y-0.5 animate-pulse bg-white/80" />
            </>
          ) : (
            <span className="text-white/50">Ask a follow-up…</span>
          )}
        </div>
        <motion.span
          animate={phase === 'sending' && !reduced ? { scale: [1, 0.8, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-white transition-colors ${
            readyToSend ? 'bg-accent-500' : 'bg-white/25'
          }`}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </motion.span>
      </div>
    </div>
  );
}
