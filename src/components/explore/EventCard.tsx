import { CalendarDays, MapPin } from 'lucide-react';
import { RevealCard } from '@/components/motion/Reveal';
import type { ExploreEvent } from '@/lib/types';

function formatWhen(event: ExploreEvent): string {
  const start = new Date(event.start_datetime);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startText = start.toLocaleDateString(undefined, opts);
  if (!event.end_datetime) return startText;
  const endText = new Date(event.end_datetime).toLocaleDateString(undefined, opts);
  return endText === startText ? startText : `${startText} – ${endText}`;
}

function formatPrice(event: ExploreEvent): string | null {
  if (event.price_min == null) return null;
  const min = Number(event.price_min);
  const max = event.price_max != null ? Number(event.price_max) : min;
  const currency = event.currency ?? 'LKR';
  if (min === 0 && max === 0) return 'Free';
  return max > min
    ? `${min.toLocaleString()}–${max.toLocaleString()} ${currency}`
    : `${min.toLocaleString()} ${currency}`;
}

/** Same footprint as ListingCard (w-40) so both sit in the same rows/grids.
 *  Events have no photo source, so the tile shows the date instead. */
export function EventCard({ event, index = 0 }: { event: ExploreEvent; index?: number }) {
  const price = formatPrice(event);
  const tile = (
    <div className="relative flex aspect-square w-40 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl bg-purple-100 px-2 text-center text-purple-700 shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent bg-[length:200%_100%]" />
      <CalendarDays className="relative h-8 w-8 animate-float" />
      <span className="relative text-sm font-semibold">{formatWhen(event)}</span>
      {price && <span className="relative text-[11px] text-purple-600">{price}</span>}
    </div>
  );

  return (
    <RevealCard className="w-40 shrink-0 snap-start" index={index}>
      <div className="group transition-transform duration-300 hover:-translate-y-1">
        {event.source_url ? (
          <a href={event.source_url} target="_blank" rel="noopener noreferrer" title="Event page">
            {tile}
          </a>
        ) : (
          tile
        )}
        <p className="mt-2 truncate text-xs font-bold uppercase text-brand-800" title={event.name}>
          {event.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-gray-500">
          <MapPin className="h-3 w-3 shrink-0" />
          {event.venue_name ?? event.district?.name}
        </p>
      </div>
    </RevealCard>
  );
}
