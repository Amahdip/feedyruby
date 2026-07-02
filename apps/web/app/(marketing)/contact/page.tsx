import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { marketingUrl } from "@/app/lib/marketing/template-catalog";
import { APP_NAME } from "@/lib/brand-color";

export const revalidate = 86400;

export function generateMetadata(): Metadata {
  const title = "تماس با ما";
  const description = `راه‌های ارتباط با تیم ${APP_NAME} — تلفن، آدرس و ایمیل.`;
  const url = marketingUrl("/contact");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    robots: { index: true, follow: true },
  };
}

const PHONES = [
  { display: "۰۲۱ ۲۲۸۴۰۵۸۸", tel: "+982122840588" },
  { display: "۰۲۱ ۲۲۸۸۳۸۲۳", tel: "+982122883823" },
  { display: "۰۹۱۲۰۹۱۲۳۴۲", tel: "+989120912342" },
  { display: "۰۹۹۶۱۹۰۲۸۲۶", tel: "+989961902826" },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16" dir="rtl">
      <h1 className="text-3xl font-bold !leading-[1.5] tracking-tight md:text-4xl">تماس با ما</h1>
      <p className="mt-4 text-base leading-8 text-slate-600 dark:text-gray-300">
        برای پرسش، پشتیبانی یا همکاری با تیم {APP_NAME} از راه‌های زیر با ما در ارتباط باشید.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2 text-fr-fuchsia">
            <Phone className="size-5" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">تلفن</h2>
          </div>
          <ul className="space-y-1.5">
            {PHONES.map((p) => (
              <li key={p.tel}>
                <a
                  href={`tel:${p.tel}`}
                  dir="ltr"
                  className="inline-block text-[15px] text-slate-600 transition-colors hover:text-fr-fuchsia dark:text-gray-300">
                  {p.display}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2 text-fr-fuchsia">
            <Mail className="size-5" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">ایمیل</h2>
          </div>
          <a
            href="mailto:info@feedyruby.ir"
            dir="ltr"
            className="inline-block text-[15px] text-slate-600 transition-colors hover:text-fr-fuchsia dark:text-gray-300">
            info@feedyruby.ir
          </a>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-fr-fuchsia">
            <MapPin className="size-5" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">آدرس</h2>
          </div>
          <p className="text-[15px] leading-8 text-slate-600 dark:text-gray-300">
            تهران، خیابان شریعتی، بالاتر از میرداماد، کوچه شوایی، پلاک ۴۴، واحد ۵
          </p>
        </section>
      </div>
    </main>
  );
}
