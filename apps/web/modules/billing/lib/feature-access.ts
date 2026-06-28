import "server-only";
import { IS_FEEDYRUBY_CLOUD } from "@/lib/constants";
import {
  hasOrganizationEntitlement,
  hasOrganizationEntitlementWithLicenseGuard,
} from "@/modules/entitlements/lib/checks";

export const hasCloudEntitlement = async (
  organizationId: string,
  featureLookupKey: string
): Promise<boolean> => {
  if (!IS_FEEDYRUBY_CLOUD) return false;
  return hasOrganizationEntitlement(organizationId, featureLookupKey);
};

export const hasCloudEntitlementWithLicenseGuard = async (
  organizationId: string,
  featureLookupKey: string
): Promise<boolean> => {
  if (!IS_FEEDYRUBY_CLOUD) return false;
  return hasOrganizationEntitlementWithLicenseGuard(organizationId, featureLookupKey);
};
