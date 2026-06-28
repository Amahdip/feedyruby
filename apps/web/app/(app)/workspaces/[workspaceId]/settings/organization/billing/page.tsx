import { redirect } from "next/navigation";
import { IS_FEEDYRUBY_CLOUD } from "@/lib/constants";
import { getBillingFallbackPath } from "@/lib/membership/navigation";
import { PricingPage } from "@/modules/ee/billing/page";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

const Page = async (props: Readonly<{ params: Promise<{ workspaceId: string }> }>) => {
  const params = await props.params;
  const { isBilling } = await getWorkspaceAuth(params.workspaceId);

  if (isBilling && !IS_FEEDYRUBY_CLOUD) {
    redirect(getBillingFallbackPath(params.workspaceId, IS_FEEDYRUBY_CLOUD));
  }

  return PricingPage(props);
};

export default Page;
