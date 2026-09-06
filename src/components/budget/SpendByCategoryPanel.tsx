import type { CategoryBreakdown } from '@/lib/types';

// A stacked bar + legend rather than a canvas/SVG donut chart - same
// information, no charting dependency to pull in for one panel.
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
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <h2 className="text-sm font-bold text-brand-700">Spend by category</h2>
      <p className="mt-0.5 text-xs text-gray-500">Current trip</p>

      {breakdown.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No expenses logged yet.</p>
      ) : (
        <>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
            {breakdown.map((row, i) => (
              <div
                key={row.category}
                style={{ width: `${row.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
              />
            ))}
          </div>

          <p className="mt-3 text-lg font-bold text-gray-900">
            {totalSpent.toLocaleString()} <span className="text-xs font-normal text-gray-500">{currency} spent</span>
          </p>

          <ul className="mt-3 flex flex-col gap-2">
            {breakdown.map((row, i) => (
              <li key={row.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {row.category}
                </span>
                <span className="font-medium text-gray-900">{row.percentage}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
