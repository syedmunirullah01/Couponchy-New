"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminTopbar from "@/features/admin/components/AdminTopbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ─── Status badge color ───────────────────────────────────────────────────────
function statusVariant(status) {
  if (status === "completed") return "success";
  if (status === "running")   return "warning";
  if (status === "failed")    return "destructive";
  return "secondary";
}

function actionVariant(action) {
  if (action === "inserted")          return "success";
  if (action === "duplicate_skipped") return "secondary";
  if (action === "validated_ok")      return "success";
  if (action === "validated_fail")    return "destructive";
  if (action === "expired")           return "warning";
  return "secondary";
}



// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminScraperPage() {
  const [jobs, setJobs]           = useState([]);
  const [logs, setLogs]           = useState([]);
  const [targets, setTargets]     = useState([]);
  const [triggering, setTriggering] = useState(null); // "discover" | "validate" | null
  const [triggerMsg, setTriggerMsg] = useState("");
  const [loading, setLoading]     = useState(true);
  const [analytics, setAnalytics] = useState({
    successRate: 0,
    totalValidActive: 0,
    totalUncheckedActive: 0,
    totalExpiredScraper: 0,
    flaggedCoupons: []
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/scraper/status");
      const json = await res.json();
      if (res.ok) {
        setJobs(json.jobs || []);
        setLogs(json.recentLogs || []);
        if (json.analytics) {
          setAnalytics(json.analytics);
        }
      }
    } catch { /* silent */ }
  }, []);

  const fetchTargets = useCallback(async () => {
    try {
      const res = await fetch("/api/scraper/targets");
      const json = await res.json();
      if (res.ok) setTargets(json.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    Promise.all([fetchStatus(), fetchTargets()]).finally(() => setLoading(false));
    // Poll for status updates every 10s
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchTargets]);

  async function handleTrigger(jobType) {
    setTriggering(jobType);
    setTriggerMsg("");
    try {
      const body = { jobType };
      if (jobType === "validate") {
        body.forceAll = true;
      }
      const res = await fetch("/api/scraper/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setTriggerMsg(`✓ ${jobType === "discover" ? "Discovery" : "Validation"} job started successfully.`);
        setTimeout(fetchStatus, 2000);
      } else {
        setTriggerMsg(`✗ ${json.error}`);
      }
    } catch (err) {
      setTriggerMsg(`✗ ${err.message}`);
    } finally {
      setTriggering(null);
    }
  }

  const latestJob = jobs[0] || null;

  return (
    <div>
      <AdminTopbar title="AI Scraper" breadcrumbTrail={["Admin", "AI Scraper"]} />
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">

        {/* ── Scraper Analytics Dashboard ────────────────────────────── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary-soft)] bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-[var(--muted)]">Success Rate</CardTitle>
                <CardDescription className="text-xs text-[var(--muted)]/70">From validation history</CardDescription>
              </div>
              <div className={`rounded-xl p-2.5 ${analytics.successRate >= 75 ? 'bg-emerald-500/10 text-emerald-400' : analytics.successRate >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-[var(--text)]">{analytics.successRate}%</div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary-soft)] bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-[var(--muted)]">Verified Coupons</CardTitle>
                <CardDescription className="text-xs text-[var(--muted)]/70">Active & verified on checkout</CardDescription>
              </div>
              <div className="rounded-xl p-2.5 bg-emerald-500/10 text-emerald-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-[var(--text)]">{analytics.totalValidActive}</div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary-soft)] bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-[var(--muted)]">Verification Pending</CardTitle>
                <CardDescription className="text-xs text-[var(--muted)]/70">Awaiting validation check</CardDescription>
              </div>
              <div className="rounded-xl p-2.5 bg-amber-500/10 text-amber-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-[var(--text)]">{analytics.totalUncheckedActive}</div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary-soft)] bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-[var(--muted)]">Auto-Expired Total</CardTitle>
                <CardDescription className="text-xs text-[var(--muted)]/70">Removed by automation</CardDescription>
              </div>
              <div className="rounded-xl p-2.5 bg-rose-500/10 text-rose-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-[var(--text)]">{analytics.totalExpiredScraper}</div>
            </CardContent>
          </Card>
        </section>

        {/* ── Flagged Coupon / Store Validations Alert Box ─────────────── */}
        {analytics.flaggedCoupons && analytics.flaggedCoupons.length > 0 && (
          <Card className="border-red-500/30 bg-red-950/10 border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-red-400 text-lg">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Failing Store Validations Alert
              </CardTitle>
              <CardDescription className="text-red-200/70">
                The following active coupons have consecutively failed verification 3 or more times. 
                Validation frequency has been reduced to weekly for these targets to bypass bot protection / layout changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-red-500/10">
                {analytics.flaggedCoupons.map((coupon) => (
                  <div key={coupon.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{coupon.store_name}</span>
                        <Badge variant="destructive" className="px-2 py-0.5 text-[10px] uppercase font-bold shrink-0">
                          {coupon.unchecked_count} Failures
                        </Badge>
                      </div>
                      <p className="text-xs text-white/60 mt-1">{coupon.title}</p>
                      {coupon.code && (
                        <code className="inline-block mt-1 text-[10px] font-mono bg-black/40 text-red-300 px-1.5 py-0.5 rounded">
                          Code: {coupon.code}
                        </code>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/offers`}
                        className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Manage Coupons
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Trigger Controls ─────────────────────────────────────────── */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Discover</CardTitle>
              <CardDescription>
                Scrapes the merchant&apos;s official page plus 10 aggregator sources (RetailMeNot, CouponFollow, SimplyCodes, Coupons.com, Groupon, CouponCabin, Knoji, DontPayFull, Slickdeals, Dealspotr) using Playwright + Gemini AI. Offers are cross-deduplicated across sources and inserted as <strong>pending</strong> until validation confirms them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
                Runs automatically every 6 hours via node-cron on Railway.
              </div>
              <Button
                onClick={() => handleTrigger("discover")}
                disabled={triggering !== null}
                className="w-full justify-center"
              >
                {triggering === "discover" ? "Starting..." : "▶ Run Discovery Now"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auto-Validate + Expire</CardTitle>
              <CardDescription>
                Uses Playwright to visit stores, add items to cart, apply each coupon code, and mark results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
                Runs automatically every 24 hours. Invalid codes are marked <strong>Expired</strong> and hidden from public.
              </div>
              <Button
                variant="secondary"
                onClick={() => handleTrigger("validate")}
                disabled={triggering !== null}
                className="w-full justify-center"
              >
                {triggering === "validate" ? "Starting..." : "▶ Run Validation Now"}
              </Button>
            </CardContent>
          </Card>
        </section>

        {triggerMsg && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${triggerMsg.startsWith("✓") ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
            {triggerMsg}
          </div>
        )}

        {/* ── Last Job Status ───────────────────────────────────────────── */}
        {latestJob && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Last Job
                <Badge variant={statusVariant(latestJob.status)}>
                  {latestJob.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {latestJob.job_type === "discover" ? "Discovery" : "Validation"} ·{" "}
                {new Date(latestJob.started_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Stores processed", latestJob.stores_processed],
                  ["Offers found", latestJob.offers_found],
                  ["Offers inserted", latestJob.offers_inserted],
                  ["Offers validated", latestJob.offers_validated],
                  ["Offers expired", latestJob.offers_expired],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3">
                    <span className="text-sm text-[var(--muted)]">{label}</span>
                    <span className="text-sm font-semibold text-[var(--text)]">{value ?? 0}</span>
                  </div>
                ))}
              </div>
              {latestJob.error_message && (
                <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {latestJob.error_message}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Recent Job Logs ───────────────────────────────────────────── */}
        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Log Entries</CardTitle>
              <CardDescription>Latest 50 actions from the most recent job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] px-3 py-2 text-sm">
                    <Badge variant={actionVariant(log.action)} className="mt-0.5 shrink-0 text-xs">
                      {log.action || "—"}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--text)] truncate">{log.offer_title || log.store_slug}</p>
                      {log.offer_code && <p className="text-xs text-[var(--muted)]">Code: {log.offer_code}</p>}
                      {log.detail && <p className="text-xs text-[var(--muted)]">{log.detail}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-[var(--muted)]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Scraper Targets ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Scraper Targets — Multi-Source Discovery</CardTitle>
            <CardDescription>
              Each store is scraped across its official page plus up to 10 aggregator sources.
              Sources are discovery-only — validation remains the final publishing gate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-[var(--color-primary-soft)]/20 bg-[var(--surface-soft)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--text)]">Automatic Synchronization Active</p>
                <p className="text-xs text-[var(--muted)]">
                  Stores added to the database are automatically scraped across all discovery sources.
                  Each run scrapes the official merchant page + 10 competitor aggregators per store.
                </p>
              </div>
              <Link
                href="/admin/stores"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-black px-4 py-2 text-xs font-bold transition-all shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
              >
                Manage Stores
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-[var(--muted)]">Loading targets...</p>
            ) : targets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
                <p className="text-sm text-[var(--muted)]">No scraper targets found. Add stores first.</p>
              </div>
            ) : (() => {
              // Group targets by store_slug for display
              const byStore = targets.reduce((acc, t) => {
                if (!acc[t.store_slug]) acc[t.store_slug] = [];
                acc[t.store_slug].push(t);
                return acc;
              }, {});
              return (
                <div className="space-y-4">
                  {Object.entries(byStore).map(([storeSlug, storeTargets]) => {
                    const officialTarget = storeTargets.find(t => t.is_official);
                    const sourceTargets = storeTargets.filter(t => !t.is_official);
                    return (
                      <div key={storeSlug} className="rounded-2xl border border-[var(--border)] overflow-hidden">
                        {/* Store header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface-soft)] border-b border-[var(--border)]">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-400 shrink-0" />
                          <span className="font-semibold text-sm text-[var(--text)] flex-1">{officialTarget?.store_name || storeSlug}</span>
                          <span className="text-xs text-[var(--muted)] font-mono">{storeTargets.length} sources</span>
                        </div>
                        {/* Official entry */}
                        {officialTarget && (
                          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)]/50">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/12 text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0">✦ Official</span>
                            <p className="truncate text-xs text-[var(--muted)] flex-1">{officialTarget.target_url}</p>
                            <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">Priority 1</Badge>
                          </div>
                        )}
                        {/* Aggregator sources */}
                        <div className="divide-y divide-[var(--border)]/30">
                          {sourceTargets.map((source, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--surface-soft)]/40 transition-colors">
                              <span className="inline-flex items-center rounded-md bg-sky-500/10 text-sky-400 px-2 py-0.5 text-[10px] font-semibold shrink-0 min-w-[96px] justify-center">
                                {source.source_name}
                              </span>
                              <p className="truncate text-xs text-[var(--muted)] flex-1">{source.target_url}</p>
                              <span className="text-[10px] text-[var(--muted)] shrink-0">P{source.source_priority}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* ── Job History ───────────────────────────────────────────────── */}
        {jobs.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Job History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobs.slice(1).map((job) => (
                  <div key={job.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3">
                    <Badge variant={statusVariant(job.status)} className="text-xs">
                      {job.status}
                    </Badge>
                    <span className="text-sm capitalize text-[var(--text)]">{job.job_type}</span>
                    <span className="text-xs text-[var(--muted)]">{new Date(job.started_at).toLocaleString()}</span>
                    <span className="ml-auto text-xs text-[var(--muted)]">
                      +{job.offers_inserted} inserted · {job.offers_expired} expired
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
