"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ConfirmActionButton } from "@/app/(admin)/components/confirm-action-button";
import { changeMemberRole, removeMember } from "@/modules/admin/actions";

const ROLES = ["owner", "manager", "member", "billing"] as const;

interface Props {
  orgId: string;
  userId: string;
  email: string;
  role: string;
}

export function MemberActions({ orgId, userId, email, role }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [pending, startTransition] = useTransition();

  const onRoleChange = (next: string) => {
    if (next === value) return;
    const prev = value;
    setValue(next); // optimistic
    startTransition(async () => {
      const res = await changeMemberRole(orgId, userId, next as (typeof ROLES)[number]);
      if (res.ok) {
        toast.success(t("admin.toast_role_changed"));
        router.refresh();
      } else {
        setValue(prev); // revert
        const key = `admin.err_${res.error}`;
        const msg = t(key);
        toast.error(msg === key ? t("admin.err_generic") : msg);
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="relative">
        <select
          aria-label={t("admin.role")}
          value={value}
          disabled={pending}
          onChange={(e) => onRoleChange(e.target.value)}
          className="h-8 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white pe-8 ps-3 text-sm text-slate-700 hover:border-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`admin.role_${r}`)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 end-2 my-auto size-4 text-slate-400"
          aria-hidden
        />
      </div>

      <ConfirmActionButton
        action={() => removeMember(orgId, userId)}
        triggerLabel={t("admin.action_remove")}
        triggerVariant="ghost"
        title={t("admin.confirm_remove_title")}
        description={t("admin.confirm_remove_body", { email })}
        confirmLabel={t("admin.action_remove")}
        confirmVariant="destructive"
        successMessage={t("admin.toast_removed")}
      />
    </div>
  );
}
