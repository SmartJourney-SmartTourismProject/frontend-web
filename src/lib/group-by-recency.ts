import type { ChatSession } from './types';

/** Buckets sessions by `updated_at` into the three groups the sidebar
 * mockup uses (frontend-web/figma/home/TripNavigationSection.tsx). */
export function groupByRecency(sessions: ChatSession[]) {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const today: ChatSession[] = [];
  const previous7Days: ChatSession[] = [];
  const earlier: ChatSession[] = [];

  for (const session of sessions) {
    const ageMs = now - new Date(session.updated_at).getTime();
    if (ageMs < oneDayMs) {
      today.push(session);
    } else if (ageMs < 7 * oneDayMs) {
      previous7Days.push(session);
    } else {
      earlier.push(session);
    }
  }

  return [
    { heading: 'TODAY', sessions: today },
    { heading: 'PREVIOUS 7 DAYS', sessions: previous7Days },
    { heading: 'EARLIER', sessions: earlier },
  ].filter((group) => group.sessions.length > 0);
}
