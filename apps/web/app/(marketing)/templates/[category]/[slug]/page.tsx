import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/(marketing)/components/json-ld";
import {
  categoryPath,
  getAllTemplateParams,
  getTemplateBySlug,
  getTemplatesByCategory,
  localize,
  marketingUrl,
  templatePath,
} from "@/app/lib/marketing/template-catalog";
import { APP_NAME } from "@/lib/brand-color";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { TemplatePreview } from "./template-preview";

export const revalidate = 86400;
export const dynamicParams = false;

const LOCALE = DEFAULT_LOCALE;

interface TemplatePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllTemplateParams();
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const tpl = await getTemplateBySlug(category, slug, LOCALE);
  if (!tpl) return {};

  const title = `${tpl.name} | قالب آماده`;
  const url = marketingUrl(templatePath(category, slug));

  return {
    title,
    description: tpl.description,
    alternates: { canonical: url },
    openGraph: { title, description: tpl.description, url, type: "website" },
    robots: { index: true, follow: true },
  };
}

export default async function TemplateDetailPage({ params }: TemplatePageProps) {
  const { category, slug } = await params;
  const tpl = await getTemplateBySlug(category, slug, LOCALE);
  if (!tpl) notFound();

  const cat = tpl.category;
  const label = localize(cat.label, LOCALE);
  const url = marketingUrl(templatePath(category, slug));

  const siblings = (await getTemplatesByCategory(category, LOCALE))
    .filter((p) => p.slug !== slug)
    .slice(0, 6);

  const blockCount = tpl.template.preset.blocks.length;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "قالب‌ها", item: marketingUrl("/templates") },
        { "@type": "ListItem", position: 2, name: label, item: marketingUrl(categoryPath(category)) },
        { "@type": "ListItem", position: 3, name: tpl.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: tpl.name,
      description: tpl.description,
      url,
      isPartOf: { "@type": "WebSite", name: APP_NAME, url: marketingUrl("/") },
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <JsonLd data={jsonLd} />

      <nav aria-label="مسیر" className="mb-6 text-sm text-gray-500">
        <Link href="/templates" className="hover:underline">
          قالب‌ها
        </Link>
        <span className="mx-2">/</span>
        <Link href={categoryPath(category)} className="hover:underline">
          {label}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{tpl.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {label}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{tpl.name}</h1>
          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">{tpl.description}</p>

          <p className="mt-4 text-sm text-gray-500">
            شامل {blockCount} بخش · آماده‌ی استفاده · کاملاً قابل ویرایش و راست‌چین
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/auth/signup?template=${slug}`}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
              استفاده از این قالب
            </Link>
            <Link
              href={categoryPath(category)}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              قالب‌های مشابه
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3">
          <TemplatePreview preset={tpl.template.preset} />
        </div>
      </div>

      {siblings.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-semibold">قالب‌های مرتبط</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((p) => (
              <Link
                key={p.slug}
                href={templatePath(p.category.slug, p.slug)}
                className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h3 className="font-medium group-hover:underline">{p.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
