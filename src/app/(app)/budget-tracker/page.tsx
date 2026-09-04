'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useExpenseStore, useItineraryStore } from '@/lib/store'
import { BudgetDonut } from '@/components/app-shell/BudgetDonut'
import { cn } from '@/lib/utils'
import type { ExpenseCategory } from '@/types/app'
import toast from 'react-hot-toast'

const CATEGORIES: ExpenseCategory[] = ['Stays', 'Food & drink', 'Activities', 'Transport']

export default function BudgetTrackerPage() {
  const itineraries = useItineraryStore((s) => s.itineraries)
  const { expenses, addExpense } = useExpenseStore()
  const upcoming = itineraries.filter((i) => i.tab === 'upcoming')
  const [selectedId, setSelectedId] = useState(upcoming[0]?.id ?? itineraries[0]?.id)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ description: '', category: 'Activities' as ExpenseCategory, amount: '' })

  const selected = itineraries.find((i) => i.id === selectedId) ?? itineraries[0]

  const spendPerTrip = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) map.set(e.itineraryId, (map.get(e.itineraryId) ?? 0) + e.amountLKR)
    return map
  }, [expenses])

  const tripExpenses = expenses.filter((e) => e.itineraryId === selected?.id)
  const spent = spendPerTrip.get(selected?.id ?? '') ?? 0
  const remaining = (selected?.budget ?? 0) - spent
  const dailyAvg = selected?.days ? Math.round(spent / selected.days) : 0

  const categorySegments = CATEGORIES.map((cat) => ({
    label: cat,
    value: tripExpenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amountLKR, 0),
  })).filter((s) => s.value > 0)

  function statusFor(spentAmt: number, budget: number) {
    const pct = budget ? spentAmt / budget : 0
    if (pct > 1) return { label: 'Over budget', className: 'bg-red-100 text-red-700', bar: 'bg-red-500' }
    if (pct > 0.8) return { label: 'Watch', className: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' }
    return { label: 'On track', className: 'bg-green-100 text-green-700', bar: 'bg-green-500' }
  }

  function submitExpense(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.description || !amount || !selected) {
      toast.error('Add a description and amount')
      return
    }
    addExpense({
      itineraryId: selected.id,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      description: form.description,
      category: form.category,
      day: `Day ${tripExpenses.length + 1}`,
      amountLKR: amount,
    })
    setForm({ description: '', category: 'Activities', amount: '' })
    setShowForm(false)
    toast.success('Expense added')
  }

  if (!selected) {
    return <div className="p-10 text-sm text-gray-400">Plan a trip first to start tracking a budget.</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Budget tracker</h1>
          <p className="mt-1 max-w-md text-sm text-gray-500">
            Every verified stay, ticket and meal across your trips, tracked against what you set out to spend.
          </p>
        </div>
        <div className="relative">
          <select
            value={selected.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-royal-200"
          >
            {itineraries.map((i) => (
              <option key={i.id} value={i.id}>{i.title}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard dotClass="bg-royal-700" label="Total budget" value={`LKR ${selected.budget.toLocaleString()}`} sub={`Set for ${selected.days} days in ${selected.destination}`} />
        <StatCard dotClass="bg-berry-500" label="Spent so far" value={`LKR ${spent.toLocaleString()}`} sub={`${selected.budget ? Math.round((spent / selected.budget) * 100) : 0}% of budget used`} />
        <StatCard dotClass="bg-green-500" label="Remaining" value={`LKR ${remaining.toLocaleString()}`} sub={remaining >= 0 ? 'On track' : 'Over budget'} />
        <StatCard dotClass="bg-amber-500" label="Daily average" value={`LKR ${dailyAvg.toLocaleString()}`} sub={`Across ${selected.days} planned days`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900">Budgets by trip</h2>
          <p className="mt-0.5 text-xs text-gray-400">How each saved itinerary is tracking against what you set aside.</p>
          <div className="mt-5 space-y-5">
            {upcoming.map((trip) => {
              const tripSpent = spendPerTrip.get(trip.id) ?? 0
              const status = statusFor(tripSpent, trip.budget)
              const pct = trip.budget ? Math.min(100, Math.round((tripSpent / trip.budget) * 100)) : 0
              return (
                <div key={trip.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-gray-800">
                      {trip.title}
                      <span className={cn('badge', status.className)}>{status.label}</span>
                    </span>
                    <span className="text-gray-500">
                      LKR {tripSpent.toLocaleString()} / {trip.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className={cn('h-full rounded-full', status.bar)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900">Spend by category</h2>
          <p className="mt-0.5 text-xs text-gray-400">{selected.title} · current trip</p>
          <div className="mt-5">
            {categorySegments.length > 0 ? (
              <BudgetDonut segments={categorySegments} />
            ) : (
              <p className="text-sm text-gray-400">No expenses logged yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Recent expenses</h2>
            <p className="mt-0.5 text-xs text-gray-400">Logged against {selected.title}.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-berry-200 px-3 py-1.5 text-sm font-semibold text-berry-600 hover:bg-berry-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add expense
          </button>
        </div>

        {showForm && (
          <form onSubmit={submitExpense} className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-4">
            <input
              className="input sm:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Amount (LKR)"
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <button type="submit" className="btn-primary sm:col-span-4">Save expense</button>
          </form>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 font-medium">Day</th>
                <th className="py-2 text-right font-medium">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {tripExpenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-500">{expense.date}</td>
                  <td className="py-2.5 text-gray-800">{expense.description}</td>
                  <td className="py-2.5">
                    <span className="badge-primary">{expense.category}</span>
                  </td>
                  <td className="py-2.5 text-gray-500">{expense.day}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-800">
                    {expense.amountLKR.toLocaleString()}
                  </td>
                </tr>
              ))}
              {tripExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No expenses logged for this trip yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ dotClass, label, value, sub }: { dotClass: string; label: string; value: string; sub: string }) {
  return (
    <div className="card p-5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <span className={cn('h-2 w-2 rounded-full', dotClass)} /> {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
    </div>
  )
}
