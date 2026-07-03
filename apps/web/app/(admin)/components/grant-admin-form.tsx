"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { grantAdmin } from "@/modules/admin/actions";
import { Button } from "@/modules/ui/components/button";
import { Input } from "@/modules/ui/components/input";

export function GrantAdminForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    start(async () => {
      const res = await grantAdmin(email);
      if (res.ok) {
        toast.success(t("admin.toast_admin_granted"));
        setEmail("");
        router.refresh();
      } else {
        const key = `admin.err_${res.error}`;
        const msg = t(key);
        toast.error(msg === key ? t("admin.err_generic") : msg);
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("admin.admin_email_placeholder")}
        autoComplete="off"
        className="h-9 w-full max-w-xs"
      />
      <Button type="submit" size="sm" loading={pending} disabled={pending || !email.trim()}>
        {t("admin.action_grant_admin")}
      </Button>
    </form>
  );
}
