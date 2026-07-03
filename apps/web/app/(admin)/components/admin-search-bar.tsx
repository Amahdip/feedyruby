"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/**
 * Realtime search: as the user types (debounced), the `?q=` param is updated and
 * the server component re-queries. Clearing the field removes `q` entirely, so the
 * table falls back to showing all rows. The input is controlled, so the server
 * round-trip never clobbers what the user is typing.
 */
export function AdminSearchBar({
  action,
  placeholder,
  defaultValue,
}: {
  action: string;
  placeholder: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? "");
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = (raw: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const trimmed = raw.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q"); // empty query → show everything again
    params.delete("page"); // any new search returns to the first page
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${action}?${qs}` : action, { scroll: false });
    });
  };

  const onChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(next), 250);
  };

  // Flush any pending debounce on unmount.
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <div className="relative w-full max-w-sm">
      <Search
        className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-slate-400"
        aria-hidden
      />
      <input
        name="q"
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-slate-300 bg-white pe-3 ps-9 text-sm outline-none focus:border-slate-400"
      />
    </div>
  );
}
