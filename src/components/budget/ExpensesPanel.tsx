'use client';

import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Expense } from '@/lib/types';

const CATEGORIES = ['Stays', 'Transport', 'Food & drink', 'Activities', 'Other'];

export function ExpensesPanel({
  expenses,
  currency,
  onAdd,
  onDelete,
}: {
  expenses: Expense[];
  currency: string;
  onAdd: (data: { category: string; amount: number; description?: string; occurred_at?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [occurredAt, setOccurredAt] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    setSubmitting(true);
    try {
      await onAdd({
        category,
        amount: parsedAmount,
        description: description || undefined,
        occurred_at: occurredAt || undefined,
      });
      setAmount('');
      setDescription('');
      setOccurredAt('');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-brand-700">Recent expenses</h2>
          <p className="mt-0.5 text-xs text-gray-500">Logged against this trip.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-full border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add expense
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-5">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm sm:col-span-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm sm:col-span-2"
          />
          <input
            type="date"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${currency})`}
            required
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 rounded-lg bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-5"
          >
            {submitting ? 'Saving…' : 'Save expense'}
          </button>
        </form>
      )}

      <div className="mt-4 overflow-x-auto">
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-400">No expenses logged yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                <th className="pb-2 pr-4 font-semibold">Date</th>
                <th className="pb-2 pr-4 font-semibold">Description</th>
                <th className="pb-2 pr-4 font-semibold">Category</th>
                <th className="pb-2 pr-4 text-right font-semibold">Amount</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4 text-gray-500">
                    {new Date(expense.occurred_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-4 text-gray-900">{expense.description || '—'}</td>
                  <td className="py-2 pr-4">
                    <span className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-brand-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right font-semibold text-gray-900">
                    {Number(expense.amount).toLocaleString()} {expense.currency}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
