'use client';

import { useEffect, useState } from 'react';
import { Table2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { AdminAnalytics } from '@/lib/types';
import { BreakdownBars, ModerationChart, SERIES, TrendChart } from './charts';

/**
 * SRS §3.1.14 - "charts showing AI itinerary generation trends and other
 * platform usage statistics". The headline counts live on the dashboard
 * cards above; this tab is the trends and breakdowns behind them.
 */
export function AnalyticsPanel() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    adminApi.analytics().then(setData).catch(() => setError('Could not load analytics.'));
  }, []);

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        {error}
      </p>
    );
  }
  if (!data) return <p className="py-10 text-center text-sm text-gray-400">Loading analytics…</p>;

  const { trends, breakdowns } = data;
  const trendSeries = [
    { label: 'Itineraries', color: SERIES.blue, points: trends.itineraries },
    { label: 'Chat sessions', color: SERIES.orange, points: trends.chat_sessions },
    { label: 'New travellers', color: SERIES.aqua, points: trends.signups },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card
        title="Platform activity"
        subtitle={`Last ${data.range.days} days, from ${data.range.from}`}
        action={
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <Table2 className="h-3 w-3" /> {showTable ? 'Hide' : 'View'} table
          </button>
        }
      >
        <TrendChart series={trendSeries} />
        {showTable && (
          <div className="mt-4 max-h-64 overflow-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Day</th>
                  {trendSeries.map((s) => (
                    <th key={s.label} className="px-3 py-2 text-right font-semibold">
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trends.itineraries.map((p, i) => (
                  <tr key={p.day}>
                    <td className="px-3 py-1.5 text-gray-600">{p.day}</td>
                    {trendSeries.map((s) => (
                      <td key={s.label} className="px-3 py-1.5 text-right tabular-nums text-gray-700">
                        {s.points[i]?.count ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Moderation activity" subtitle="Listings and events approved vs rejected, per day">
        <ModerationChart points={trends.moderation} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Published listings by category">
          <BreakdownBars rows={breakdowns.listings_by_category} />
        </Card>
        <Card title="Published listings by district" subtitle="Top 8">
          <BreakdownBars rows={breakdowns.listings_by_district} color={SERIES.orange} />
        </Card>
        <Card title="Saved itineraries by status">
          <BreakdownBars rows={breakdowns.itinerary_status} color={SERIES.aqua} />
        </Card>
        <Card title="Most active planners" subtitle="By saved itineraries">
          <BreakdownBars rows={breakdowns.top_planners} />
        </Card>
      </div>

    </div>
  );
}

function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
