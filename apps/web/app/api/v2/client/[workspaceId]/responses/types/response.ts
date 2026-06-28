import { z } from "zod";
import { ZId } from "@feedyruby/types/common";
import { ZResponseInput } from "@feedyruby/types/responses";

export const ZResponseInputV2 = ZResponseInput.omit({ userId: true }).extend({
  contactId: ZId.nullish(),
  recaptchaToken: z.string().nullish(),
});
export type TResponseInputV2 = z.infer<typeof ZResponseInputV2>;
