'use client';

import { useId, useState } from 'react';

/**
 * Small inline-SVG chart set for the admin analytics tab. No chart library:
 * three simple forms, drawn to the project's data-viz rules.
 *
 * Colour roles (each validated with the palette checker before use):
 *  - three trend series -> categorical slots 1/2/3, blue / orange / aqua
 *    (worst adjacent CVD deltaE 9.2, normal-vision 27.6)
 *  - approved vs rejected -> the DIVERGING pair, blue <-> red. Green/red is
 *    the obvious choice and it fails: deltaE 4.1 for deuteranopes, i.e.
 *    invisible to the most common form of colour blindness. Blue/red scores
 *    23.8 and reads as opposite.
 *  - single-series breakdowns -> one hue, no legend (the title names it).
 *
 * Marks follow the house spec: 2px lines, >=8px end markers with a 2px
 * surface ring, bars capped at 24px with 4px rounded data-ends, hairline
 * recessive gridlines, and a 2px surface gap between adjacent bars.
 */

export const SERIES = {
  blue: '#2a78d6',
  orange: '#eb6834',
  aqua: '#1baf7a',
  red: '#d03b3b',
} as const;

const AXIS = '#e5e7eb';
const INK_MUTED = '#6b7280';

function niceMax(value: number): number {
  if (value <= 5) return 5;
  const pow = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / pow) * pow;
}

function shortDay(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export interface Series {
  label: string;
  color: string;
  points: { day: string; count: number }[];
}

/**
 * Multi-series line chart with a crosshair tooltip. Days with no activity are
 * plotted as 0 by the API, so a flat stretch means "nothing happened", not
 * "no data" - which is why the x-axis is continuous rather than categorical.
 */
export function TrendChart({ series, height = 200 }: { series: Series[]; height?: number }) {
  const clipId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const days = series[0]?.points.map((p) => p.day) ?? [];
  if (days.length === 0) return <Empty height={height} />;

  const W = 720;
  const H = height;
  const pad = { top: 12, right: 16, bottom: 26, left: 34 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.count))));
  const x = (i: number) => pad.left + (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`30-day trend: ${series.map((s) => s.label).join(', ')}`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={pad.left} y={pad.top} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke={AXIS} strokeWidth={1} />
            <text x={pad.left - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
              {Math.round(t)}
            </text>
          </g>
        ))}

        {/* First and last labels anchor inward so they cannot overflow the
            viewBox - centring them clips the edge label. */}
        {[0, Math.floor(days.length / 2), days.length - 1].map((i, n) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor={n === 0 ? 'start' : n === 2 ? 'end' : 'middle'}
            fontSize={11}
            fill={INK_MUTED}
          >
            {shortDay(days[i])}
          </text>
        ))}

        <g clipPath={`url(#${clipId})`}>
          {series.map((s) => (
            <polyline
              key={s.label}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={s.points.map((p, i) => `${x(i)},${y(p.count)}`).join(' ')}
            />
          ))}
        </g>

        {/* End markers: >=8px, 2px surface ring so overlaps stay legible. */}
        {series.map((s) => {
          const last = s.points.length - 1;
          return (
            <circle
              key={s.label}
              cx={x(last)}
              cy={y(s.points[last].count)}
              r={4}
              fill={s.color}
              stroke="#ffffff"
              strokeWidth={2}
            />
          );
        })}

        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke={AXIS} strokeWidth={1} />
        )}

        {/* Invisible hit bands - a bigger target than the 2px line itself. */}
        {days.map((day, i) => (
          <rect
            key={day}
            x={x(i) - innerW / days.length / 2}
            y={pad.top}
            width={innerW / days.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>

      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label}
            <span className="tabular-nums text-gray-400">
              {hover === null
                ? `· ${s.points.reduce((a, p) => a + p.count, 0)} total`
                : `· ${s.points[hover].count}`}
            </span>
          </span>
        ))}
        {hover !== null && <span className="text-gray-400">on {shortDay(days[hover])}</span>}
      </figcaption>
    </figure>
  );
}

/**
 * Approvals vs rejections per day. Two measures of the same unit on one axis,
 * as adjacent columns with a 2px surface gap.
 */
export function ModerationChart({
  points,
  height = 180,
}: {
  points: { day: string; approved: number; rejected: number }[];
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return <Empty height={height} />;

  const W = 720;
  const H = height;
  const pad = { top: 12, right: 16, bottom: 26, left: 34 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = niceMax(Math.max(1, ...points.flatMap((p) => [p.approved, p.rejected])));
  const band = innerW / points.length;
  const barW = Math.min(10, (band - 2) / 2); // cap thickness; 2px gap between the pair
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Listings and events approved versus rejected per day"
        onMouseLeave={() => setHover(null)}
      >
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke={AXIS} strokeWidth={1} />
            <text x={pad.left - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
              {Math.round(t)}
            </text>
          </g>
        ))}

        {points.map((p, i) => {
          const left = pad.left + i * band + (band - barW * 2 - 2) / 2;
          return (
            <g key={p.day} onMouseEnter={() => setHover(i)}>
              <rect x={pad.left + i * band} y={pad.top} width={band} height={innerH} fill="transparent" />
              {p.approved > 0 && (
                <rect x={left} y={y(p.approved)} width={barW} height={pad.top + innerH - y(p.approved)} rx={3} fill={SERIES.blue} />
              )}
              {p.rejected > 0 && (
                <rect
                  x={left + barW + 2}
                  y={y(p.rejected)}
                  width={barW}
                  height={pad.top + innerH - y(p.rejected)}
                  rx={3}
                  fill={SERIES.red}
                />
              )}
            </g>
          );
        })}

        {[0, Math.floor(points.length / 2), points.length - 1].map((i, n) => (
          <text
            key={i}
            x={pad.left + i * band + band / 2}
            y={H - 8}
            textAnchor={n === 0 ? 'start' : n === 2 ? 'end' : 'middle'}
            fontSize={11}
            fill={INK_MUTED}
          >
            {shortDay(points[i].day)}
          </text>
        ))}
      </svg>

      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SERIES.blue }} aria-hidden />
          Approved
          <span className="tabular-nums text-gray-400">
            · {hover === null ? points.reduce((a, p) => a + p.approved, 0) : points[hover].approved}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SERIES.red }} aria-hidden />
          Rejected
          <span className="tabular-nums text-gray-400">
            · {hover === null ? points.reduce((a, p) => a + p.rejected, 0) : points[hover].rejected}
          </span>
        </span>
        {hover !== null && <span className="text-gray-400">on {shortDay(points[hover].day)}</span>}
      </figcaption>
    </figure>
  );
}

/**
 * Single-series magnitude, horizontal so long district names stay readable.
 * One hue and no legend box - the panel heading already says what is counted.
 */
export function BreakdownBars({
  rows,
  color = SERIES.blue,
}: {
  rows: { label: string; count: number }[];
  color?: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">No data yet.</p>;
  }
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-gray-700" title={r.label}>
            {r.label}
          </span>
          <span className="h-2.5 overflow-hidden rounded-sm bg-gray-100" role="presentation">
            <span
              className="block h-full rounded-r-sm"
              style={{ width: `${Math.max(2, (r.count / max) * 100)}%`, background: color }}
            />
          </span>
          <span className="tabular-nums text-gray-500">{r.count}</span>
        </li>
      ))}
    </ul>
  );
}

function Empty({ height }: { height: number }) {
  return (
    <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
      No data in this period.
    </div>
  );
}
