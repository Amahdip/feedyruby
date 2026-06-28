/**
 * Inline JSON-LD structured data. Server-rendered into the page so crawlers see
 * it without executing JS. Pass a plain object graph (schema.org).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
