'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { CountUp } from '@/components/ui/CountUp';
import { Skeleton } from '@/components/ui/Skeleton';
import { RevealCard } from '@/components/motion/Reveal';
import { EmptyIllustration } from '@/components/budget/EmptyIllustration';
import { budgetApi, tripsApi } from '@/lib/api';
import type { Expense, Trip, TripBudget, TripBudgetSummary } from '@/lib/types';
import { BudgetsByTripPanel } from '@/components/budget/BudgetsByTripPanel';
import { SpendByCategoryPanel } from '@/components/budget/SpendByCategoryPanel';
import { ExpensesPanel } from '@/components/budget/ExpensesPanel';

export default function BudgetTrackerPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allSummary, setAllSummary] = useState<TripBudgetSummary[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [budget, setBudget] = useState<TripBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadTripList = () => {
    Promise.all([tripsApi.list(), budgetApi.getAllSummary()])
      .then(([tripList, summary]) => {
        setTrips(tripList);
        setAllSummary(summary);
        setSelectedTripId((current) => current ?? tripList[0]?.id ?? null);
      })
      .finally(() => setInitialLoading(false));
  };

  useEffect(loadTripList, []);

  const loadSelectedTripData = () => {
    if (!selectedTripId) return;
    Promise.all([budgetApi.getTripBudget(selectedTripId), budgetApi.listExpenses(selectedTripId)]).then(
      ([b, e]) => {
        setBudget(b);
        setExpenses(e);
      },
    );
  };

  useEffect(loadSelectedTripData, [selectedTripId]);

  const refreshAfterChange = async () => {
    loadSelectedTripData();
    const summary = await budgetApi.getAllSummary();
    setAllSummary(summary);
  };

  if (trips.length === 0 && !initialLoading) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div className="flex flex-col items-center">
          <EmptyIllustration className="h-28 w-32" />
          <h1 className="mt-2 font-serif text-2xl font-semibold text-brand-600">Budget tracker</h1>
          <p className="mt-1 text-sm text-gray-500">
            Save a trip from the Home chat to start tracking its budget.
          </p>
          <Link
            href="/home"
            className="mt-5 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-105 hover:shadow-glow active:scale-95"
          >
            Plan a trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-gray-900">Budget tracker</h1>
            <p className="mt-1 text-sm text-gray-500">
              Every logged expense across your trips, tracked against what you set aside.
            </p>
          </div>
          <select
            // Visually the heading next to it says what this chooses, but a
            // screen reader reaching the control alone announced only "combo
            // box" - axe's `select-name` rule, critical impact.
            aria-label="Trip to show the budget for"
            value={selectedTripId ?? ''}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-brand-700"
          >
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.title || trip.district?.name || 'Untitled trip'}
              </option>
            ))}
          </select>
        </div>

        {!budget && <BudgetSkeleton />}

        {budget && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard index={0} label="Total budget" value={budget.total} currency={budget.trip.currency} />
              <StatCard index={1} label="Spent so far" value={budget.spent} currency={budget.trip.currency} />
              <StatCard
                index={2}
                label="Remaining"
                value={budget.remaining}
                currency={budget.trip.currency}
                negativeIsBad
              />
              <StatCard
                index={3}
                label="Daily average"
                value={budget.daily_average}
                currency={budget.trip.currency}
                sub={`Across ${budget.planned_days} planned day${budget.planned_days !== 1 ? 's' : ''}`}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BudgetsByTripPanel
                trips={allSummary}
                selectedTripId={selectedTripId}
                onSelect={setSelectedTripId}
              />
              <SpendByCategoryPanel
                breakdown={budget.by_category}
                totalSpent={budget.spent}
                currency={budget.trip.currency}
              />
            </div>

            <div className="mt-6">
              <ExpensesPanel
                expenses={expenses}
                currency={budget.trip.currency}
                onAdd={async (data) => {
                  await budgetApi.addExpense(selectedTripId!, data);
                  await refreshAfterChange();
                }}
                onDelete={async (id) => {
                  await budgetApi.deleteExpense(id);
                  await refreshAfterChange();
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  currency,
  sub,
  index,
  negativeIsBad = false,
}: {
  label: string;
  value: number | null;
  currency: string;
  sub?: string;
  index: number;
  /** Turns the figure red when it drops below zero (e.g. Remaining when overspent). */
  negativeIsBad?: boolean;
}) {
  const over = negativeIsBad && value != null && value < 0;
  return (
    <RevealCard index={index}>
      <div className="rounded-2xl border border-gray-200 p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className={clsx('mt-1 text-xl font-bold transition-colors duration-500', over ? 'text-red-600' : 'text-gray-900')}>
          {value != null ? (
            <>
              <CountUp value={value} decimals={Number.isInteger(value) ? 0 : 2} /> {currency}
            </>
          ) : (
            '—'
          )}
        </p>
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
      </div>
    </RevealCard>
  );
}

/** Layout-matched placeholder so the page doesn't pop in from blank. */
function BudgetSkeleton() {
  return (
    <div role="status" aria-label="Loading budget">
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
