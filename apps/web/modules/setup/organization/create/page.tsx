import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { AuthenticationError } from "@feedyruby/types/errors";
import { DISABLE_ACCOUNT_DELETION_SSO_CONFIRMATION, IS_FEEDYRUBY_CLOUD } from "@/lib/constants";
import { getHasNoOrganizations } from "@/lib/instance/service";
import { getOrganizationsByUserId } from "@/lib/organization/service";
import { getUser } from "@/lib/user/service";
import { getTranslate } from "@/lingodotdev/server";
import { requiresPasswordConfirmationForAccountDeletion } from "@/modules/account/lib/account-deletion-auth";
import { isSuperAdmin } from "@/modules/admin/lib/auth";
import { authOptions } from "@/modules/auth/lib/authOptions";
import { getIsMultiOrgEnabled } from "@/modules/ee/license-check/lib/utils";
import { RemovedFromOrganization } from "@/modules/setup/organization/create/components/removed-from-organization";
import { ClientLogout } from "@/modules/ui/components/client-logout";
import { CreateOrganization } from "./components/create-organization";

export const metadata: Metadata = {
  title: "Create Organization",
  description: "Iran's modern survey & experience management platform.",
};

export const CreateOrganizationPage = async () => {
  const t = await getTranslate();
  const session = await getServerSession(authOptions);

  if (!session) throw new AuthenticationError(t("common.session_not_found"));

  const user = await getUser(session.user.id);
  if (!user) {
    return <ClientLogout />;
  }

  const hasNoOrganizations = await getHasNoOrganizations();
  const isMultiOrgEnabled = await getIsMultiOrgEnabled();
  const userOrganizations = await getOrganizationsByUserId(session.user.id);

  // A dedicated operator (super-admin) intentionally belongs to no customer org.
  // Send them to the panel instead of the "removed from organization" wall.
  if (userOrganizations.length === 0 && (await isSuperAdmin(session.user))) {
    redirect("/admin");
  }

  if (hasNoOrganizations || isMultiOrgEnabled) {
    return <CreateOrganization />;
  }

  if (userOrganizations.length === 0) {
    return (
      <RemovedFromOrganization
        user={user}
        isFeedyRubyCloud={IS_FEEDYRUBY_CLOUD}
        isSsoIdentityConfirmationDisabled={DISABLE_ACCOUNT_DELETION_SSO_CONFIRMATION}
        requiresPasswordConfirmation={requiresPasswordConfirmationForAccountDeletion(user)}
      />
    );
  }

  return notFound();
};
