'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2, BadgeCheck, Star, FolderTree, Inbox,
  RefreshCw, ArrowRight, AlertCircle,
} from 'lucide-react';
import { PageHeader, Card, Button, Badge, Stat, Skeleton, Notice } from '@/components/admin/ui';

/**
 * Overview.
 *
 * Rewritten 2026-09-09. The previous version showed "Blogs Published",
 * "Recent Posts", "Recent Topics" and a topic-queue breakdown — all reading
 * `topics`, `recentBlogs` and `recentTopics` off /api/admin/stats, which has
 * never returned any of those fields. They rendered zeros and empty lists
 * permanently, and their links pointed at /admin/blogs, a route that does not
 * exist. Quick actions for SEO Audit, Email Campaigns and URL Submissions are
 * gone for the same reason: the first two still build a Supabase client from
 * unset env vars, and URL Submissions has no code path that ever seeds its
 * queue table.
 *
 * Everything below is backed by a real query.
 */
export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error(`Could not load stats (${res.status})`);
      setStats(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = stats;
  const pendingClaims = s?.claims?.pending ?? 0;
  const pendingCompanies = s?.companies?.pending ?? 0;
  const pendingReviews = s?.reviews?.pending ?? 0;

  return (
    <>
      <PageHeader title="Overview" subtitle="Directory health and anything waiting on a decision.">
        <Button icon={RefreshCw} onClick={load} disabled={loading}>Refresh</Button>
      </PageHeader>

      {error && <div className="mb-5"><Notice tone="red">{error}</Notice></div>}

      {loading ? (
        <Skeleton rows={2} />
      ) : (
        <div className="space-y-6">
          {/* Needs attention first — the only part of this page that is ever
              actionable, so it leads rather than sitting under vanity totals. */}
          {(pendingClaims > 0 || pendingCompanies > 0 || pendingReviews > 0) && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-[#F5A623]" aria-hidden />
                <h2 className="text-sm font-semibold text-[#E8EDF5]">Needs attention</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {pendingClaims > 0 && (
                  <QueueLink href="/admin/claims" count={pendingClaims} noun="listing claim" />
                )}
                {pendingCompanies > 0 && (
                  <QueueLink href="/admin/agencies" count={pendingCompanies} noun="unapproved company" />
                )}
                {pendingReviews > 0 && (
                  <QueueLink href="/admin/agencies" count={pendingReviews} noun="unapproved review" />
                )}
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={Building2}
              label="Companies"
              value={(s?.companies?.total ?? 0).toLocaleString()}
              hint={`${(s?.companies?.total ?? 0) - pendingCompanies} approved · ${pendingCompanies} pending`}
            />
            <Stat
              icon={BadgeCheck}
              label="Claimed listings"
              value={(s?.claims?.approved ?? 0).toLocaleString()}
              hint={pendingClaims ? `${pendingClaims} awaiting review` : 'none awaiting review'}
            />
            <Stat
              icon={Star}
              label="Reviews"
              value={(s?.reviews?.total ?? 0).toLocaleString()}
              hint={pendingReviews ? `${pendingReviews} pending` : 'all approved'}
            />
            <Stat
              icon={FolderTree}
              label="Categories"
              value={(s?.categories?.total ?? 0).toLocaleString()}
            />
          </div>

          <Card>
            <div className="px-5 py-4 border-b border-white/[0.08]">
              <h2 className="text-sm font-semibold text-[#E8EDF5]">Jump to</h2>
            </div>
            <div className="p-3 grid gap-2 sm:grid-cols-2">
              {[
                { label: 'Review listing claims', href: '/admin/claims', icon: BadgeCheck,
                  desc: 'Approve or reject ownership requests' },
                { label: 'Manage companies', href: '/admin/agencies', icon: Building2,
                  desc: 'Approve, edit and verify listings' },
                { label: 'Manage categories', href: '/admin/categories', icon: FolderTree,
                  desc: 'Category tree and slugs' },
              ].map(({ label, href, icon: Icon, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.06] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70"
                >
                  <Icon className="w-4 h-4 mt-0.5 text-[#64748B] group-hover:text-[#F5A623] transition-colors duration-150 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#E8EDF5]">{label}</span>
                    <span className="block text-xs text-[#64748B] mt-0.5">{desc}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 ml-auto shrink-0 text-[#334155] group-hover:text-[#94A3B8] transition-colors duration-150" aria-hidden />
                </Link>
              ))}
            </div>
          </Card>

          {pendingClaims === 0 && pendingCompanies === 0 && pendingReviews === 0 && (
            <Card className="p-5 flex items-center gap-3">
              <Inbox className="w-4 h-4 text-[#334155]" aria-hidden />
              <p className="text-sm text-[#94A3B8]">
                Nothing is waiting on a decision right now.
              </p>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function QueueLink({ href, count, noun }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/70"
    >
      <Badge tone="gold">
        {count} {noun}{count === 1 ? '' : 's'}
      </Badge>
    </Link>
  );
}
