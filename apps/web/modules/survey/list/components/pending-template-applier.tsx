"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { TUserLocale } from "@feedyruby/types/user";
import { FEEDYRUBY_PENDING_TEMPLATE_LS } from "@/lib/localStorage";
import { createSurveyFromTemplate } from "@/modules/survey/components/template-list/lib/v3-template-client";

/**
 * Completes the marketing "use this template" flow. When the user lands in their
 * workspace after choosing a template (see UseTemplateButton), the template id
 * is waiting in localStorage. We read it once, create a survey from it, and open
 * the editor — so the visitor ends up exactly where they intended, even across a
 * fresh signup + onboarding.
 *
 * Renders a lightweight overlay while creating so the survey list doesn't flash.
 * No-op (returns null) when there's nothing pending or the user is read-only.
 */
export function PendingTemplateApplier({
  workspaceId,
  defaultLanguage,
  isReadOnly,
}: {
  workspaceId: string;
  defaultLanguage: TUserLocale;
  isReadOnly: boolean;
}) {
  const router = useRouter();
  const started = useRef(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (started.current || isReadOnly) return;

    let templateId: string | null = null;
    try {
      templateId = localStorage.getItem(FEEDYRUBY_PENDING_TEMPLATE_LS);
      // Clear synchronously BEFORE the async call so a re-render / StrictMode
      // double-invoke can't create the survey twice.
      if (templateId) localStorage.removeItem(FEEDYRUBY_PENDING_TEMPLATE_LS);
    } catch {
      templateId = null;
    }
    if (!templateId) return;

    started.current = true;
    setActive(true);

    createSurveyFromTemplate({
      workspaceId,
      templateId,
      source: "catalog",
      surveyType: "link",
      defaultLanguage,
    })
      .then((survey) => {
        router.replace(`/workspaces/${workspaceId}/surveys/${survey.id}/edit`);
      })
      .catch(() => {
        // Template couldn't be created (unknown id, permissions, etc.) — drop the
        // overlay and leave the user on their survey list rather than stuck.
        setActive(false);
      });
  }, [workspaceId, defaultLanguage, isReadOnly, router]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm dark:bg-slate-950/90">
      <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">در حال ساخت نظرسنجی از قالب…</p>
    </div>
  );
}
