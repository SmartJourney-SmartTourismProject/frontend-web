import type { ItineraryDay, TripDetail } from './types';

/** Prisma serializes a `Time` column as a full ISO datetime on the 1970-01-01
 * epoch (e.g. "1970-01-01T09:00:00.000Z") - this pulls just the HH:MM back
 * out for display, in UTC since that's how it was stored (see
 * backend/src/trips/trips.service.ts's parseTimeOfDay). */
function formatTimeOfDay(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

/** Converts a saved trip's DB shape (itinerary_day/itinerary_item,
 * latitude/longitude, start_time) into the same ItineraryDay[] shape
 * TripPlanResponse uses, so RouteMapPanel and the chat's itinerary summary
 * rendering can be reused as-is for a saved trip's detail view. */
export function tripToItineraryDays(trip: TripDetail): ItineraryDay[] {
  return trip.itinerary_day.map((day) => ({
    day: day.day_number,
    date: day.date,
    items: day.itinerary_item
      .filter((item) => item.latitude != null && item.longitude != null)
      .map((item) => ({
        time: formatTimeOfDay(item.start_time),
        type: item.item_type,
        name: item.name,
        notes: item.notes,
        lat: item.latitude as number,
        lon: item.longitude as number,
        est_cost: item.est_cost ? Number(item.est_cost) : null,
      })),
  }));
}
