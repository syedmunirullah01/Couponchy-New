import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/scraper/status
 * Returns last 10 scraper jobs + their logs.
 * Used by the admin scraper page to show status.
 */
export async function GET(request) {
  const access = await requirePermission("scraper");
  if (access.error) return access.error;

  // 1. Fetch recent jobs
  const { data: jobs, error } = await supabase
    .from("scraper_jobs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Fetch logs for the most recent job
  let recentLogs = [];
  if (jobs?.length > 0) {
    const { data: logs } = await supabase
      .from("scraper_logs")
      .select("*")
      .eq("job_id", jobs[0].id)
      .order("created_at", { ascending: false })
      .limit(50);
    recentLogs = logs || [];
  }

  // 3. Fetch Scraper Analytics Metrics
  try {
    const [
      validCountRes,
      invalidCountRes,
      uncheckedCountRes,
      validActiveRes,
      uncheckedActiveRes,
      expiredRes,
      flaggedRes
    ] = await Promise.all([
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("validation_status", "valid"),
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("validation_status", "invalid"),
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("validation_status", "unchecked"),
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("validation_status", "valid").eq("status", "Active"),
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("validation_status", "unchecked").eq("status", "Active"),
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("status", "Expired").eq("source", "Scraper"),
      supabase.from("offers").select("id, store_name, store_slug, title, code, unchecked_count").gte("unchecked_count", 3).eq("status", "Active")
    ]);

    const totalValid = validCountRes.count || 0;
    const totalInvalid = invalidCountRes.count || 0;
    const totalUnchecked = uncheckedCountRes.count || 0;
    const totalChecked = totalValid + totalInvalid + totalUnchecked;
    const successRate = totalChecked > 0 ? Math.round((totalValid / totalChecked) * 100) : 0;

    const analytics = {
      successRate,
      totalValidActive: validActiveRes.count || 0,
      totalUncheckedActive: uncheckedActiveRes.count || 0,
      totalExpiredScraper: expiredRes.count || 0,
      flaggedCoupons: flaggedRes.data || []
    };

    return NextResponse.json({ 
      jobs: jobs || [], 
      recentLogs,
      analytics
    });
  } catch (analyticsError) {
    console.error("Failed to compile scraper analytics:", analyticsError.message);
    return NextResponse.json({ 
      jobs: jobs || [], 
      recentLogs,
      analytics: {
        successRate: 0,
        totalValidActive: 0,
        totalUncheckedActive: 0,
        totalExpiredScraper: 0,
        flaggedCoupons: []
      }
    });
  }
}
