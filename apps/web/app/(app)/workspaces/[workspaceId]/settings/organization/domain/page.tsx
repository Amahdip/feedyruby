import { notFound } from "next/navigation";
import { AuthenticationError } from "@feedyruby/types/errors";
import { SettingsCard } from "@/app/(app)/workspaces/[workspaceId]/settings/components/SettingsCard";
import { redirectBillingRoleFromRestrictedSettings } from "@/app/(app)/workspaces/[workspaceId]/settings/lib/redirect-billing-role";
import { PrettyUrlsTable } from "@/app/(app)/workspaces/[workspaceId]/settings/organization/domain/components/pretty-urls-table";
import {
  IS_FEEDYRUBY_CLOUD,
  IS_STORAGE_CONFIGURED,
  SHOW_STORAGE_NOT_CONFIGURED_WARNING,
} from "@/lib/constants";
import { getTranslate } from "@/lingodotdev/server";
import { getWhiteLabelPermission } from "@/modules/ee/license-check/lib/utils";
import { FaviconCustomizationSettings } from "@/modules/ee/whitelabel/favicon-customization/components/favicon-customization-settings";
import { getSurveysWithSlugsByOrganizationId } from "@/modules/survey/lib/slug";
import { Alert, AlertDescription } from "@/modules/ui/components/alert";
import { PageContentWrapper } from "@/modules/ui/components/page-content-wrapper";
import { PageHeader } from "@/modules/ui/components/page-header";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

const Page = async (props: Readonly<{ params: Promise<{ workspaceId: string }> }>) => {
  const params = await props.params;
  await redirectBillingRoleFromRestrictedSettings(params.workspaceId);
  const t = await getTranslate();

  if (IS_FEEDYRUBY_CLOUD) {
    return notFound();
  }

  const { session, organization, isOwner, isManager } = await getWorkspaceAuth(params.workspaceId);

  if (!session) {
    throw new AuthenticationError(t("common.not_authenticated"));
  }

  const hasWhiteLabelPermission = await getWhiteLabelPermission(organization.id);
  const isOwnerOrManager = isManager || isOwner;

  const surveys = await getSurveysWithSlugsByOrganizationId(organization.id);

  return (
    <PageContentWrapper>
      <PageHeader pageTitle={t("common.domain")} />

      {SHOW_STORAGE_NOT_CONFIGURED_WARNING && (
        <div className="max-w-4xl">
          <Alert variant="warning">
            <AlertDescription>{t("common.storage_not_configured")}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-4xl">
        <Alert variant="info">
          <AlertDescription>{t("workspace.settings.domain.page_hint")}</AlertDescription>
        </Alert>
      </div>

      <FaviconCustomizationSettings
        organization={organization}
        hasWhiteLabelPermission={hasWhiteLabelPermission}
        workspaceId={params.workspaceId}
        isReadOnly={!isOwnerOrManager}
        isStorageConfigured={IS_STORAGE_CONFIGURED}
      />

      <SettingsCard
        title={t("workspace.settings.domain.title")}
        description={t("workspace.settings.domain.description")}>
        <PrettyUrlsTable surveys={surveys} />
      </SettingsCard>
    </PageContentWrapper>
  );
};

export default Page;
