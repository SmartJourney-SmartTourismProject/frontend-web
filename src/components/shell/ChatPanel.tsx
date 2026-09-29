'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Bookmark, BookmarkCheck, Send } from 'lucide-react';
import { chatApi, exploreApi, tripsApi } from '@/lib/api';
import { useTripStore } from '@/lib/trip-store';
import type { SaveTripPayload, TripPlanResponse } from '@/lib/types';

interface ChatEntry {
  role: 'user' | 'assistant' | 'error';
  content: string;
  plan?: TripPlanResponse;
  // The chat_message this entry was persisted as, and whether it's already
  // been saved as a trip - both needed so the itinerary card's save button
  // can survive a refresh instead of resetting to "Save itinerary" every
  // time (see ItinerarySummary).
  chatMessageId?: string;
  savedTripId?: string | null;
}

/**
 * A 404 from a chat endpoint means the session id we hold no longer names a
 * session this user owns. The id is persisted per browser (localStorage, see
 * trip-store) rather than per account, so it outlives both a sign-out and a
 * switch to a different user - and a stale one 404s on every request until
 * something clears it.
 */
function isMissingSession(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

/**
 * Refinements. Every one of these edits an itinerary that already exists, so
 * they are only offered when the last reply actually produced one - otherwise
 * the panel invites you to "make it cheaper" when there is no plan to make
 * cheaper, which is what a thin-data district or a planner error leaves behind.
 */
const REFINE_ACTIONS = [
  'Show budget breakdown',
  'Make it cheaper',
  // "Add a restaurant recommendation" was removed: the backend has no
  // targeted "add one item" follow-up, so the phrase fell through to a full
  // shape_only re-plan that drew from the same ranked pool and usually
  // returned an identical itinerary. It looked broken and cost a planning
  // cycle each time. Restore it once there is a follow-up scope that appends
  // to an itinerary instead of rebuilding it.
];

/** Openers, for a conversation that has not produced a plan yet. */
const START_ACTIONS = ['Plan a 3-day trip', 'Somewhere for a weekend', 'What can I do on a budget?'];

/** A plan is only useful to refine if it actually has stops in it. */
function hasItinerary(entry?: ChatEntry): boolean {
  return (entry?.plan?.itinerary?.length ?? 0) > 0;
}

export function ChatPanel() {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // Which chat entry's plan the map is currently showing - without this the
  // map always followed whichever plan arrived LAST, with no way to click
  // back to an earlier itinerary in the same conversation (e.g. compare the
  // 3-day and 2-day versions after a "make it 2 days" follow-up).
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null);
  // Districts the catalogue can actually plan for. Suggesting a district with
  // no verified listings just reproduces the "no listings found" reply, so the
  // openers are derived from real data rather than hard-coded.
  const [coveredDistricts, setCoveredDistricts] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    exploreApi
      .searchListings()
      .then((res) => {
        if (cancelled) return;
        const names = [...new Set(res.items.map((l) => l.district?.name).filter(Boolean) as string[])];
        setCoveredDistricts(names.slice(0, 3));
      })
      // A failure here only costs us tailored suggestions, never the chat.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const sessionId = useTripStore((s) => s.sessionId);
  const setSessionId = useTripStore((s) => s.setSessionId);
  const setPlan = useTripStore((s) => s.setPlan);
  const bumpSessionsVersion = useTripStore((s) => s.bumpSessionsVersion);

  // Restore history when the sidebar switches to an existing session.
  useEffect(() => {
    if (!sessionId) {
      setEntries([]);
      return;
    }
    let cancelled = false;
    chatApi.getSession(sessionId).then((session) => {
      if (cancelled) return;
      setEntries(
        session.chat_message.map((m) => ({
          role: m.role,
          content: m.content,
          plan: m.plan ?? undefined,
          chatMessageId: m.id,
          savedTripId: m.saved_trip_id,
        })),
      );
      // Re-hydrate the map too - without this, switching back to an older
      // session left the map showing whatever the previous session's route
      // was (or nothing, on a fresh page load).
      const lastPlanIndex = session.chat_message.reduce(
        (acc, m, idx) => (m.plan ? idx : acc),
        -1,
      );
      const lastPlan = lastPlanIndex >= 0 ? session.chat_message[lastPlanIndex].plan : undefined;
      if (lastPlan) {
        setPlan({
          itinerary: lastPlan.itinerary,
          destination: lastPlan.destination,
          estimatedCost: lastPlan.estimated_cost,
          currency: lastPlan.currency,
        });
        setSelectedPlanIndex(lastPlanIndex);
      } else {
        setSelectedPlanIndex(null);
      }
    }).catch((error) => {
      if (cancelled) return;
      // Without this the rejection was unhandled and the bad id stayed in
      // localStorage, so every later message 404'd too, with no way for the
      // user to recover short of clearing site data.
      if (isMissingSession(error)) {
        setSessionId(null);
        setEntries([]);
        return;
      }
      setEntries([
        { role: 'error', content: 'Could not load this conversation. Please try again.' },
      ]);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, setPlan, setSessionId]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setEntries((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');

    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const session = await chatApi.createSession(trimmed.slice(0, 60));
        activeSessionId = session.id;
        setSessionId(activeSessionId);
        bumpSessionsVersion();
      }

      let plan: TripPlanResponse;
      try {
        plan = await chatApi.sendMessage(activeSessionId, trimmed);
      } catch (error) {
        if (!isMissingSession(error)) throw error;
        // Stale id: open a fresh session and send the same message again,
        // rather than stranding the user on a conversation that no longer
        // exists.
        const session = await chatApi.createSession(trimmed.slice(0, 60));
        activeSessionId = session.id;
        setSessionId(activeSessionId);
        bumpSessionsVersion();
        plan = await chatApi.sendMessage(activeSessionId, trimmed);
      }

      setEntries((prev) => {
        const next = [
          ...prev,
          {
            role: 'assistant' as const,
            content: plan.final_response ?? '(no response)',
            plan,
            chatMessageId: plan.chat_message_id,
            savedTripId: null,
          },
        ];
        if (plan.itinerary.length > 0) setSelectedPlanIndex(next.length - 1);
        return next;
      });
      if (plan.itinerary.length > 0) {
        setPlan({
          itinerary: plan.itinerary,
          destination: plan.destination,
          estimatedCost: plan.estimated_cost,
          currency: plan.currency,
        });
      }
    } catch {
      setEntries((prev) => [
        ...prev,
        { role: 'error', content: 'Something went wrong reaching the trip planner. Please try again.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={logRef} className="flex-1 overflow-y-auto px-6 py-6">
        {entries.length === 0 && (
          <p className="text-sm text-gray-400">
            Type a trip request below (e.g. &ldquo;Plan a 3-day trip to Kandy, budget 60000 LKR,
            culture and history&rdquo;). Send a follow-up message afterwards to modify the same plan.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {entries.map((entry, i) => (
            <div key={i} className={entry.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  entry.role === 'user'
                    ? 'bg-brand-gradient text-white'
                    : entry.role === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-gray-100 text-gray-900'
                }`}
              >
                {entry.content}
                {entry.plan && entry.plan.itinerary.length > 0 && (
                  <ItinerarySummary
                    plan={entry.plan}
                    chatMessageId={entry.chatMessageId}
                    initialSavedTripId={entry.savedTripId}
                    isSelected={selectedPlanIndex === i}
                    onSelect={() => {
                      setSelectedPlanIndex(i);
                      setPlan({
                        itinerary: entry.plan!.itinerary,
                        destination: entry.plan!.destination,
                        estimatedCost: entry.plan!.estimated_cost,
                        currency: entry.plan!.currency,
                      });
                    }}
                  />
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                Planning your trip…
              </div>
            </div>
          )}
        </div>

        {!sending &&
          (() => {
            // Refinements only once there is something to refine; otherwise
            // offer a way forward, pointed at districts we can actually plan.
            const planned = hasItinerary(entries[entries.length - 1]);
            const suggestions = planned
              ? REFINE_ACTIONS
              : coveredDistricts.length > 0
                ? coveredDistricts.map((d) => `Plan a 3-day trip in ${d}`)
                : START_ACTIONS;
            return (
              <div className="mt-4 flex flex-wrap gap-2">
                {!planned && entries.length > 0 && (
                  <p className="w-full text-xs text-gray-500">
                    {coveredDistricts.length > 0
                      ? 'Try a destination we have verified places for:'
                      : 'Try one of these:'}
                  </p>
                )}
                {suggestions.map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            );
          })()}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message SmartJourney — ask about dates, budget, or a place…"
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white transition hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function ItinerarySummary({
  plan,
  chatMessageId,
  initialSavedTripId,
  isSelected,
  onSelect,
}: {
  plan: TripPlanResponse;
  chatMessageId?: string;
  initialSavedTripId?: string | null;
  isSelected: boolean;
  onSelect: () => void;
}) {
  // savedTripId is the source of truth for whether this card is saved -
  // seeded from the backend (which tracks it via chat_message_id) so a
  // refresh doesn't forget it and let the same itinerary be saved twice.
  const [savedTripId, setSavedTripId] = useState<string | null>(initialSavedTripId ?? null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setSavedTripId(initialSavedTripId ?? null);
  }, [initialSavedTripId, chatMessageId]);

  const handleToggleSave = async () => {
    if (pending) return;
    setPending(true);
    setError(false);
    try {
      if (savedTripId) {
        await tripsApi.remove(savedTripId);
        setSavedTripId(null);
      } else {
        const payload: SaveTripPayload = {
          chat_message_id: chatMessageId,
          destination: plan.destination ?? undefined,
          estimated_cost: plan.estimated_cost ?? undefined,
          currency: plan.currency,
          itinerary: plan.itinerary.map((day) => ({
            day: day.day,
            date: day.date,
            items: day.items.map((item) => ({
              time: item.time,
              type: item.type,
              name: item.name,
              notes: item.notes,
              lat: item.lat,
              lon: item.lon,
            })),
          })),
        };
        const trip = await tripsApi.save(payload);
        setSavedTripId(trip.id);
      }
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className={`mt-3 overflow-hidden rounded-xl border bg-white text-gray-900 ${
        isSelected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-gray-200'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        title={isSelected ? 'Shown on the map' : 'Show this itinerary on the map'}
        className="flex w-full items-center justify-between bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
      >
        <span>
          {plan.destination ?? 'Trip'} · {plan.itinerary.length} day{plan.itinerary.length > 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          {isSelected && <span className="text-[10px] font-normal text-white/80">on map</span>}
          <span className="rounded-full bg-white/20 px-2 py-0.5">{plan.plan_source ?? 'plan'}</span>
        </span>
      </button>
      <ul className="divide-y divide-gray-100">
        {plan.itinerary.map((day) => (
          <li key={day.day} className="px-3 py-2">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-brand-700">
                DAY {day.day}
                {day.date && <span className="ml-1.5 font-normal text-gray-400">{day.date}</span>}
              </span>
              {day.day_cost != null && (
                <span className="text-[11px] text-gray-500">
                  {day.day_cost.toLocaleString()} {plan.currency}
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-1">
              {day.items.map((item, idx) => (
                <li key={idx} className="flex items-baseline gap-2 text-xs">
                  <span className="w-12 shrink-0 font-mono text-gray-400">{item.time ?? '—'}</span>
                  <span className="w-24 shrink-0 text-gray-500">
                    {item.est_cost ? `${item.est_cost.toLocaleString()} ${item.currency ?? plan.currency}` : '—'}
                  </span>
                  <span className="text-gray-900">{item.name}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
        <span>
          {plan.estimated_cost != null
            ? `Estimated cost: ${plan.estimated_cost.toLocaleString()} ${plan.currency}`
            : ''}
        </span>
        <button
          onClick={handleToggleSave}
          disabled={pending}
          title={savedTripId ? 'Remove from saved itineraries' : 'Save itinerary'}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition ${
            error
              ? 'bg-red-50 text-red-600'
              : savedTripId
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
          }`}
        >
          {error ? (
            'Failed — retry'
          ) : savedTripId ? (
            <>
              <BookmarkCheck className="h-3.5 w-3.5" /> {pending ? 'Removing…' : 'Saved'}
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5" /> {pending ? 'Saving…' : 'Save itinerary'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
