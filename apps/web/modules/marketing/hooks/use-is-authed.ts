"use client";

import { useEffect, useState } from "react";

export type AuthState = "loading" | "authed" | "guest";

/**
 * Lightweight client-side auth probe for the PUBLIC marketing surface.
 *
 * The marketing pages are statically rendered + crawlable and are NOT wrapped in
 * a next-auth <SessionProvider>, so `useSession()` isn't available here. Instead
 * we hit the session endpoint once on mount (a cheap client-side probe).
 *
 * Returns "loading" until resolved so first paint / crawlers see the logged-out
 * CTA (good for SEO); it swaps to "authed" only after we confirm a session.
 */
export function useIsAuthed(): AuthState {
  const [state, setState] = useState<AuthState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((session) => {
        if (cancelled) return;
        setState(session && session.user ? "authed" : "guest");
      })
      .catch(() => {
        if (!cancelled) setState("guest");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
