"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { STUDIO_URL } from "@/lib/brand-color";
import { cn } from "@/lib/cn";
import { useRtl } from "@/lib/i18n/use-rtl";

interface StudioCreditProps {
  className?: string;
}

export const StudioCredit = ({ className }: Readonly<StudioCreditProps>) => {
  const { t } = useTranslation();
  const isRtl = useRtl();
  const studioName = t("common.studio_name");
  const productName = t("common.studio_product_name");
  const lead = t("common.studio_credit_lead");
  const tail = t("common.studio_credit_tail");

  const badge = (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-full border border-slate-200/90 bg-slate-50/90 px-3.5 py-1.5 text-center text-xs shadow-sm",
        className
      )}>
      <span className="font-semibold text-rose-800">{productName}</span>
      <span aria-hidden className="text-slate-300">
        ·
      </span>
      <span className="text-slate-500">
        {lead}
        {lead ? "\u00a0" : ""}
        <span className="font-medium text-slate-700">{studioName}</span>
        {tail ? `\u00a0${tail}` : ""}
      </span>
    </span>
  );

  const wrapperClassName = "flex w-full justify-center px-2";

  if (!STUDIO_URL) {
    return (
      <div className={wrapperClassName} dir={isRtl ? "rtl" : "ltr"}>
        {badge}
      </div>
    );
  }

  return (
    <div className={wrapperClassName} dir={isRtl ? "rtl" : "ltr"}>
      <Link
        href={STUDIO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full transition-colors hover:border-slate-300 hover:bg-white">
        {badge}
      </Link>
    </div>
  );
};
