"use client";

import { useTranslation } from "react-i18next";
import { ConfirmActionButton } from "@/app/(admin)/components/confirm-action-button";
import { deleteOrg, setOrgSuspended } from "@/modules/admin/actions";

interface Props {
  orgId: string;
  orgName: string;
  suspended: boolean;
  /** True when the acting operator belongs to this org — self-targeting is blocked. */
  isOwnOrg: boolean;
}

export function OrgDangerZone({ orgId, orgName, suspended, isOwnOrg }: Props) {
  const { t } = useTranslation();

  return (
    <section className="rounded-lg border border-red-200 bg-red-50/40 p-4">
      <h2 className="mb-1 text-sm font-semibold text-red-700">{t("admin.danger_zone")}</h2>
      <p className="mb-4 text-sm text-slate-500">{t("admin.danger_zone_hint")}</p>
      <div className="flex flex-wrap gap-2">
        {suspended ? (
          <ConfirmActionButton
            action={() => setOrgSuspended(orgId, false)}
            triggerLabel={t("admin.action_unsuspend_org")}
            triggerVariant="secondary"
            title={t("admin.confirm_unsuspend_title")}
            description={t("admin.confirm_unsuspend_body", { name: orgName })}
            confirmLabel={t("admin.action_unsuspend_org")}
            successMessage={t("admin.toast_org_unsuspended")}
          />
        ) : (
          <ConfirmActionButton
            action={() => setOrgSuspended(orgId, true)}
            triggerLabel={t("admin.action_suspend_org")}
            triggerVariant="secondary"
            disabled={isOwnOrg}
            disabledReason={t("admin.err_cannot_target_own_org")}
            title={t("admin.confirm_suspend_title")}
            description={t("admin.confirm_suspend_body", { name: orgName })}
            confirmLabel={t("admin.action_suspend_org")}
            confirmVariant="destructive"
            successMessage={t("admin.toast_org_suspended")}
          />
        )}

        <ConfirmActionButton
          action={() => deleteOrg(orgId, orgName)}
          triggerLabel={t("admin.action_delete_org")}
          triggerVariant="destructive"
          disabled={isOwnOrg}
          disabledReason={t("admin.err_cannot_target_own_org")}
          title={t("admin.confirm_delete_title")}
          description={t("admin.confirm_delete_body", { name: orgName })}
          confirmLabel={t("admin.action_delete_org")}
          confirmVariant="destructive"
          successMessage={t("admin.toast_org_deleted")}
          confirmPhrase={orgName}
          confirmPhraseLabel={t("admin.confirm_delete_phrase_label", { name: orgName })}
          redirectTo="/admin/organizations"
        />
      </div>
    </section>
  );
}
