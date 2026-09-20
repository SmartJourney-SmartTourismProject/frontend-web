'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, Paperclip, Sparkles, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useChatStore, useItineraryStore } from '@/lib/store'
import { tripApi } from '@/lib/api'
import type { PlanTripRequest, PlanTripResponse } from '@/types/trip'
import { ItineraryPreviewCard } from './ItineraryPreviewCard'
import { cn } from '@/lib/utils'

export function ChatPanel() {
  const { threads, activeThreadId, addMessage, createThread, setActiveThread } = useChatStore()
  const addItinerary = useItineraryStore((s) => s.addItinerary)
  const user = useSession().data?.user
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [backendOffline, setBackendOffline] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const thread = threads.find((t) => t.id === activeThreadId) ?? threads[0]

  useEffect(() => {
    if (!activeThreadId && threads[0]) setActiveThread(threads[0].id)
  }, [activeThreadId, threads, setActiveThread])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread?.messages.length, isSending])

  async function send(text: string) {
    const message = text.trim()
    if (!message || isSending) return

    let activeId = thread?.id
    if (!activeId) {
      activeId = createThread(message).id
    }

    addMessage(activeId, { role: 'user', text: message })
    setInput('')
    setIsSending(true)

    const request: PlanTripRequest = {
      user_input: message,
      user_id: user?.id,
      language: 'en',
    }

    try {
      const response: PlanTripResponse = await tripApi.planTrip(request)
      setBackendOffline(false)

      if (response?.success === false && !response.final_response) {
        addMessage(activeId, {
          role: 'assistant',
          text:
            response.errors?.[0] ??
            "I couldn't build a full plan from that yet — try adding a destination, how many days, and your budget.",
        })
      } else {
        const hasItinerary = !!response?.itinerary && response.itinerary.length > 0
        addMessage(activeId, {
          role: 'assistant',
          text: response?.final_response ?? "Here's what I found for that trip.",
          itineraryPreview: hasItinerary
            ? {
                destination: request.destination,
                estimatedCost: response.estimated_cost,
                days: response.itinerary!,
              }
            : undefined,
        })

        if (response?.itinerary && response.itinerary.length > 0) {
          addItinerary({
            title: message.length > 60 ? message.slice(0, 60) + '…' : message,
            destination: request.destination ?? 'Sri Lanka',
            days: response.itinerary.length,
            dateRangeLabel: 'Just planned',
            budget: response.estimated_cost ?? 0,
            currency: 'LKR',
            status: 'verified',
            tab: 'upcoming',
          })
        }
      }
    } catch (err) {
      setBackendOffline(true)
      addMessage(activeId, {
        role: 'assistant',
        text:
          "I can't reach the SmartJourney AI backend right now. Start it locally (uvicorn in ai-backend, default http://localhost:8000) and I'll pick the conversation back up.",
      })
      toast.error('AI backend unreachable — is ai-backend running?')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-white">
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-10">
        {backendOffline && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
            <WifiOff className="h-3.5 w-3.5" /> AI backend offline — showing chat only, no live itinerary.
          </div>
        )}

        {(!thread || thread.messages.length === 0) && (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center text-gray-400">
            <Sparkles className="mb-3 h-8 w-8 text-royal-300" />
            <p className="text-sm">
              Tell SmartJourney where you're headed — destination, days, budget, who's coming.
            </p>
          </div>
        )}

        {thread?.messages.map((message) => (
          <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('flex max-w-xl gap-3', message.role === 'user' && 'flex-row-reverse')}>
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-royal-700 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div>
                {message.role === 'assistant' && (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-royal-500">
                    SmartJourney
                  </p>
                )}
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-berry-100 text-gray-900'
                      : 'bg-gray-50 text-gray-800'
                  )}
                >
                  {message.text}
                </div>
                {message.itineraryPreview && (
                  <ItineraryPreviewCard
                    destination={message.itineraryPreview.destination}
                    days={message.itineraryPreview.days}
                    estimatedCost={message.itineraryPreview.estimatedCost}
                  />
                )}
                {message.quickActions && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.quickActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => send(action)}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-royal-300 hover:text-royal-700"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 pl-11 text-sm text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Planning your trip…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="border-t border-gray-100 px-6 py-4 sm:px-10"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-royal-400 focus-within:ring-2 focus-within:ring-royal-100">
          <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-50" aria-label="Attach">
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message SmartJourney — ask about dates, budget, or a place…"
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-royal-700 text-white transition hover:bg-royal-800 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
