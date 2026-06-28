import { redirect } from "next/navigation";
import { IS_FEEDYRUBY_CLOUD } from "@/lib/constants";
import { getBillingFallbackPath } from "@/lib/membership/navigation";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

export const redirectBillingRoleFromRestrictedSettings = async (workspaceId: string): Promise<void> => {
  const { isBilling } = await getWorkspaceAuth(workspaceId);

  if (isBilling) {
    redirect(getBillingFallbackPath(workspaceId, IS_FEEDYRUBY_CLOUD));
  }
};
