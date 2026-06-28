import { z } from "zod";
import { ZId } from "@feedyruby/types/common";
import { ZDisplayCreateInput } from "@feedyruby/types/displays";

export const ZDisplayCreateInputV2 = ZDisplayCreateInput.omit({ userId: true }).extend({
  contactId: ZId.optional(),
});

export type TDisplayCreateInputV2 = z.infer<typeof ZDisplayCreateInputV2>;
