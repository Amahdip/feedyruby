"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FEEDYRUBY_PENDING_TEMPLATE_LS } from "@/lib/localStorage";
import { useIsAuthed } from "@/modules/marketing/hooks/use-is-authed";

/**
 * Public "use this template" CTA. Stashes the chosen template id in localStorage
 * (survives signup + onboarding, same origin) and routes the visitor into the
 * app — straight to /continue if already signed in, otherwise to signup. Once
 * they land in a workspace, <PendingTemplateApplier> reads the stash, creates a
 * survey from the template, and opens the editor.
 */
export function UseTemplateButton({
  slug,
  label,
  className,
}: {
  slug: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const authState = useIsAuthed();
  const [busy, setBusy] = useState(false);

  const handleClick = () => {
    setBusy(true);
    try {
      localStorage.setItem(FEEDYRUBY_PENDING_TEMPLATE_LS, slug);
    } catch {
      /* private mode / storage disabled — fall back to a normal signup */
    }
    router.push(authState === "authed" ? "/continue" : "/auth/signup");
  };

  return (
    <button type="button" onClick={handleClick} disabled={busy} className={className}>
      {busy ? "در حال انتقال…" : label}
    </button>
  );
}
