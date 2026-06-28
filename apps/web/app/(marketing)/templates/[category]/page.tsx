import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/(marketing)/components/json-ld";
import {
  TEMPLATE_CATEGORIES,
  getCategoryBySlug,
  getTemplatesByCategory,
  localize,
  marketingUrl,
  templatePath,
} from "@/app/lib/marketing/template-catalog";
import { APP_NAME } from "@/lib/brand-color";
import { DEFAULT_LOCALE } from "@/lib/constants";

export const revalidate = 86400;
export const dynamicParams = false;

const LOCALE = DEFAULT_LOCALE;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return TEMPLATE_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};

  const label = localize(cat.label, LOCALE);
  const title = `قالب‌های ${label}`;
  const description = localize(cat.description, LOCALE);
  const url = marketingUrl(`/templates/${category}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const items = await getTemplatesByCategory(category, LOCALE);
  if (items.length === 0) notFound();

  const label = localize(cat.label, LOCALE);
  const url = marketingUrl(`/templates/${category}`);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "قالب‌ها", item: marketingUrl("/templates") },
        { "@type": "ListItem", position: 2, name: label, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `قالب‌های ${label}`,
      url,
      isPartOf: { "@type": "WebSite", name: APP_NAME, url: marketingUrl("/") },
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <JsonLd data={jsonLd} />

      <nav aria-label="مسیر" className="mb-6 text-sm text-gray-500">
        <Link href="/templates" className="hover:underline">
          قالب‌ها
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{label}</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">قالب‌های {label}</h1>
        <p className="mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300">
          {localize(cat.description, LOCALE)}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={templatePath(p.category.slug, p.slug)}
            className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-medium group-hover:underline">{p.name}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{p.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
