'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, KeyRound, Loader2, Plus, Save, Stethoscope, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { LlmConfig, LlmKeySource, LlmProvider, LlmTestResult, LlmTestStatus } from '@/lib/types';

const PROVIDERS: { id: LlmProvider; label: string; note: string }[] = [
  { id: 'gemini', label: 'Google Gemini', note: 'Free tier: daily request limit per model' },
  { id: 'groq', label: 'Groq', note: 'Free tier: small per-minute token limit' },
  { id: 'anthropic', label: 'Anthropic Claude', note: 'Paid' },
  { id: 'openai', label: 'OpenAI', note: 'Paid' },
];

// Suggestions only - the model box takes any name, and "Test models" tells
// you straight away if the provider doesn't recognise it.
const MODEL_SUGGESTIONS: Record<LlmProvider, string[]> = {
  gemini: ['gemini-3.5-flash-lite', 'gemini-3.6-flash'],
  groq: ['openai/gpt-oss-120b'],
  anthropic: ['claude-haiku-4-5', 'claude-sonnet-5-5', 'claude-opus-5-5'],
  openai: [],
};

const SOURCE_LABEL: Record<LlmKeySource, string> = {
  db: 'Saved here',
  env: 'From server .env',
  none: 'Not set',
};

const TEST_BADGE: Record<LlmTestStatus, { label: string; className: string }> = {
  ok: { label: 'Working', className: 'bg-emerald-100 text-emerald-800' },
  quota: { label: 'Out of quota', className: 'bg-amber-100 text-amber-800' },
  auth: { label: 'Bad API key', className: 'bg-red-100 text-red-700' },
  not_found: { label: 'Unknown model', className: 'bg-red-100 text-red-700' },
  no_key: { label: 'No API key', className: 'bg-gray-100 text-gray-600' },
  error: { label: 'Error', className: 'bg-red-100 text-red-700' },
};

type Row = { provider: LlmProvider; model: string };

const toRows = (chain: string[]): Row[] =>
  chain.map((spec) => {
    const [provider, ...rest] = spec.split(':');
    return { provider: provider as LlmProvider, model: rest.join(':') };
  });
const toChain = (rows: Row[]) => rows.map((r) => `${r.provider}:${r.model.trim()}`);

function errorMessage(err: unknown, fallback: string) {
  const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (message) return Array.isArray(message) ? message.join('; ') : message;
  // A plain Error thrown by this panel's own checks (not an HTTP failure).
  if (err instanceof Error && !('response' in err)) return err.message;
  return fallback;
}

/**
 * Admin > AI models: which LLMs the trip planner uses and in what order
 * (first = main, the rest = automatic backups when one is out of quota or
 * down), the provider API keys, and a live test of every model in the chain.
 * Saved settings reach the AI backend without a restart.
 */
export function LlmPanel() {
  const [config, setConfig] = useState<LlmConfig | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [tests, setTests] = useState<Record<string, LlmTestResult>>({});
  const [keyDraft, setKeyDraft] = useState<{ provider: LlmProvider; value: string } | null>(null);

  const apply = useCallback((next: LlmConfig) => {
    setConfig(next);
    setRows(toRows(next.chain));
    setDirty(false);
  }, []);

  useEffect(() => {
    adminApi
      .llm()
      .then(apply)
      .catch((err) => setLoadError(errorMessage(err, 'Could not load the AI model settings.')));
  }, [apply]);

  const run = async (label: string, action: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err, 'Something went wrong.'));
    } finally {
      setBusy(null);
    }
  };

  const update = (index: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setDirty(true);
  };
  const move = (index: number, by: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
    setDirty(true);
  };
  const remove = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };
  const add = () => {
    setRows((prev) => [...prev, { provider: 'anthropic', model: 'claude-haiku-4-5' }]);
    setDirty(true);
  };

  const saveChain = () =>
    run('chain', async () => {
      if (rows.length === 0) throw new Error('Keep at least one model.');
      if (rows.some((r) => !r.model.trim())) throw new Error('Every row needs a model name.');
      apply(await adminApi.setLlmChain(toChain(rows)));
      setTests({});
      setNotice('Saved. The trip planner uses the new order from the next request.');
    });

  const saveKey = () =>
    keyDraft &&
    run(`key:${keyDraft.provider}`, async () => {
      apply(await adminApi.setLlmKey(keyDraft.provider, keyDraft.value));
      setKeyDraft(null);
      setTests({});
      setNotice('API key saved.');
    });

  const clearKey = (provider: LlmProvider) =>
    run(`key:${provider}`, async () => {
      if (!confirm('Remove the saved key? The server .env key (if any) will be used instead.')) return;
      apply(await adminApi.clearLlmKey(provider));
      setTests({});
    });

  const test = () =>
    run('test', async () => {
      const { results } = await adminApi.testLlm();
      setTests(Object.fromEntries(results.map((r) => [r.spec, r])));
    });

  if (loadError) {
    return <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>;
  }
  if (!config) {
    return (
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  }

  const keySource = (p: LlmProvider) => config.providers.find((x) => x.provider === p);

  return (
    <div className="flex flex-col gap-6">
      {!config.ai_backend_reachable && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The AI backend isn&apos;t reachable (or INTERNAL_API_TOKEN differs between the two .env files), so this
          shows saved settings, not what is running. Changes still save and apply when it&apos;s back.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      {/* ---- Model chain ---- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Models</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Tried top to bottom: the first is the main model, the rest take over automatically when one is out
              of quota or down. {config.chain_source === 'env' && 'Currently the default order from the server .env.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void test()}
            disabled={busy !== null || dirty}
            title={dirty ? 'Save first, then test' : 'Sends one tiny request to each model'}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {busy === 'test' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stethoscope className="h-4 w-4" />}
            Test models
          </button>
        </div>

        <datalist id="llm-model-suggestions-gemini">
          {MODEL_SUGGESTIONS.gemini.map((m) => <option key={m} value={m} />)}
        </datalist>
        <datalist id="llm-model-suggestions-groq">
          {MODEL_SUGGESTIONS.groq.map((m) => <option key={m} value={m} />)}
        </datalist>
        <datalist id="llm-model-suggestions-anthropic">
          {MODEL_SUGGESTIONS.anthropic.map((m) => <option key={m} value={m} />)}
        </datalist>
        <datalist id="llm-model-suggestions-openai">
          {MODEL_SUGGESTIONS.openai.map((m) => <option key={m} value={m} />)}
        </datalist>

        <ol className="mt-4 flex flex-col gap-2">
          {rows.map((row, i) => {
            const result = tests[`${row.provider}:${row.model.trim()}`];
            const hasKey = keySource(row.provider)?.source !== 'none';
            return (
              <li
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 px-3 py-2"
              >
                <span
                  className={`w-[4.5rem] shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${
                    i === 0 ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {i === 0 ? 'Main' : `Backup ${i}`}
                </span>
                <select
                  value={row.provider}
                  onChange={(e) => {
                    const provider = e.target.value as LlmProvider;
                    update(i, { provider, model: MODEL_SUGGESTIONS[provider][0] ?? '' });
                  }}
                  aria-label="Provider"
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  value={row.model}
                  onChange={(e) => update(i, { model: e.target.value })}
                  list={`llm-model-suggestions-${row.provider}`}
                  placeholder="model name"
                  aria-label="Model"
                  className="min-w-[12rem] flex-1 rounded-lg border border-gray-300 px-2 py-1.5 font-mono text-sm"
                />
                {!hasKey && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    No key, skipped
                  </span>
                )}
                {result && (
                  <span
                    title={result.message}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TEST_BADGE[result.status].className}`}
                  >
                    {TEST_BADGE[result.status].label}
                    {result.status === 'ok' && result.latency_ms != null && ` · ${(result.latency_ms / 1000).toFixed(1)}s`}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-1">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Remove" disabled={rows.length === 1} onClick={() => remove(i)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={add}
            disabled={rows.length >= 6}
            className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add model
          </button>
          <button
            type="button"
            onClick={() => void saveChain()}
            disabled={!dirty || busy !== null}
            className="flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === 'chain' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save order
          </button>
        </div>
      </section>

      {/* ---- API keys ---- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">API keys</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Keys saved here are encrypted and override the server .env. They are never shown again, only their last 4
          characters.
        </p>
        {!config.encryption_configured && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            SETTINGS_ENCRYPTION_KEY isn&apos;t set on the server, so keys can&apos;t be saved here yet. Keys in the
            .env files still work.
          </p>
        )}

        <ul className="mt-4 divide-y divide-gray-100">
          {PROVIDERS.map((p) => {
            const status = keySource(p.id);
            const editing = keyDraft?.provider === p.id;
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <KeyRound className="h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-[10rem]">
                  <p className="text-sm font-semibold text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.note}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    status?.source === 'none' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {SOURCE_LABEL[status?.source ?? 'none']}
                  {status?.source === 'db' && status.last4 && ` · …${status.last4}`}
                </span>

                <div className="ml-auto flex items-center gap-2">
                  {editing ? (
                    <>
                      <input
                        type="password"
                        autoFocus
                        autoComplete="off"
                        value={keyDraft.value}
                        onChange={(e) => setKeyDraft({ provider: p.id, value: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && void saveKey()}
                        placeholder="Paste API key"
                        className="w-56 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => void saveKey()}
                        disabled={keyDraft.value.trim().length < 8 || busy !== null}
                        className="rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {busy === `key:${p.id}` ? 'Saving…' : 'Save'}
                      </button>
                      <IconButton label="Cancel" onClick={() => setKeyDraft(null)}>
                        <X className="h-4 w-4" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setKeyDraft({ provider: p.id, value: '' })}
                        disabled={!config.encryption_configured || busy !== null}
                        className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                      >
                        {status?.source === 'db' ? 'Replace' : 'Add key'}
                      </button>
                      {status?.source === 'db' && (
                        <button
                          type="button"
                          onClick={() => void clearKey(p.id)}
                          disabled={busy !== null}
                          className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
