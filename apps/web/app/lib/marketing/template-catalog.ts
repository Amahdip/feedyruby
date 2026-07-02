import "server-only";
import type { TTemplate, TTemplateRole } from "@feedyruby/types/templates";
import type { TUserLocale } from "@feedyruby/types/user";
import { templates } from "@/app/lib/templates";
import { DEFAULT_LOCALE, WEBAPP_URL } from "@/lib/constants";
import { getTranslate } from "@/lingodotdev/server";

/**
 * Public-facing template catalog.
 *
 * This is the pSEO accessor layer: it exposes the existing authenticated-app
 * `TTemplate` corpus (app/lib/templates.ts) as indexable, category-bucketed
 * public pages. We deliberately do NOT touch the source corpus — we read it,
 * filter it to the publishable subset, and decorate each entry with a Latin
 * URL slug + a Farsi buyer category.
 *
 * Slug policy: URL slugs stay Latin/transliterated (clean + shareable), while
 * H1/body/metadata render Farsi via the server i18n instance.
 */

export interface TemplateCategory {
  /** Latin URL slug, e.g. "customer-satisfaction". */
  slug: string;
  /** The underlying TTemplate role this category maps to. */
  role: TTemplateRole;
  /** Localized display label, keyed by locale. */
  label: Record<string, string>;
  /** Localized one-line category description (used in copy + metadata). */
  description: Record<string, string>;
}

/**
 * Role → Farsi buyer category. Every one of the 52 publishable templates
 * carries exactly one `role`, so this is a clean 1-template→1-category map.
 * Internal/preview templates (cuid-style ids, no role) fall outside this map
 * and are excluded from the public surface entirely.
 */
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    slug: "customer-satisfaction",
    role: "customerSuccess",
    label: { "fa-IR": "رضایت مشتری", "en-US": "Customer Satisfaction" },
    description: {
      "fa-IR": "قالب‌های آماده برای سنجش رضایت، وفاداری و تجربه مشتری (NPS، CSAT، CES و ریزش).",
      "en-US":
        "Ready-made templates to measure customer satisfaction, loyalty and experience (NPS, CSAT, CES, churn).",
    },
  },
  {
    slug: "product",
    role: "productManager",
    label: { "fa-IR": "محصول", "en-US": "Product" },
    description: {
      "fa-IR": "قالب‌های تحقیق محصول: تناسب محصول با بازار، اولویت‌بندی ویژگی‌ها و بازخورد کاربر.",
      "en-US": "Product research templates: product-market fit, feature prioritization and user feedback.",
    },
  },
  {
    slug: "market-research",
    role: "marketing",
    label: { "fa-IR": "بازاریابی و تحقیقات بازار", "en-US": "Marketing & Market Research" },
    description: {
      "fa-IR": "قالب‌های نظرسنجی بازاریابی و تحقیقات بازار برای شناخت مخاطب و سنجش پیام‌ها.",
      "en-US":
        "Marketing and market-research survey templates to understand your audience and test messaging.",
    },
  },
  {
    slug: "sales",
    role: "sales",
    label: { "fa-IR": "فروش و لید", "en-US": "Sales & Leads" },
    description: {
      "fa-IR": "قالب‌های فرم جذب لید، صلاحیت‌سنجی فروش و شناخت نیت خرید مشتری.",
      "en-US": "Lead-capture, sales qualification and purchase-intent form templates.",
    },
  },
  {
    slug: "human-resources",
    role: "peopleManager",
    label: { "fa-IR": "منابع انسانی", "en-US": "Human Resources" },
    description: {
      "fa-IR": "قالب‌های نظرسنجی کارکنان: رضایت شغلی، eNPS، توسعه فردی و فرهنگ سازمانی.",
      "en-US": "Employee survey templates: job satisfaction, eNPS, personal development and culture.",
    },
  },
];

const CATEGORY_BY_ROLE = new Map<TTemplateRole, TemplateCategory>(
  TEMPLATE_CATEGORIES.map((c) => [c.role, c])
);
const CATEGORY_BY_SLUG = new Map<string, TemplateCategory>(TEMPLATE_CATEGORIES.map((c) => [c.slug, c]));

/** Only ids that are safe, stable, human-readable URL segments. */
const VALID_SLUG = /^[a-z][a-z0-9-]*$/;

/**
 * Templates embed a `$[workspaceName]` placeholder that is replaced with the
 * real workspace name at survey-creation time. Public catalog/preview pages have
 * no workspace, so we substitute a friendly brand stand-in for display only.
 */
const WORKSPACE_PLACEHOLDER = /\$\[workspaceName\]/g;
// Shown on public template previews where there's no real workspace yet — the
// brackets signal it's a placeholder ("your brand name goes here"), not copy.
const WORKSPACE_FALLBACK = "[brand]";

export interface PublicTemplate {
  /** Stable id, used verbatim as the URL slug. */
  slug: string;
  /** Farsi (or requested-locale) display name. */
  name: string;
  /** Farsi (or requested-locale) description. */
  description: string;
  category: TemplateCategory;
  /** The full underlying template, incl. `preset` for live preview. */
  template: TTemplate;
}

export function localize(map: Record<string, string>, locale: string): string {
  return map[locale] ?? map[DEFAULT_LOCALE] ?? Object.values(map)[0] ?? "";
}

export function getCategoryBySlug(slug: string): TemplateCategory | undefined {
  return CATEGORY_BY_SLUG.get(slug);
}

/**
 * The publishable corpus, localized. A template is public iff it has a mapped
 * role AND a clean slug-safe id.
 */
export async function getPublicTemplates(locale: TUserLocale = DEFAULT_LOCALE): Promise<PublicTemplate[]> {
  const t = await getTranslate(locale);
  const result: PublicTemplate[] = [];

  for (const template of templates(t)) {
    if (!template.role) continue;
    const category = CATEGORY_BY_ROLE.get(template.role);
    if (!category) continue;
    if (!VALID_SLUG.test(template.id)) continue;

    result.push({
      slug: template.id,
      // Render a friendly brand stand-in for the `$[workspaceName]` placeholder
      // on public pages; the underlying template keeps it for real instantiation.
      name: template.name.replace(WORKSPACE_PLACEHOLDER, WORKSPACE_FALLBACK),
      description: template.description.replace(WORKSPACE_PLACEHOLDER, WORKSPACE_FALLBACK),
      category,
      template,
    });
  }

  return result;
}

export async function getTemplatesByCategory(
  categorySlug: string,
  locale: TUserLocale = DEFAULT_LOCALE
): Promise<PublicTemplate[]> {
  const all = await getPublicTemplates(locale);
  return all.filter((p) => p.category.slug === categorySlug);
}

export async function getTemplateBySlug(
  categorySlug: string,
  slug: string,
  locale: TUserLocale = DEFAULT_LOCALE
): Promise<PublicTemplate | undefined> {
  const all = await getPublicTemplates(locale);
  return all.find((p) => p.category.slug === categorySlug && p.slug === slug);
}

/** All { category, slug } pairs for generateStaticParams. */
export async function getAllTemplateParams(): Promise<{ category: string; slug: string }[]> {
  const all = await getPublicTemplates(DEFAULT_LOCALE);
  return all.map((p) => ({ category: p.category.slug, slug: p.slug }));
}

/** Absolute canonical URL for a marketing path (always leading slash). */
export function marketingUrl(path: string): string {
  const base = WEBAPP_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function templatePath(categorySlug: string, slug: string): string {
  return `/templates/${categorySlug}/${slug}`;
}

export function categoryPath(categorySlug: string): string {
  return `/templates/${categorySlug}`;
}
