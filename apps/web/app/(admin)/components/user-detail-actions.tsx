"use client";

import { useTranslation } from "react-i18next";
import { ConfirmActionButton } from "@/app/(admin)/components/confirm-action-button";
import { sendUserPasswordReset, setUserActive, verifyUserEmail } from "@/modules/admin/actions";

interface Props {
  userId: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  isSelf: boolean;
}

export function UserDetailActions({ userId, email, isActive, emailVerified, isSelf }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {isActive ? (
        <ConfirmActionButton
          action={() => setUserActive(userId, false)}
          triggerLabel={t("admin.action_block")}
          triggerVariant="destructive"
          disabled={isSelf}
          disabledReason={t("admin.err_cannot_block_self")}
          title={t("admin.confirm_block_title")}
          description={t("admin.confirm_block_body", { email })}
          confirmLabel={t("admin.action_block")}
          confirmVariant="destructive"
          successMessage={t("admin.toast_blocked")}
        />
      ) : (
        <ConfirmActionButton
          action={() => setUserActive(userId, true)}
          triggerLabel={t("admin.action_unblock")}
          triggerVariant="secondary"
          title={t("admin.confirm_unblock_title")}
          description={t("admin.confirm_unblock_body", { email })}
          confirmLabel={t("admin.action_unblock")}
          successMessage={t("admin.toast_unblocked")}
        />
      )}

      {!emailVerified && (
        <ConfirmActionButton
          action={() => verifyUserEmail(userId)}
          triggerLabel={t("admin.action_verify_email")}
          triggerVariant="secondary"
          title={t("admin.confirm_verify_title")}
          description={t("admin.confirm_verify_body", { email })}
          confirmLabel={t("admin.action_verify_email")}
          successMessage={t("admin.toast_verified")}
        />
      )}

      <ConfirmActionButton
        action={() => sendUserPasswordReset(userId)}
        triggerLabel={t("admin.action_password_reset")}
        triggerVariant="secondary"
        title={t("admin.confirm_reset_title")}
        description={t("admin.confirm_reset_body", { email })}
        confirmLabel={t("admin.action_send")}
        successMessage={t("admin.toast_reset_sent")}
      />
    </div>
  );
}
