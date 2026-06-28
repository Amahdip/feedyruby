import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/(marketing)/components/json-ld";
import {
  TEMPLATE_CATEGORIES,
  categoryPath,
  getPublicTemplates,
  localize,
  marketingUrl,
  templatePath,
} from "@/app/lib/marketing/template-catalog";
import { APP_NAME } from "@/lib/brand-color";
import { DEFAULT_LOCALE } from "@/lib/constants";

export const revalidate = 86400;

const LOCALE = DEFAULT_LOCALE;

export async function generateMetadata(): Promise<Metadata> {
  const title = "قالب‌های آماده فرم و نظرسنجی آنلاین";
  const description =
    "کتابخانه قالب‌های آماده فرم، پرسش‌نامه و نظرسنجی فارسی فیدی‌روبی؛ از نظرسنجی رضایت مشتری و NPS تا فرم‌های منابع انسانی، بازاریابی و فروش. رایگان شروع کنید.";
  const url = marketingUrl("/templates");

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    robots: { index: true, follow: true },
  };
}

export default async function TemplatesHubPage() {
  const all = await getPublicTemplates(LOCALE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "قالب‌های آماده فرم و نظرسنجی آنلاین",
    url: marketingUrl("/templates"),
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: marketingUrl("/") },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <JsonLd data={jsonLd} />

      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">قالب‌های آماده فرم و نظرسنجی</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300">
          از میان {all.length} قالب آماده و فارسی، قالب مناسب کسب‌وکارتان را انتخاب کنید؛ با یک کلیک آن را به
          فرم زنده تبدیل کنید.
        </p>
      </header>

      <div className="space-y-14">
        {TEMPLATE_CATEGORIES.map((category) => {
          const items = all.filter((p) => p.category.slug === category.slug);
          if (items.length === 0) return null;

          return (
            <section key={category.slug} aria-labelledby={`cat-${category.slug}`}>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 id={`cat-${category.slug}`} className="text-xl font-semibold md:text-2xl">
                  <Link href={categoryPath(category.slug)} className="hover:underline">
                    {localize(category.label, LOCALE)}
                  </Link>
                </h2>
                <Link
                  href={categoryPath(category.slug)}
                  className="shrink-0 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
                  مشاهده همه ({items.length})
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <Link
                    key={p.slug}
                    href={templatePath(p.category.slug, p.slug)}
                    className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="font-medium group-hover:underline">{p.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {p.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
