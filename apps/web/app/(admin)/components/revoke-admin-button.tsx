"use client";

import { useTranslation } from "react-i18next";
import { ConfirmActionButton } from "@/app/(admin)/components/confirm-action-button";
import { revokeAdmin } from "@/modules/admin/actions";

/**
 * Client wrapper so the server-rendered Admins page doesn't pass a function
 * closure across the server→client boundary (which throws at render). The
 * `() => revokeAdmin(userId)` thunk is created here, on the client.
 */
export function RevokeAdminButton({ userId, email }: { userId: string; email: string }) {
  const { t } = useTranslation();
  return (
    <ConfirmActionButton
      action={() => revokeAdmin(userId)}
      triggerLabel={t("admin.action_revoke_admin")}
      triggerVariant="ghost"
      title={t("admin.confirm_revoke_admin_title")}
      description={t("admin.confirm_revoke_admin_body", { email })}
      confirmLabel={t("admin.action_revoke_admin")}
      confirmVariant="destructive"
      successMessage={t("admin.toast_admin_revoked")}
    />
  );
}
