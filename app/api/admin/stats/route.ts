/**
 * GET /api/admin/stats
 * Returns aggregated stats for the admin overview dashboard.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = req.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;
  if (!isValidCron) {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const admin = await getAdminFromCookie();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = db();

  const [
    topicsData,
    blogPostsCount,
    blogsCount,
    agenciesData,
    seoLatest,
    submissionsCount,
    recentBlogs,
    recentTopics,
  ] = await Promise.all([
    // Topic queue breakdown
    safe(async () => {
      const { data } = await supabase.from('blog_topics').select('status');
      const counts = { pending: 0, processing: 0, done: 0, failed: 0, total: 0 };
      (data ?? []).forEach((r: { status: string }) => {
        counts.total++;
        if (r.status in counts) (counts as Record<string, number>)[r.status]++;
      });
      return counts;
    }, { pending: 0, processing: 0, done: 0, failed: 0, total: 0 }),

    // Published blog_posts (JSON)
    safe(async () => {
      const { count } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true);
      return count ?? 0;
    }, 0),

    // Published blogs (markdown)
    safe(async () => {
      const { count } = await supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'published');
      return count ?? 0;
    }, 0),

    // Agencies
    safe(async () => {
      const { data } = await supabase.from('agencies').select('approved');
      const total = data?.length ?? 0;
      const pending = (data ?? []).filter((a: { approved: boolean }) => !a.approved).length;
      return { total, pending };
    }, { total: 0, pending: 0 }),

    // Latest SEO audit avg score
    safe(async () => {
      const { data } = await supabase
        .from('seo_audits')
        .select('score, audited_at')
        .order('audited_at', { ascending: false })
        .limit(20);
      if (!data || data.length === 0) return { avgScore: null, lastRun: null };
      const lastRun = data[0].audited_at;
      const scores = data.map((r: { score: number }) => r.score);
      const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
      return { avgScore, lastRun };
    }, { avgScore: null, lastRun: null }),

    // URL submissions in last 7 days
    safe(async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('submission_logs')
        .select('*', { count: 'exact', head: true })
        .gte('submitted_at', since);
      return count ?? 0;
    }, 0),

    // 5 most recent published posts (any source)
    safe(async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('slug, title, category, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    }, []),

    // 5 most recent topics with status
    safe(async () => {
      const { data } = await supabase
        .from('blog_topics')
        .select('id, prompt, status, slug, created_at, processed_at')
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    }, []),
  ]);

  return NextResponse.json({
    topics: topicsData,
    blogPosts: blogPostsCount,
    blogs: blogsCount,
    totalPublished: (blogPostsCount as number) + (blogsCount as number),
    agencies: agenciesData,
    seoAudit: seoLatest,
    submissions: { last7days: submissionsCount },
    recentBlogs,
    recentTopics,
  });
}
