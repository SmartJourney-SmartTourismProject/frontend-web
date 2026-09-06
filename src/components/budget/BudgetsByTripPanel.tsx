import type { TripBudgetSummary } from '@/lib/types';

const STATUS_LABEL: Record<TripBudgetSummary['status'], string> = {
  on_track: 'ON TRACK',
  watch: 'WATCH',
  over_budget: 'OVER BUDGET',
  no_budget: 'NO BUDGET SET',
};

const STATUS_STYLE: Record<TripBudgetSummary['status'], { badge: string; bar: string }> = {
  on_track: { badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  watch: { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  over_budget: { badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
  no_budget: { badge: 'bg-gray-100 text-gray-500', bar: 'bg-gray-300' },
};

export function BudgetsByTripPanel({
  trips,
  selectedTripId,
  onSelect,
}: {
  trips: TripBudgetSummary[];
  selectedTripId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <h2 className="text-sm font-bold text-brand-700">Budgets by trip</h2>
      <p className="mt-0.5 text-xs text-gray-500">
        How each saved itinerary is tracking against what you set aside.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {trips.length === 0 && <p className="text-sm text-gray-400">No trips with a budget yet.</p>}
        {trips.map((trip) => {
          const pct = trip.budget ? Math.min(100, Math.round((trip.spent / trip.budget) * 100)) : 0;
          const style = STATUS_STYLE[trip.status];
          return (
            <button
              key={trip.id}
              onClick={() => onSelect(trip.id)}
              className={`text-left transition ${trip.id === selectedTripId ? '' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-gray-900">
                  {trip.title || 'Untitled trip'}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>
                    {STATUS_LABEL[trip.status]}
                  </span>
                </span>
                <span className="text-xs text-gray-600">
                  {trip.spent.toLocaleString()} / {trip.budget ? trip.budget.toLocaleString() : '—'}{' '}
                  {trip.currency}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
