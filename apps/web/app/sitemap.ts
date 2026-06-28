import type { MetadataRoute } from "next";
import {
  TEMPLATE_CATEGORIES,
  categoryPath,
  getPublicTemplates,
  marketingUrl,
  templatePath,
} from "@/app/lib/marketing/template-catalog";

/**
 * Net-new sitemap. Enumerates the full public surface: home, the templates hub,
 * every category, every publishable template, and the Porsline comparison page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const publicTemplates = await getPublicTemplates();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: marketingUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: marketingUrl("/templates"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    {
      url: marketingUrl("/alternatives/porsline"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap = TEMPLATE_CATEGORIES.map((c) => ({
    url: marketingUrl(categoryPath(c.slug)),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const templateEntries: MetadataRoute.Sitemap = publicTemplates.map((p) => ({
    url: marketingUrl(templatePath(p.category.slug, p.slug)),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...templateEntries];
}
