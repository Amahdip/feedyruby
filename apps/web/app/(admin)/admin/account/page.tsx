import { notFound } from "next/navigation";
import { ChangePasswordForm } from "@/app/(admin)/components/change-password-form";
import { EditProfileDetailsForm } from "@/app/(app)/workspaces/[workspaceId]/settings/account/profile/components/EditProfileDetailsForm";
import { EMAIL_VERIFICATION_DISABLED, PASSWORD_RESET_DISABLED } from "@/lib/constants";
import { getUser } from "@/lib/user/service";
import { getTranslate } from "@/lingodotdev/server";
import { getSuperAdminSession, requireSuperAdmin } from "@/modules/admin/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Account settings for an operator. Pure operators have no workspace, so the
 * normal /workspaces/.../settings/account page is unreachable — this brings the
 * same (workspace-independent) profile + reset-password controls into the panel.
 */
export default async function AdminAccountPage() {
  await requireSuperAdmin();
  const t = await getTranslate();
  const session = await getSuperAdminSession();
  const user = session?.user ? await getUser(session.user.id) : null;
  if (!user) notFound();

  const isPasswordResetEnabled = !PASSWORD_RESET_DISABLED && user.identityProvider === "email";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.account")}</h1>
        <p className="text-sm text-slate-500">{t("admin.account_hint")}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <EditProfileDetailsForm
          user={user}
          emailVerificationDisabled={EMAIL_VERIFICATION_DISABLED}
          isPasswordResetEnabled={false}
        />
      </div>

      {isPasswordResetEnabled && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">{t("admin.change_password")}</h2>
          <p className="mb-4 text-sm text-slate-500">{t("admin.change_password_hint")}</p>
          <ChangePasswordForm />
        </div>
      )}
    </div>
  );
}
