import { z } from "zod";
import { ZId } from "@feedyruby/types/common";
import { ZOrganizationUpdateInput } from "@feedyruby/types/organizations";

export const ZOrganizationAISettingsInput = ZOrganizationUpdateInput.pick({
  isAISmartToolsEnabled: true,
});

export const ZUpdateOrganizationAISettingsAction = z.object({
  organizationId: ZId,
  data: ZOrganizationAISettingsInput,
});
