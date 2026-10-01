import type { Trip } from '@/lib/types';

// First match wins, so more specific names come before broader ones
// ("little adam" before "adam"). Photos are the landing page's curated set
// (public/images/destinations; credits are rendered in the landing Footer).
const PLACE_IMAGES: [keywords: string[], image: string][] = [
  [['little adam'], 'little-adams-peak'],
  [['adam', 'ratnapura'], 'adams-peak'],
  [['nine arch', 'ella', 'badulla'], 'nine-arch-bridge'],
  [['sigiriya', 'matale'], 'sigiriya'],
  [['dambulla'], 'dambulla'],
  [['kandy', 'temple of the tooth'], 'kandy'],
  [['galle'], 'galle-fort'],
  [['nuwara', 'eliya'], 'nuwara-eliya'],
  [['mirissa', 'matara'], 'mirissa'],
  [['yala', 'hambantota'], 'yala'],
  [['pigeon', 'trincomalee'], 'pigeon-island'],
  [["world's end", 'worlds end', 'horton'], 'worlds-end'],
];

/**
 * Photo for a trip: one of its own stops' photos when it has one, else a
 * curated photo of the place, else null (caller shows the gradient).
 */
export function tripImage(trip: Pick<Trip, 'title' | 'district' | 'cover_photo_url'>): string | null {
  if (trip.cover_photo_url) return trip.cover_photo_url;
  const text = `${trip.title ?? ''} ${trip.district?.name ?? ''}`.toLowerCase();
  for (const [keywords, image] of PLACE_IMAGES) {
    if (keywords.some((k) => text.includes(k))) return `/images/destinations/${image}.jpg`;
  }
  return null;
}
