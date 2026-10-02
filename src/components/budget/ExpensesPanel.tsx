'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { EmptyIllustration } from './EmptyIllustration';
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
          className="flex items-center gap-1 rounded-full border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:scale-105 hover:bg-brand-50 active:scale-95"
        >
          <Plus
            className={`h-3.5 w-3.5 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`}
          />{' '}
          Add expense
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 overflow-x-auto">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <EmptyIllustration className="h-24 w-28" />
            <p className="mt-2 text-sm text-gray-500">No expenses logged yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                <th className="pb-2 pr-4 font-semibold">Date</th>
                <th className="pb-2 pr-4 font-semibold">Description</th>
                <th className="pb-2 pr-4 font-semibold">Category</th>
                <th className="pb-2 pr-4 text-right font-semibold">Amount</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-50 transition-colors hover:bg-brand-50/40"
                >
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
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
