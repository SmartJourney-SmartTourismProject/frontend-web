'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bookmark, BookmarkCheck, Send } from 'lucide-react';
import { chatApi, tripsApi } from '@/lib/api';
import { useTripStore } from '@/lib/trip-store';
import type { SaveTripPayload, TripPlanResponse } from '@/lib/types';

interface ChatEntry {
  role: 'user' | 'assistant' | 'error';
  content: string;
  plan?: TripPlanResponse;
}

const QUICK_ACTIONS = [
  'Show budget breakdown',
  'Make it cheaper',
  'Add a restaurant recommendation',
];

export function ChatPanel() {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

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
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

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

      const plan = await chatApi.sendMessage(activeSessionId, trimmed);

      setEntries((prev) => [
        ...prev,
        { role: 'assistant', content: plan.final_response ?? '(no response)', plan },
      ]);
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
                  <ItinerarySummary plan={entry.plan} />
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

        {entries.length > 0 && !sending && (
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {action}
              </button>
            ))}
          </div>
        )}
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

function ItinerarySummary({ plan }: { plan: TripPlanResponse }) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    if (saveState === 'saving' || saveState === 'saved') return;
    setSaveState('saving');
    const payload: SaveTripPayload = {
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
    try {
      await tripsApi.save(payload);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900">
      <div className="flex items-center justify-between bg-brand-600 px-3 py-2 text-xs font-semibold text-white">
        <span>
          {plan.destination ?? 'Trip'} · {plan.itinerary.length} day{plan.itinerary.length > 1 ? 's' : ''}
        </span>
        <span className="rounded-full bg-white/20 px-2 py-0.5">{plan.plan_source ?? 'plan'}</span>
      </div>
      <ul className="divide-y divide-gray-100">
        {plan.itinerary.map((day) => (
          <li key={day.day} className="px-3 py-2 text-xs">
            <span className="font-semibold text-brand-700">DAY {day.day}</span>{' '}
            <span className="text-gray-600">{day.items.map((item) => item.name).join(' → ')}</span>
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
          onClick={handleSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition ${
            saveState === 'saved'
              ? 'bg-emerald-50 text-emerald-600'
              : saveState === 'error'
                ? 'bg-red-50 text-red-600'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
          }`}
        >
          {saveState === 'saved' ? (
            <>
              <BookmarkCheck className="h-3.5 w-3.5" /> Saved
            </>
          ) : saveState === 'error' ? (
            'Save failed — retry'
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5" /> {saveState === 'saving' ? 'Saving…' : 'Save itinerary'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
