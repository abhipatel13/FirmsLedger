// Per-account content: must never be prerendered or shared between viewers.
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, Clock, XCircle, Star, MessageSquare, ExternalLink } from 'lucide-react';
import { getUserFromCookie } from '@/lib/user-auth';
import {
  fetchClaimsForUser,
  fetchCategories,
  fetchCategoryIdsForCompany,
} from '@/db/neonApi';
import CompanyEditor from '@/components/dashboard/CompanyEditor';

export default async function DashboardPage() {
  const user = await getUserFromCookie();
  if (!user) redirect(`/auth?mode=signin&next=${encodeURIComponent('/dashboard')}`);

  const rows = await fetchClaimsForUser(user.id);
  const owned = rows.filter((r) => r.claim_status === 'approved');
  const other = rows.filter((r) => r.claim_status !== 'approved');

  // Only loaded when there is something editable.
  const categories = owned.length ? await fetchCategories() : [];
  const selectedByCompany = Object.fromEntries(
    await Promise.all(owned.map(async (c) => [c.id, await fetchCategoryIdsForCompany(c.id)]))
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="text-white" style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold">Your listings</h1>
            <p className="text-slate-300 text-sm mt-2">
              Signed in as {user.full_name || user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {rows.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h2 className="font-extrabold text-[#1A2E4A] text-lg mb-2">No listings yet</h2>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Claim your company&apos;s listing to keep its details accurate and control how buyers
                see you.
              </p>
              <Link
                href="/claim-listing"
                className="inline-flex items-center gap-2 px-6 h-11 rounded-lg bg-[#1A2E4A] hover:bg-[#152741] text-white text-sm font-semibold transition-colors"
              >
                Claim a listing
              </Link>
            </div>
          )}

          {other.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                Awaiting review
              </h2>
              {other.map((c) => (
                <div key={c.claim_id} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-[#1A2E4A]">{c.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[c.hq_city, c.hq_state_label].filter(Boolean).join(', ') || 'Location not listed'}
                      </p>
                    </div>
                    {c.claim_status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Under review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Not approved
                      </span>
                    )}
                  </div>
                  {c.claim_status === 'pending' && (
                    <p className="text-xs text-slate-500 mt-3">
                      Every claim is checked by a person. We&apos;ll email you once it&apos;s reviewed.
                    </p>
                  )}
                  {c.claim_status === 'rejected' && c.review_note && (
                    <p className="text-xs text-slate-600 mt-3">Reason: {c.review_note}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {owned.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                Listings you manage
              </h2>
              {owned.map((c) => (
                <div key={c.claim_id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-extrabold text-[#1A2E4A] text-lg">{c.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[c.hq_city, c.hq_state_label].filter(Boolean).join(', ') || 'Location not listed'}
                      </p>
                    </div>
                    <div className="flex items-center gap-5">
                      <Stat icon={Star} label="Rating" value={Number(c.avg_rating) ? Number(c.avg_rating).toFixed(2) : '—'} />
                      <Stat icon={MessageSquare} label="Reviews" value={c.review_count ?? 0} />
                      <Stat icon={Building2} label="Enquiries" value={c.lead_count ?? 0} />
                      <a
                        href={`/company/${c.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-slate-500 hover:text-[#1A2E4A] inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <CompanyEditor
                    company={c}
                    categories={categories}
                    selectedCategoryIds={selectedByCompany[c.id] || []}
                  />
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="text-center">
      <p className="text-[11px] text-slate-400 uppercase tracking-wide flex items-center gap-1 justify-center">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className="font-mono font-bold text-[#1A2E4A] text-sm mt-0.5">{value}</p>
    </div>
  );
}
