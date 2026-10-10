import Link from 'next/link';
import { companyCity, companySpecialties, formatPhone } from '@/lib/listingFacts';

const siteUrl = (website) => {
  try {
    const url = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);
    return { href: url.href, host: url.hostname.replace(/^www\./, '') };
  } catch {
    return null;
  }
};

export default function ComparisonTable({ companies, caption }) {
  if (!companies || companies.length < 2) return null;
  return (
    <div id="compare" className="mb-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[680px] text-left text-sm">
        <caption className="px-4 pt-4 pb-1 text-left text-sm font-semibold text-slate-900">{caption}</caption>
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {['Company', 'City', 'Specialty', 'Phone', 'Website'].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {companies.map((c) => {
            const site = c.website ? siteUrl(c.website) : null;
            return (
              <tr key={c.slug}>
                <th scope="row" className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/company/${c.slug}`} className="hover:underline">{c.name}</Link>
                </th>
                <td className="px-4 py-3 text-slate-600">{companyCity(c) || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{companySpecialties(c, 1)[0] || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatPhone(c.phone) ? <a href={`tel:${c.phone}`} className="hover:underline">{formatPhone(c.phone)}</a> : '—'}
                </td>
                <td className="px-4 py-3">
                  {site ? (
                    <a href={site.href} target="_blank" rel="nofollow noopener noreferrer" className="text-[#1A2E4A] hover:underline">{site.host}</a>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
