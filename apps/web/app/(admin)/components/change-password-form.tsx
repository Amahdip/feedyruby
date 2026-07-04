"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { changeOwnPassword } from "@/modules/admin/actions";
import { Button } from "@/modules/ui/components/button";
import { Input } from "@/modules/ui/components/input";

export function ChangePasswordForm() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error(t("admin.err_password_mismatch"));
      return;
    }
    start(async () => {
      const res = await changeOwnPassword(current, next);
      if (res.ok) {
        toast.success(t("admin.toast_password_changed"));
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        const key = `admin.err_${res.error}`;
        const msg = t(key);
        toast.error(msg === key ? t("admin.err_generic") : msg);
      }
    });
  };

  const field = (label: string, value: string, set: (v: string) => void, autoComplete: string) => (
    <div>
      <label className="mb-1 block text-sm text-slate-600">{label}</label>
      <Input
        type="password"
        value={value}
        onChange={(e) => set(e.target.value)}
        autoComplete={autoComplete}
        className="h-9"
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="max-w-sm space-y-3">
      {field(t("admin.current_password"), current, setCurrent, "current-password")}
      {field(t("admin.new_password"), next, setNext, "new-password")}
      {field(t("admin.confirm_new_password"), confirm, setConfirm, "new-password")}
      <Button type="submit" size="sm" loading={pending} disabled={pending || !current || !next || !confirm}>
        {t("admin.action_change_password")}
      </Button>
    </form>
  );
}
