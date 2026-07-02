import Link from "next/link";

interface TemplateCardProps {
  href: string;
  name: string;
  description: string;
}

// Two-color "northern lights" pairs; each card gets a stable pair derived from
// its href so a given template always glows the same. Drives the CSS aurora
// hover effect (.fr-aurora in globals.css) via --au1/--au2.
const AURORA: readonly [string, string][] = [
  ["#7c3aed", "#ec4899"],
  ["#0ea5e9", "#6366f1"],
  ["#f97316", "#ec4899"],
  ["#10b981", "#06b6d4"],
  ["#8b5cf6", "#f43f5e"],
  ["#06b6d4", "#3b82f6"],
  ["#22c55e", "#14b8a6"],
  ["#f59e0b", "#ef4444"],
  ["#3b82f6", "#8b5cf6"],
  ["#14b8a6", "#0ea5e9"],
  ["#ec4899", "#f59e0b"],
  ["#6366f1", "#a855f7"],
  ["#f43f5e", "#fb923c"],
  ["#0d9488", "#22c55e"],
  ["#d946ef", "#6366f1"],
  ["#ef4444", "#f59e0b"],
];

/**
 * Template grid card. Server-rendered (NOT a client component) so the card is in
 * the static HTML — essential for the templates pSEO pages to be crawlable. The
 * hover treatment is a pure-CSS aurora: two soft color blobs fade in and drift
 * on hover, plus a slight lift. No JS.
 */
export function TemplateCard({ href, name, description }: TemplateCardProps) {
  let hash = 0;
  for (let i = 0; i < href.length; i++) hash = (hash * 31 + href.charCodeAt(i)) | 0;
  const [au1, au2] = AURORA[Math.abs(hash) % AURORA.length];

  return (
    <Link
      href={href}
      style={{ "--au1": au1, "--au2": au2 } as React.CSSProperties}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <span aria-hidden className="fr-aurora" />
      <div className="relative z-10">
        <h3 className="font-medium text-slate-900 dark:text-white">{name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}
