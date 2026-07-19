"use client";

import i18n from "i18next";
import ICU from "i18next-icu";
import resourcesToBackend from "i18next-resources-to-backend";
import { ReactNode, useEffect } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { logger } from "@feedyruby/logger";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { importLocaleResources } from "@/lingodotdev/load-locale";

let isInit = false;

interface I18nProviderProps {
  children: ReactNode;
  language: string;
  defaultLanguage: string;
  localeResources: Record<string, unknown>;
}

/**
 * Initialize i18next SYNCHRONOUSLY from the server-provided bundle so translations
 * are ready on the very first render — including on the server. The previous
 * implementation gated rendering behind a client-only `useEffect` (`isReady`),
 * which made every page render an empty <body> to crawlers (killing SEO). The
 * initial locale's resources are passed inline, so no async load is needed to
 * render; the resourcesToBackend loader only lazy-loads *other* languages. Runs
 * on both server and client. `useSuspense: false` keeps react-i18next from
 * suspending (which would blank the body during SSR).
 */
function ensureI18n(locale: string, defaultLanguage: string, localeResources: Record<string, unknown>): void {
  if (!isInit) {
    try {
      i18n
        .use(ICU)
        .use(initReactI18next)
        .use(resourcesToBackend((language: string) => importLocaleResources(language)))
        .init({
          lng: locale,
          fallbackLng: defaultLanguage,
          interpolation: { escapeValue: false },
          showSupportNotice: false,
          resources: { [locale]: { translation: localeResources } },
          partialBundledLanguages: true,
          react: { useSuspense: false },
        });
      isInit = true;
    } catch (error) {
      logger.error(error);
    }
    return;
  }

  if (!i18n.hasResourceBundle(locale, "translation")) {
    i18n.addResourceBundle(locale, "translation", localeResources, true, true);
  }
  if (i18n.language !== locale) {
    void i18n.changeLanguage(locale);
  }
}

export const I18nProvider = ({ children, language, defaultLanguage, localeResources }: I18nProviderProps) => {
  const locale = language || defaultLanguage;
  // Synchronous — so children render on the server (SSR) with translations.
  ensureI18n(locale, defaultLanguage, localeResources);

  useEffect(() => {
    const resolvedLocale = i18n.resolvedLanguage ?? i18n.language;
    document.documentElement.lang = resolvedLocale;
    document.documentElement.dir = isRtlLocale(resolvedLocale) ? "rtl" : "ltr";
  }, [locale]);

  return (
    <I18nextProvider data-testid="i18next-provider" i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};
