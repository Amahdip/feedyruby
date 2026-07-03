export interface TEmailTemplateLegalProps {
  privacyUrl?: string;
  termsUrl?: string;
  imprintUrl?: string;
  imprintAddress?: string;
  /** Right-to-left layout for the recipient's locale (e.g. Farsi). Flows through the
   *  shared props spread into EmailTemplate, which sets `dir` + text alignment. */
  isRtl?: boolean;
}
