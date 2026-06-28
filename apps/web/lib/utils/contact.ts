import { TContactAttributes } from "@feedyruby/types/contact-attribute";
import { TResponseContact } from "@feedyruby/types/responses";

export const getContactIdentifier = (
  contact: TResponseContact | null,
  contactAttributes: TContactAttributes | null
): string => {
  return contactAttributes?.email || contact?.userId || "";
};
