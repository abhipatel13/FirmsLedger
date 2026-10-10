import Link from 'next/link';
import { TARGET_PAGES } from '@/lib/seoOverrides';

export default function PopularSearches() {
  return (
    <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[var(--max-width)]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Popular searches</h2>
        <ul className="flex flex-wrap gap-2">
          {TARGET_PAGES.map((t) => (
            <li key={t.path}>
              <Link href={t.path} className="inline-block rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-700 hover:border-slate-400 hover:text-slate-900">
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
