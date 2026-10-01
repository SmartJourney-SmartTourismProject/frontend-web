'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { isAxiosError } from 'axios';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { Bookmark, BookmarkCheck, ChevronDown, MapPinOff, Send, Square } from 'lucide-react';
import { CountUp } from '@/components/ui/CountUp';
import { EASE_OUT, SPRING_BOUNCY } from '@/lib/motion';
import { chatApi, exploreApi, tripsApi, usersApi } from '@/lib/api';
import { useTripStore } from '@/lib/trip-store';
import { useCurrentLocation } from '@/lib/use-current-location';
import { useProfileStore } from '@/lib/profile-store';
import type { SaveTripPayload, TripPlanResponse, TripSource } from '@/lib/types';
import { PhotoLightbox, type LightboxPhoto } from './PhotoLightbox';

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

/**
 * At least one day with at least one stop. Counting days alone let a failed
 * plan (days with nothing in them) render as a card of 0 LKR days with a
 * Save button, and offer "Make it cheaper" on it.
 */
function hasStops(plan?: Pick<TripPlanResponse, 'itinerary'> | null): boolean {
  return (plan?.itinerary ?? []).some((day) => (day.items?.length ?? 0) > 0);
}

/** A plan is only useful to refine if it actually has stops in it. */
function hasItinerary(entry?: ChatEntry): boolean {
  return hasStops(entry?.plan);
}

/** `centered`: with the map hidden, keep the conversation in a middle column
 * instead of stretching edge to edge. */
export function ChatPanel({ centered = false }: { centered?: boolean }) {
  const column = centered ? 'mx-auto w-full max-w-3xl' : '';
  const reduced = useReducedMotion();
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
  // Sent with every message so a trip that names no departure point can
  // still be routed from where the traveler actually is. Null until the
  // browser answers, and null forever if they decline - the server then
  // falls back to IP geolocation on its own.
  // Gated by the "Enable location access" setting (Settings > Account).
  const locationEnabled = useProfileStore((s) => s.locationEnabled);
  const setLocationEnabled = useProfileStore((s) => s.setLocationEnabled);
  const {
    coords: currentLocation,
    status: locationStatus,
    request: requestLocation,
  } = useCurrentLocation(locationEnabled);
  const [turningOnLocation, setTurningOnLocation] = useState(false);
  const turnOnLocation = async () => {
    setTurningOnLocation(true);
    try {
      await usersApi.updateMe({ location_enabled: true });
      setLocationEnabled(true);
    } catch {
      // Leave it off; the Settings toggle is the other way in.
    } finally {
      setTurningOnLocation(false);
    }
  };
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Aborts the in-flight planner request when the user presses Stop.
  const abortRef = useRef<AbortController | null>(null);

  // Landing/Explore "Plan a trip here" links arrive as /home?prompt=... -
  // typed into the box but never auto-sent, so the traveler can edit first.
  // Read from window (not useSearchParams) to keep this page statically
  // renderable without a Suspense boundary.
  // The box grows with the prompt, up to about three times its one-line height
  // (then it scrolls). Also shrinks back after sending and on prefilled prompts.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    const prompt = new URLSearchParams(window.location.search).get('prompt');
    if (!prompt) return;
    setInput(prompt.slice(0, 500));
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

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
        (acc, m, idx) => (hasStops(m.plan) ? idx : acc),
        -1,
      );
      const lastPlan = lastPlanIndex >= 0 ? session.chat_message[lastPlanIndex].plan : undefined;
      if (lastPlan) {
        setPlan({
          itinerary: lastPlan.itinerary,
          destination: lastPlan.destination,
          estimatedCost: lastPlan.estimated_cost,
          currency: lastPlan.currency,
          startLocation: lastPlan.start_location ?? null,
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
    const abort = new AbortController();
    abortRef.current = abort;
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
        plan = await chatApi.sendMessage(activeSessionId, trimmed, currentLocation ?? undefined, abort.signal);
      } catch (error) {
        if (!isMissingSession(error)) throw error;
        // Stale id: open a fresh session and send the same message again,
        // rather than stranding the user on a conversation that no longer
        // exists.
        const session = await chatApi.createSession(trimmed.slice(0, 60));
        activeSessionId = session.id;
        setSessionId(activeSessionId);
        bumpSessionsVersion();
        plan = await chatApi.sendMessage(activeSessionId, trimmed, currentLocation ?? undefined, abort.signal);
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
        if (hasStops(plan)) setSelectedPlanIndex(next.length - 1);
        return next;
      });
      if (hasStops(plan)) {
        setPlan({
          itinerary: plan.itinerary,
          destination: plan.destination,
          estimatedCost: plan.estimated_cost,
          currency: plan.currency,
          startLocation: plan.start_location ?? null,
        });
      }
      // The server renames the session from the plan it just built ("Galle →
      // Kandy · 1 day"), so the sidebar's copy is stale the moment a plan
      // lands. Without this it kept showing the placeholder title the session
      // was created with - the raw first message - until a manual reload.
      bumpSessionsVersion();
    } catch {
      // Stop pressed: the user chose this, so no error bubble.
      if (!abort.signal.aborted) {
        setEntries((prev) => [
          ...prev,
          { role: 'error', content: 'Something went wrong reaching the trip planner. Please try again.' },
        ]);
      }
    } finally {
      abortRef.current = null;
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
        <div className={column}>
        {entries.length === 0 && (
          <p className="text-sm text-gray-400">
            Type a trip request below (e.g. &ldquo;Plan a 3-day trip to Kandy, budget 60000 LKR,
            culture and history&rdquo;). Send a follow-up message afterwards to modify the same plan.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {entries.map((entry, i) => (
            <motion.div
              key={i}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className={entry.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
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
                {entry.plan && entry.plan.sources && entry.plan.sources.length > 0 && (
                  <SourcesList sources={entry.plan.sources} />
                )}
                {entry.plan && hasStops(entry.plan) && (
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
                        startLocation: entry.plan!.start_location ?? null,
                      });
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}
          {sending && <PlanningBubble />}
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
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm active:scale-95"
                  >
                    {action}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Without this the feature fails silently: a trip with no departure
          point just gets planned without one, and there is nothing on screen
          to say the browser refused location or was never asked. */}
      {locationStatus === 'off' && (
        <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600">
          <MapPinOff className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">
            Location access is off, so trips start from your destination. You can still say where you
            are starting from, e.g. &ldquo;from Colombo&rdquo;.
          </span>
          <button
            type="button"
            onClick={() => void turnOnLocation()}
            disabled={turningOnLocation}
            className="shrink-0 rounded-md border border-gray-300 px-2 py-0.5 font-medium transition hover:bg-gray-100 disabled:opacity-60"
          >
            {turningOnLocation ? 'Turning on…' : 'Turn on'}
          </button>
        </div>
      )}
      {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
        <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          <MapPinOff className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">
            {locationStatus === 'denied'
              ? 'Your browser is blocking location (allow it from the icon left of the address bar), so trips start from your destination.'
              : "Couldn't read your location, so trips start from your destination."}{' '}
            You can still say where you are starting from, e.g. &ldquo;from Colombo&rdquo;.
          </span>
          {locationStatus === 'unavailable' && (
            <button
              type="button"
              onClick={requestLocation}
              className="shrink-0 rounded-md border border-amber-300 px-2 py-0.5 font-medium transition hover:bg-amber-100"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`flex items-end gap-2 p-4 ${centered ? 'mx-auto w-full max-w-3xl' : 'border-t border-gray-100'}`}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter adds a line.
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Message SmartJourney — ask about dates, budget, or a place…"
          className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm leading-5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={sending}
        />
        {sending ? (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            aria-label="Stop generating"
            title="Stop"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition hover:scale-110 active:scale-95"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white transition hover:scale-110 hover:shadow-glow active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}

const ROW_CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const ROW_ITEM: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT } },
};

const PLANNING_STEPS = [
  'Finding places worth your time…',
  'Sequencing the days…',
  'Optimizing the route…',
  'Estimating costs…',
];

/**
 * Shown while the backend builds a plan (5-20s). The rotating status is
 * indicative, not real progress - the endpoint returns once, so there is
 * nothing truer to report - hence it only ever loops the same four lines.
 */
function PlanningBubble() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((n) => (n + 1) % PLANNING_STEPS.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
      role="status"
      aria-live="polite"
    >
      {/* 2px animated gradient ring made from a padded gradient wrapper. */}
      <div className="animate-gradient-shift rounded-2xl bg-brand-gradient-wide bg-[length:200%_100%] p-[2px] shadow-glow">
        <div className="flex items-center gap-3 rounded-[14px] bg-white px-4 py-3 text-sm text-gray-600">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-typing-dot rounded-full bg-brand-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
          <span className="sr-only">Planning your trip…</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={step}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              aria-hidden
            >
              {PLANNING_STEPS[step]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Citations for a RAG Q&A answer (ai-backend's app/rag/) - what a
 * "question" or "both" intent turn's answer actually cited, per
 * app/core/orchestrator.py's `_answer_node`. Plain links, not a card: this
 * sits directly under a chat bubble's prose, which already carries the
 * inline [N] markers the answer refers to.
 */
function SourcesList({ sources }: { sources: TripSource[] }) {
  return (
    <div className="mt-2 border-t border-black/10 pt-2 text-xs text-gray-600">
      <p className="font-medium text-gray-500">Sources</p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {sources.map((source, i) => (
          <li key={i}>
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 underline decoration-dotted underline-offset-2 hover:text-brand-700"
              >
                {source.title}
                {source.section ? ` — ${source.section}` : ''}
              </a>
            ) : (
              <span>
                {source.title}
                {source.section ? ` — ${source.section}` : ''}
              </span>
            )}
            <span className="text-gray-400"> ({source.license})</span>
          </li>
        ))}
      </ul>
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
  const [openPhoto, setOpenPhoto] = useState<number | null>(null);
  const reduced = useReducedMotion();
  // Day accordions: the first day starts open so the card is never a wall of
  // headers; the rest expand on demand.
  const [openDays, setOpenDays] = useState<Set<number>>(() => new Set([plan.itinerary[0]?.day]));
  const toggleDay = (day: number) =>
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });

  // A plan re-shown on a weather/budget question turn used to come back
  // with its day costs but a null total (fixed in ai-backend's trip.py);
  // summing the days here keeps cards already stored that way correct -
  // on screen and in what Save sends to the trip.
  const estimatedCost =
    plan.estimated_cost ??
    (plan.itinerary.some((day) => day.day_cost != null)
      ? plan.itinerary.reduce((sum, day) => sum + (day.day_cost ?? 0), 0)
      : null);

  // Up to six distinct stops that have a photo (hotels and some attractions
  // do; restaurants never do), in itinerary order - e.g. a check-in hotel
  // listed again at check-out appears once.
  const photos = useMemo<LightboxPhoto[]>(() => {
    const seen = new Set<string>();
    const out: LightboxPhoto[] = [];
    for (const day of plan.itinerary) {
      for (const item of day.items) {
        if (!item.photo_url || seen.has(item.photo_url)) continue;
        seen.add(item.photo_url);
        out.push({ url: item.photo_url, name: item.name, attribution: item.photo_attribution });
      }
    }
    return out.slice(0, 6);
  }, [plan.itinerary]);

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
          estimated_cost: estimatedCost ?? undefined,
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
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING_BOUNCY}
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
        {plan.itinerary.map((day) => {
          const open = openDays.has(day.day);
          return (
            <li key={day.day} className="px-3 py-2">
              <button
                type="button"
                onClick={() => toggleDay(day.day)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="text-xs font-semibold text-brand-700">
                  DAY {day.day}
                  {day.date && <span className="ml-1.5 font-normal text-gray-400">{day.date}</span>}
                </span>
                <span className="flex items-center gap-1.5">
                  {day.day_cost != null && (
                    <span className="text-[11px] text-gray-500">
                      {day.day_cost.toLocaleString()} {plan.currency}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="items"
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduced ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <motion.ul
                      initial="hidden"
                      animate="visible"
                      variants={ROW_CONTAINER}
                      className="flex flex-col gap-1 pt-1.5"
                    >
                      {day.items.map((item, idx) => (
                        <motion.li
                          key={idx}
                          variants={reduced ? undefined : ROW_ITEM}
                          className="flex items-baseline gap-2 text-xs"
                        >
                          <span className="w-12 shrink-0 font-mono text-gray-400">{item.time ?? '—'}</span>
                          <span className="w-24 shrink-0 text-gray-500">
                            {item.est_cost
                              ? `${item.est_cost.toLocaleString()} ${item.currency ?? plan.currency}`
                              : '—'}
                          </span>
                          <span className="text-gray-900">{item.name}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      {photos.length > 0 && (
        <div className="flex gap-3 overflow-x-auto border-t border-gray-100 px-3 py-3">
          {photos.map((photo, i) => (
            <button
              key={photo.url}
              type="button"
              onClick={() => setOpenPhoto(i)}
              title={photo.name}
              aria-label={`Enlarge photo of ${photo.name}`}
              className="group w-28 shrink-0 text-left"
            >
              <div className="relative h-24 w-28 overflow-hidden rounded-lg bg-gray-100 ring-brand-400 transition group-hover:ring-2">
                <Image src={photo.url} alt={photo.name} fill sizes="112px" className="object-cover" unoptimized />
              </div>
              <p className="mt-1 truncate text-[11px] text-gray-600">{photo.name}</p>
            </button>
          ))}
        </div>
      )}
      {openPhoto !== null && (
        <PhotoLightbox
          photos={photos}
          index={openPhoto}
          onIndexChange={setOpenPhoto}
          onClose={() => setOpenPhoto(null)}
        />
      )}
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
        <span>
          {estimatedCost != null && (
            <>
              Estimated cost:{' '}
              <CountUp value={estimatedCost} className="font-semibold text-gray-800" /> {plan.currency}
            </>
          )}
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
    </motion.div>
  );
}
