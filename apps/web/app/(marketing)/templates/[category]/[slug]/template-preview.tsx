import type { TTemplate } from "@feedyruby/types/templates";

/**
 * Lightweight, fully server-rendered template preview.
 *
 * No client runtime: we read the template `preset`, extract the welcome card +
 * the first couple of questions, and render them as static RTL HTML. This keeps
 * the detail page "thick" for SEO while staying SSG/ISR with instant TTFB —
 * the Core Web Vitals edge we want over Porsline.
 */

type I18n = Record<string, string> | string | undefined;

function pickI18n(value: I18n): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.default ?? value["fa-IR"] ?? value["en-US"] ?? Object.values(value).find((v) => v) ?? "";
}

function toPlainText(value: I18n): string {
  return pickI18n(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

interface PreviewElement {
  id: string;
  type: string;
  headline: string;
  subheader: string;
  choices: string[];
}

function extractElements(preset: TTemplate["preset"], limit: number): PreviewElement[] {
  const out: PreviewElement[] = [];
  for (const block of preset.blocks) {
    for (const element of block.elements) {
      const choices = (element as { choices?: { label: I18n }[] }).choices;
      out.push({
        id: element.id,
        type: element.type,
        headline: toPlainText(element.headline),
        subheader: toPlainText(element.subheader),
        choices: choices
          ? choices
              .map((c) => pickI18n(c.label))
              .filter(Boolean)
              .slice(0, 6)
          : [],
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function ElementControl({ element }: { element: PreviewElement }) {
  const t = element.type;

  if (t === "multipleChoiceSingle" || t === "multipleChoiceMulti" || t === "pictureSelection") {
    const rounded = t === "multipleChoiceMulti" ? "rounded-md" : "rounded-full";
    return (
      <ul className="mt-3 space-y-2">
        {element.choices.map((c, i) => (
          <li
            key={`${element.id}-${i}`}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
            <span className={`h-4 w-4 shrink-0 border border-gray-300 ${rounded} dark:border-gray-600`} />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (t === "nps") {
    return (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: 11 }, (_, i) => (
          <span
            key={i}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-xs text-gray-500 dark:border-gray-700">
            {i}
          </span>
        ))}
      </div>
    );
  }

  if (t === "rating") {
    return (
      <div className="mt-3 flex gap-1.5 text-lg text-gray-300">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
    );
  }

  if (t === "openText") {
    return (
      <div className="mt-3 h-20 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40" />
    );
  }

  if (t === "consent") {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
        <span className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600" />
        <span>موافقم</span>
      </div>
    );
  }

  if (t === "cta") {
    return (
      <div className="mt-3">
        <span className="inline-block rounded-lg bg-brand px-4 py-2 text-xs text-white">ادامه</span>
      </div>
    );
  }

  return null;
}

export function TemplatePreview({ preset }: { preset: TTemplate["preset"] }) {
  const welcome = preset.welcomeCard;
  const showWelcome = welcome?.enabled && (welcome.headline || welcome.subheader);
  const welcomeHeadline = toPlainText(welcome?.headline);
  const welcomeSubheader = toPlainText(welcome?.subheader);

  const elements = extractElements(preset, showWelcome ? 1 : 2);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
        <span className="mr-auto text-xs text-gray-400">پیش‌نمایش</span>
      </div>

      <div className="space-y-8 p-6">
        {showWelcome && (
          <div className="border-b border-dashed border-gray-100 pb-8 dark:border-gray-800">
            {welcomeHeadline && <h3 className="text-lg font-semibold">{welcomeHeadline}</h3>}
            {welcomeSubheader && (
              <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">{welcomeSubheader}</p>
            )}
            <span className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-xs text-white">شروع</span>
          </div>
        )}

        {elements.map((element) => (
          <div key={element.id}>
            {element.headline && <h4 className="font-medium">{element.headline}</h4>}
            {element.subheader && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{element.subheader}</p>
            )}
            <ElementControl element={element} />
          </div>
        ))}
      </div>
    </div>
  );
}
