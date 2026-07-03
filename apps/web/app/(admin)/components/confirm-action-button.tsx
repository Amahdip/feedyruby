"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { ActionResult } from "@/modules/admin/actions";
import { Button } from "@/modules/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/ui/components/dialog";
import { Input } from "@/modules/ui/components/input";

type Variant = "default" | "destructive" | "secondary" | "ghost";

interface Props {
  /** The server action to invoke on confirm. */
  action: () => Promise<ActionResult>;
  /** Trigger button. */
  triggerLabel: string;
  triggerVariant?: Variant;
  triggerSize?: "sm" | "default";
  /** Disable the trigger with an explanatory tooltip (e.g. can't-block-self). */
  disabled?: boolean;
  disabledReason?: string;
  /** Confirmation dialog copy. */
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  successMessage: string;
  /** When set, the confirm button stays disabled until the user types this exact phrase. */
  confirmPhrase?: string;
  confirmPhraseLabel?: string;
  /** When set, navigate here on success instead of refreshing (e.g. after deleting the current record). */
  redirectTo?: string;
}

export function ConfirmActionButton({
  action,
  triggerLabel,
  triggerVariant = "secondary",
  triggerSize = "sm",
  disabled,
  disabledReason,
  title,
  description,
  confirmLabel,
  confirmVariant = "default",
  successMessage,
  confirmPhrase,
  confirmPhraseLabel,
  redirectTo,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, startTransition] = useTransition();

  const phraseOk = !confirmPhrase || typed.trim() === confirmPhrase.trim();

  const run = () => {
    if (!phraseOk) return;
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        toast.success(successMessage);
        setOpen(false);
        setTyped("");
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      } else {
        // Map known error codes to localized copy; fall back to a generic message.
        const key = `admin.err_${res.error}`;
        const msg = t(key);
        toast.error(msg === key ? t("admin.err_generic") : msg);
      }
    });
  };

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
        onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent className="max-w-[480px] space-y-4">
          <DialogHeader>
            <DialogTitle className="text-start">{title}</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap text-start">{description}</DialogDescription>
          </DialogHeader>

          {confirmPhrase ? (
            <DialogBody className="space-y-2">
              <label className="text-sm text-slate-600">{confirmPhraseLabel}</label>
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={confirmPhrase}
                autoComplete="off"
              />
            </DialogBody>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              {t("common.cancel")}
            </Button>
            <Button variant={confirmVariant} onClick={run} loading={pending} disabled={!phraseOk || pending}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
