'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { SIGN_IN_STARTED_KEY, signOutEverywhere } from '@/lib/auth-client';

// Marks the history entry the app was entered on after signing in. Going
// Back past it would land in the sign-in pages (Keycloak's form, /login),
// which then either fail ("sign-in was cancelled") or offer a login for
// another account while Keycloak still has this one signed in ("already
// authenticated as different user"). So Back from there asks first.
const BASE_MARK = 'sjSignInBase';

/**
 * After a sign-in, puts one extra history entry on top of the first app
 * page. Pressing Back pops it (the page stays put), and instead of leaving
 * for the sign-in pages the user is asked: stay, or sign out.
 */
export function BackToSignInGuard() {
  const user = useSession().data?.user;
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let justSignedIn = false;
    try {
      justSignedIn = sessionStorage.getItem(SIGN_IN_STARTED_KEY) === '1';
      sessionStorage.removeItem(SIGN_IN_STARTED_KEY);
    } catch {
      // Storage blocked - no guard, Back behaves as before.
    }
    if (justSignedIn) {
      // Next.js keeps its router state in history.state, so keep it and add
      // the mark; the pushed entry gets Next's state copied in by Next's
      // own pushState patch.
      window.history.replaceState({ ...window.history.state, [BASE_MARK]: true }, '');
      window.history.pushState(null, '', window.location.href);
    }

    // Registered on every mount, not only right after sign-in, so the guard
    // still works after a reload - the marked entry survives in history.
    const onPopState = (event: PopStateEvent) => {
      if ((event.state as Record<string, unknown> | null)?.[BASE_MARK]) setOpen(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const stay = useCallback(() => {
    // Re-add the entry Back just used up, so the next Back asks again.
    window.history.pushState(null, '', window.location.href);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, stay]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={stay}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="back-guard-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="back-guard-title" className="text-base font-semibold text-gray-900">
          Sign out before going back?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Going back takes you to the sign-in page, but you&rsquo;re still signed in
          {user?.email ? ` as ${user.email}` : ''}. Sign out first if you want to leave or use a different
          account.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={stay}
            disabled={signingOut}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Stay signed in
          </button>
          <button
            type="button"
            onClick={() => {
              setSigningOut(true);
              void signOutEverywhere();
            }}
            disabled={signingOut}
            className="flex items-center gap-1.5 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}
