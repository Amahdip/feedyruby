import { ChevronDown, Code, HelpCircle, Server, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/(marketing)/components/json-ld";
import { marketingUrl } from "@/app/lib/marketing/template-catalog";
import { APP_NAME } from "@/lib/brand-color";

export const revalidate = 86400;

const URL = marketingUrl("/alternatives/porsline");

export function generateMetadata(): Metadata {
  const title = "جایگزین پرس‌لاین: مقایسه‌ی فیدی‌روبی و پرس‌لاین";
  const description =
    "مقایسه‌ی منصفانه‌ی فیدی‌روبی و پرس‌لاین برای ساخت فرم و نظرسنجی آنلاین فارسی؛ متن‌باز و شفاف، با میزبانی امن در داخل ایران و کنترل کامل داده‌ها. پروژه‌ای از مدرسه‌ی برنامه‌نویسی سلام‌روبی. در چند دقیقه مهاجرت کنید.";

  return {
    title,
    description,
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, type: "website" },
    robots: { index: true, follow: true },
  };
}

/**
 * Fair, sourced-by-design comparison. Each row states the dimension plainly and
 * includes ones where Porsline leads — an honest table converts better and
 * avoids trademark-baiting in a small local market.
 */
interface Row {
  feature: string;
  feedyruby: string;
  porsline: string;
  /** Visual winner cue: "us" | "them" | "tie". */
  edge: "us" | "them" | "tie";
}

const ROWS: Row[] = [
  {
    feature: "متن‌باز (Open Source)",
    feedyruby: "بله — کد کامل در دسترس",
    porsline: "خیر — سرویس بسته",
    edge: "us",
  },
  {
    feature: "میزبانی داده‌ها در داخل ایران",
    feedyruby: "بله — روی سرورهای ما در ایران",
    porsline: "بله — روی سرورهای پرس‌لاین",
    edge: "tie",
  },
  {
    feature: "کنترل و شفافیت کامل داده‌ها",
    feedyruby: "بله — شفاف، رمزنگاری‌شده و متن‌باز",
    porsline: "تابع سیاست‌های پرس‌لاین",
    edge: "us",
  },
  {
    feature: "رابط کاربری راست‌چین و فارسی",
    feedyruby: "بله — بومی و کامل",
    porsline: "بله — بومی و کامل",
    edge: "tie",
  },
  {
    feature: "API و وب‌هوک",
    feedyruby: "بله",
    porsline: "بله",
    edge: "tie",
  },
  {
    feature: "کتابخانه‌ی قالب آماده",
    feedyruby: "بله — ده‌ها قالب فارسی",
    porsline: "بله — کتابخانه‌ی گسترده",
    edge: "tie",
  },
  {
    feature: "بلوغ محصول و سابقه در بازار ایران",
    feedyruby: "نوپا و در حال رشد",
    porsline: "بالغ و جاافتاده",
    edge: "them",
  },
  {
    feature: "گستره‌ی یکپارچه‌سازی‌های آماده",
    feedyruby: "در حال گسترش",
    porsline: "گسترده",
    edge: "them",
  },
  {
    feature: "مدل قیمت‌گذاری",
    feedyruby: "نسخه‌ی متن‌باز رایگان + پلن ابری",
    porsline: "نسخه‌ی رایگان محدود + پلن‌های پولی",
    edge: "tie",
  },
];

const EDGE_DOT: Record<Row["edge"], string> = {
  us: "bg-brand",
  them: "bg-gray-400",
  tie: "bg-gray-300",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "آیا فیدی‌روبی رایگان است؟",
    a: "بله، شروع کار با فیدی‌روبی رایگان است و هسته‌ی آن متن‌باز و شفاف (تحت پروانه‌ی AGPLv3) است. پلتفرم به‌صورت مدیریت‌شده روی سرورهای ما در داخل ایران میزبانی می‌شود و نیازی به راه‌اندازی سرور ندارید.",
  },
  {
    q: "آیا اطلاعات پرس‌لاین قابل انتقال به فیدی‌روبی است؟",
    a: "بله، شما می‌توانید از پاسخ‌های ثبت‌شده در پرس‌لاین خروجی اکسل (CSV) بگیرید و داده‌های خود را انتقال دهید.",
  },
  {
    q: "آیا فیدی‌روبی از زبان فارسی و تاریخ شمسی پشتیبانی می‌کند؟",
    a: "بله، فیدی‌روبی کاملاً بومی‌سازی شده است و از تاریخ شمسی و نمایش کاملاً راست‌چین (RTL) در تمامی بخش‌ها پشتیبانی می‌کند.",
  },
];

export default function PorslineAlternativePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: marketingUrl("/") },
        { "@type": "ListItem", position: 2, name: "جایگزین پرس‌لاین", item: URL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <main className="relative mx-auto max-w-5xl px-4 py-12 text-slate-800 antialiased dark:text-slate-100 md:py-20">
      <JsonLd data={jsonLd} />

      {/* Background Decorative Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] dark:opacity-30" />

      {/* Hero Section */}
      <header className="mb-16 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-800 ring-1 ring-inset ring-rose-600/10 dark:bg-rose-950/30 dark:text-rose-400">
          <Sparkles className="size-4 animate-pulse" />
          مقایسه هوشمندانه فرم‌سازها
        </span>
        <h1 className="mt-6 bg-gradient-to-r from-rose-800 via-rose-900 to-amber-700 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-rose-400 dark:to-amber-500 md:text-5xl">
          جایگزین پرس‌لاین: {APP_NAME} یا پرس‌لاین؟
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">
          مقایسه‌ای منصفانه میان فیدی‌روبی و پرس‌لاین برای ساخت فرم و نظرسنجی آنلاین فارسی. هر دو راست‌چین و
          بومی‌اند؛ تفاوت اصلی فیدی‌روبی در متن‌باز و شفاف بودن، میزبانی امن و مدیریت‌شده در داخل ایران و
          کنترل کامل داده‌هاست. فیدی‌روبی پروژه‌ای از مدرسه‌ی برنامه‌نویسی سلام‌روبی است.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/signup?ref=alt-porsline"
            className="inline-block rounded-xl bg-brand px-8 py-4 text-base font-semibold text-white shadow-lg shadow-rose-900/15 transition-all hover:scale-[1.02] hover:opacity-90 hover:shadow-rose-900/25">
            رایگان شروع کنید — در چند دقیقه مهاجرت کنید
          </Link>
        </div>
      </header>

      {/* Core Advantages Grid */}
      <section className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-4 w-fit rounded-xl bg-rose-50 p-3 dark:bg-rose-950/30">
            <Code className="size-6 text-rose-800 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">۱۰۰٪ متن‌باز و آزاد</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            کدهای فیدی‌روبی کاملاً باز و عمومی در گیت‌هاب در دسترس هستند. هیچ قفل نرم‌افزاری یا پلن انحصاری
            پنهانی وجود ندارد.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-4 w-fit rounded-xl bg-rose-50 p-3 dark:bg-rose-950/30">
            <Server className="size-6 text-rose-800 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">میزبانی امن در داخل ایران</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            فیدی‌روبی را به‌صورت مدیریت‌شده روی سرورهای ما در داخل ایران اجرا می‌کنید؛ بدون دردسر راه‌اندازی
            سرور و بدون نگرانی از تحریم‌ها، داده‌ها داخل کشور می‌مانند.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-4 w-fit rounded-xl bg-rose-50 p-3 dark:bg-rose-950/30">
            <ShieldCheck className="size-6 text-rose-800 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">امنیت و مالکیت مطلق داده‌ها</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            بدون نگرانی از دسترسی شخص ثالث یا مسدود شدن اکانت، داده‌های حساس پاسخ‌دهندگان را کاملاً تحت کنترل
            و مدیریت خود نگه دارید.
          </p>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="mb-20">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
          مقایسه دقیق ویژگی‌ها
        </h2>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">ویژگی / قابلیت</th>
                  <th className="bg-rose-50/20 px-6 py-4 font-bold text-brand dark:bg-rose-950/10 dark:text-rose-400">
                    {APP_NAME}
                  </th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">پرس‌لاین</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    className="transition-colors hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.feature}</td>
                    <td className="bg-rose-50/10 px-6 py-4 dark:bg-rose-950/5">
                      <span className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${EDGE_DOT[row.edge]}`} />
                        <span
                          className={
                            row.edge === "us"
                              ? "font-semibold text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300"
                          }>
                          {row.feedyruby}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{row.porsline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          * این مقایسه با هدف کمک به انتخاب آگاهانه تهیه شده و شامل مواردی است که پرس‌لاین در آن‌ها برتری
          دارد. اطلاعات ممکن است با گذر زمان تغییر کند.
        </p>
      </section>

      {/* FAQ Section */}
      <section aria-labelledby="faq-heading" className="mx-auto mb-8 max-w-3xl">
        <h2 id="faq-heading" className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
          پرسش‌های متداول درباره مهاجرت به فیدی‌روبی
        </h2>
        <div className="space-y-4">
          {FAQ.map((f, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900 focus:outline-none dark:text-white">
                <span className="flex items-center gap-3 text-base font-semibold">
                  <HelpCircle className="size-5 shrink-0 text-brand dark:text-rose-400" />
                  {f.q}
                </span>
                <ChevronDown className="size-5 shrink-0 text-slate-500 transition-transform duration-300 group-open:-rotate-180" />
              </summary>
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800/80 dark:text-slate-300">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
