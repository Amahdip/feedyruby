import type { MetadataRoute } from "next";
import { WEBAPP_URL } from "@/lib/constants";

/**
 * Net-new robots policy. Allow indexing of the public marketing surface,
 * disallow the authenticated app + API. Per-page `robots.index: false` still
 * governs anything finer-grained (e.g. individual rendered surveys).
 */
export default function robots(): MetadataRoute.Robots {
  const base = WEBAPP_URL.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/setup/", "/c/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
