import Link from 'next/link';

function Box({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

const linkRow = 'flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900';
const count = (n) => <span className="text-xs tabular-nums text-slate-400">{n}</span>;

export default function ListingSidebar({ specialties = [], cities = [], nearby = [], industries = [], stateName, stateSlug, parent, categoryLabel }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      {parent && (
        <Link href={parent.href} className="block rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-[#1A2E4A] hover:underline">
          ← {parent.label}
        </Link>
      )}
      {specialties.length > 0 && (
        <Box title="Specialty">
          <ul>
            {specialties.map((s) => (
              <li key={s.href}>
                {s.current ? (
                  <span className={`${linkRow} bg-slate-100 font-medium text-slate-900`}>{s.label} {count(s.count)}</span>
                ) : (
                  <Link href={s.href} className={linkRow}>{s.label} {count(s.count)}</Link>
                )}
              </li>
            ))}
          </ul>
        </Box>
      )}
      {cities.length > 0 && (
        <Box title={`Cities in ${stateName}`}>
          <ul>
            {cities.map((c) => (
              <li key={c.name} className="flex items-center justify-between px-2 py-1 text-sm text-slate-700">{c.name} {count(c.count)}</li>
            ))}
          </ul>
        </Box>
      )}
      {nearby.length > 0 && (
        <Box title={`${categoryLabel} in nearby states`}>
          <ul>
            {nearby.map((n) => (
              <li key={n.href}><Link href={n.href} className={linkRow}>{n.label}</Link></li>
            ))}
          </ul>
        </Box>
      )}
      {industries.length > 0 && (
        <Box title={`Other industries in ${stateName}`}>
          <ul>
            {industries.map((i) => (
              <li key={i.href}><Link href={i.href} className={linkRow}>{i.label}</Link></li>
            ))}
            <li><Link href={`/states/${stateSlug}`} className={`${linkRow} font-medium text-[#1A2E4A]`}>All {stateName} manufacturers</Link></li>
          </ul>
        </Box>
      )}
      <section className="rounded-lg border border-[#F5A623]/40 bg-[#F5A623]/10 p-4">
        <h2 className="text-sm font-semibold text-[#1A2E4A]">Run a manufacturing company?</h2>
        <p className="mt-1 text-sm text-slate-600">Listing is free. Claim or add your company so buyers can reach you.</p>
        <Link href="/list-your-company" className="mt-3 inline-block text-sm font-semibold text-[#1A2E4A] underline underline-offset-2">List your company</Link>
      </section>
    </aside>
  );
}
