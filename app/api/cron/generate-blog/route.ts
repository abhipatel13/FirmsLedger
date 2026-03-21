/**
 * GET /api/cron/generate-blog
 *
 * Module 1 — Daily AI Blog Generation
 * Runs at 07:00 UTC daily (configured in vercel.json).
 *
 * Picks 1–3 pending topics from blog_topics, calls GPT-4o for each,
 * saves markdown posts to the `blogs` table, and returns a JSON summary.
 *
 * Security: requires Authorization: Bearer {CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPendingTopics, markTopicProcessing } from '@/lib/automation/topicsManager';
import { generateBlogPost, type GeneratedBlog } from '@/lib/automation/blogGenerator';

/** Number of blog posts to generate per daily cron run */
const POSTS_PER_RUN = 1; // Increase to 3 for higher velocity

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const generated: GeneratedBlog[] = [];
  const failed: { topic: string; error: string }[] = [];

  try {
    // ── Pick pending topics ───────────────────────────────────────────────
    const topics = await getPendingTopics(POSTS_PER_RUN);

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending topics in queue',
        generated: 0,
      });
    }

    // ── Generate each post ───────────────────────────────────────────────
    for (const topic of topics) {
      try {
        await markTopicProcessing(topic.id);
        const blog = await generateBlogPost(topic.prompt, topic.id);
        generated.push(blog);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        failed.push({ topic: topic.prompt, error: msg });
        console.error(`[generate-blog] Failed for topic "${topic.prompt}":`, msg);
      }
    }

    return NextResponse.json({
      success: true,
      generated: generated.length,
      failed: failed.length,
      posts: generated,
      errors: failed.length > 0 ? failed : undefined,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[generate-blog] Cron fatal error:', msg);
    return NextResponse.json(
      { success: false, error: msg, generated: generated.length, failed: failed.length },
      { status: 500 }
    );
  }
}
