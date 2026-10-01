'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CountUp } from '@/components/ui/CountUp';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CategoryBreakdown } from '@/lib/types';
import { EmptyIllustration } from './EmptyIllustration';

// Donut of spend by category plus a legend with a mini bar per row - built
// as plain SVG, so there is still no charting dependency for one panel.
const COLORS = ['#412874', '#d552a3', '#16a34a', '#d97706', '#0891b2', '#dc2626'];

export function SpendByCategoryPanel({
  breakdown,
  totalSpent,
  currency,
}: {
  breakdown: CategoryBreakdown[];
  totalSpent: number;
  currency: string;
}) {
  const reduced = useReducedMotion();

  // Each arc is a circle whose `pathLength` is normalised to 100, so a
  // dasharray of "<pct> <rest>" is literally a percentage of the ring and
  // the dashoffset is the running total of the segments before it.
  let cumulative = 0;
  const arcs = breakdown.map((row, i) => {
    const arc = { row, color: COLORS[i % COLORS.length], offset: -cumulative };
    cumulative += row.percentage;
    return arc;
  });

  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <h2 className="text-sm font-bold text-brand-700">Spend by category</h2>
      <p className="mt-0.5 text-xs text-gray-500">Current trip</p>

      {breakdown.length === 0 ? (
        <div className="mt-4 flex flex-col items-center py-4 text-center">
          <EmptyIllustration className="h-24 w-28" />
          <p className="mt-2 text-sm text-gray-400">No expenses logged yet.</p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-4 h-44 w-44">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx={50} cy={50} r={38} fill="none" stroke="#f3f4f6" strokeWidth={14} />
              {arcs.map(({ row, color, offset }) => (
                <motion.circle
                  key={row.category}
                  cx={50}
                  cy={50}
                  r={38}
                  fill="none"
                  stroke={color}
                  strokeWidth={14}
                  pathLength={100}
                  strokeDashoffset={offset}
                  initial={{ strokeDasharray: reduced ? `${row.percentage} ${100 - row.percentage}` : '0 100' }}
                  whileInView={{ strokeDasharray: `${row.percentage} ${100 - row.percentage}` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <CountUp value={totalSpent} className="text-lg font-bold text-gray-900" />
              <span className="text-xs text-gray-500">{currency} spent</span>
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            {arcs.map(({ row, color }) => (
              <li key={row.category} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span>{row.category}</span>
                  </span>
                  <span className="font-medium text-gray-900">{row.percentage}%</span>
                </div>
                <ProgressBar percent={row.percentage} barColor={color} className="mt-1 h-1" />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
