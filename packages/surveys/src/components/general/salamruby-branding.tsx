import { useTranslation } from "react-i18next";

const STUDIO_URL = "https://techruby.ir";

export function SalamRubyBranding() {
  const { t } = useTranslation();
  const productName = t("common.studio_product_name");
  const studioName = t("common.studio_name");
  const lead = t("common.studio_credit_lead");
  const tail = t("common.studio_credit_tail");

  const credit = (
    <p className="text-signature text-xs">
      <span className="text-branding-text font-semibold">{productName}</span>
      <span aria-hidden className="text-slate-300">
        {" "}
        ·{" "}
      </span>
      <span className="text-branding-text">
        {lead}
        {lead ? "\u00a0" : ""}
        <b>
          <span className="hover:text-signature">{studioName}</span>
        </b>
        {tail ? `\u00a0${tail}` : ""}
      </span>
    </p>
  );

  return (
    <span className="flex justify-center">
      <a href={STUDIO_URL} target="_blank" tabIndex={-1} rel="noopener noreferrer">
        {credit}
      </a>
    </span>
  );
}
