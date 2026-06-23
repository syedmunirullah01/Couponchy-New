import { supabase } from '../config/supabase.js';
import { loadTargets } from '../targets/loader.js';
import { fetchPage } from './fetch-page.js';
import { parseHtml } from './parse-html.js';
import { aiExtractCoupons } from './ai-extract.js';
import { dedupOffers } from './dedup.js';
import { initBrowserPool, acquireBrowser, releaseBrowser, getPoolStatus } from './browser-pool.js';
import { runQueue } from './queue.js';
import { validateSource } from './source-validator.js';
import * as cheerio from 'cheerio';

/**
 * Configuration (env vars):
 *   DISCOVERY_CONCURRENCY — stores processed in parallel (default: 3)
 */
const DISCOVERY_CONCURRENCY = parseInt(process.env.DISCOVERY_CONCURRENCY || '3', 10);

// ── In-memory dedup (same as before) ─────────────────────────────────────────

function deduplicateInMemory(newOffers, seenCodes, seenTitles) {
  const unique = [];
  for (const offer of newOffers) {
    const code  = offer.code  ? offer.code.trim().toUpperCase()  : null;
    const title = offer.title ? offer.title.trim().toLowerCase() : '';

    if (code) {
      if (seenCodes.has(code)) {
        console.log(`[Discovery] In-memory dedup: skipping duplicate code "${offer.code}".`);
        continue;
      }
      seenCodes.add(code);
    } else {
      if (seenTitles.has(title)) {
        console.log(`[Discovery] In-memory dedup: skipping duplicate deal "${offer.title}".`);
        continue;
      }
      seenTitles.add(title);
    }
    unique.push(offer);
  }
  return { unique, updatedCodes: seenCodes, updatedTitles: seenTitles };
}

// ── Source scraping (one source URL) ─────────────────────────────────────────

/**
 * Scrapes one source URL for a store, using a shared browser from the pool.
 *
 * @param {object} target
 * @param {string} jobId
 * @param {import('playwright').Browser} browser - Shared browser instance
 * @returns {Promise<Array>}
 */
async function scrapeSourceUrl(target, jobId, browser) {
  const tag = `[Source: ${target.source_name}]`;
  console.log(`    ${tag} Fetching ${target.target_url}`);
  const sourceStart = Date.now();

  // ── Step 1: Fetch ─────────────────────────────────────────────────────────
  let html, httpStatus;
  try {
    ({ html, httpStatus } = await fetchPage(target.target_url, {
      browser,
      timeout: 25000,
      waitUntil: 'domcontentloaded',
      delay: target.is_official ? 1500 : 0,
    }));
  } catch (fetchError) {
    console.warn(`    ${tag} Fetch failed: ${fetchError.message}`);
    await supabase.from('scraper_logs').insert({
      job_id: jobId, store_slug: target.store_slug, action: 'skipped',
      detail: `${tag} Fetch error: ${fetchError.message}`,
    }).catch(() => {});
    return [];
  }

  // ── Step 2: Extract visible body text for validation ─────────────────────
  let bodyText = '';
  try {
    const $v = cheerio.load(html);
    $v('script, style, noscript, head').remove();
    bodyText = $v('body').text().replace(/\s+/g, ' ').trim();
  } catch { bodyText = ''; }

  // ── Step 3: Source quality gate ───────────────────────────────────────────
  const validation = validateSource({
    httpStatus,
    bodyText,
    sourceUrl:  target.target_url,
    sourceName: target.source_name,
    storeName:  target.store_name,
  });

  if (!validation.ok) {
    console.warn(`    ${tag} ✗ REJECTED — ${validation.reason}`);
    await supabase.from('scraper_logs').insert({
      job_id: jobId, store_slug: target.store_slug, action: 'skipped',
      detail: `${tag} Source rejected: ${validation.reason}`,
    }).catch(() => {});
    return [];
  }

  console.log(`    ${tag} ✓ Quality checks passed (HTTP ${httpStatus}, signals: ${validation.checks.couponContent?.signalsFound ?? '?'})`);

  // ── Step 4: Parse HTML ───────────────────────────────────────────────────
  let cleanedText;
  try {
    ({ cleanedText } = parseHtml(html, target));
  } catch (parseError) {
    console.warn(`    ${tag} Parse failed: ${parseError.message}`);
    return [];
  }

  if (!cleanedText || cleanedText.trim().length < 30) {
    console.log(`    ${tag} Insufficient content after parsing. Skipping.`);
    return [];
  }

  // ── Step 5: AI extraction ────────────────────────────────────────────────
  let offers = [];
  try {
    offers = await aiExtractCoupons(cleanedText, target.store_name);
  } catch (aiError) {
    console.warn(`    ${tag} AI extraction failed: ${aiError.message}`);
    return [];
  }

  const elapsed = Date.now() - sourceStart;
  console.log(
    `[Metrics] discovery-source | ${target.source_name} | ${target.store_slug} | ` +
    `${offers.length} offer(s) | ${elapsed}ms`
  );
  return offers;
}

// ── Per-store work unit ────────────────────────────────────────────────────────

/**
 * Processes all sources for a single store, accumulating and deduplicating
 * offers, then inserting new ones into the database.
 *
 * @param {{ storeSlug: string, storeTargets: object[] }} storeTask
 * @param {string} jobId
 * @returns {Promise<{ offers_found: number, offers_inserted: number, sources_scraped: number }>}
 */
async function processStore(storeTask, jobId) {
  const { storeSlug, storeTargets } = storeTask;
  const firstTarget = storeTargets[0];
  const storeStart  = Date.now();

  console.log(
    `\n=== Processing store: ${firstTarget.store_name} (${storeSlug}) — ` +
    `${storeTargets.length} sources ===`
  );

  // Acquire a browser from the pool for all sources in this store
  const { browser, slotIndex } = await acquireBrowser();
  const seenCodes  = new Set();
  const seenTitles = new Set();
  const allOffersForStore = [];
  let sourcesScraped = 0;

  try {
    for (const target of storeTargets) {
      try {
        const sourceOffers = await scrapeSourceUrl(target, jobId, browser);
        sourcesScraped++;

        if (sourceOffers.length === 0) continue;

        const tagged = sourceOffers.map((o) => ({
          ...o,
          _sourceUrl:  target.target_url,
          _sourceName: target.source_name,
          _isOfficial: target.is_official,
        }));

        const { unique } = deduplicateInMemory(tagged, seenCodes, seenTitles);
        allOffersForStore.push(...unique);

        console.log(`    [Source: ${target.source_name}] ${unique.length} unique offer(s) kept.`);
      } catch (sourceError) {
        console.error(`    [Source: ${target.source_name}] Unexpected error: ${sourceError.message}`);
      }
    }
  } finally {
    releaseBrowser(slotIndex);
  }

  const localStats = { offers_found: 0, offers_inserted: 0, sources_scraped: sourcesScraped };

  if (allOffersForStore.length === 0) {
    console.log(`  No offers found across any source for ${firstTarget.store_name}.`);
    return localStats;
  }

  console.log(`  Total unique offers across all sources for ${firstTarget.store_name}: ${allOffersForStore.length}`);
  localStats.offers_found = allOffersForStore.length;

  // DB-level dedup
  const uniqueOffers = await dedupOffers(allOffersForStore, storeSlug);
  if (uniqueOffers.length === 0) {
    console.log(`  All offers for ${firstTarget.store_name} already exist in DB.`);
    return localStats;
  }

  // Insert
  const offerRows = uniqueOffers.map((o) => ({
    title:             o.title,
    description:       o.description || '',
    type:              o.type || 'Coupon',
    store_slug:        storeSlug,
    store_name:        firstTarget.store_name,
    source:            o._isOfficial ? 'Official' : 'Scraper',
    expiry_date:       o.expiryDate || '',
    status:            'Active',
    code:              o.code || '',
    validation_status: 'pending',
    scraped_at:        new Date().toISOString(),
    source_url:        o._sourceUrl || '',
    is_sitewide:       o.isSitewide || false,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('offers')
    .insert(offerRows)
    .select();

  if (insertError) {
    console.error(`  Error inserting offers for ${firstTarget.store_name}:`, insertError.message);
    return localStats;
  }

  const insertedCount = inserted ? inserted.length : offerRows.length;
  localStats.offers_inserted = insertedCount;
  console.log(`  ✓ Inserted ${insertedCount} new offer(s) for ${firstTarget.store_name}.`);

  // Log
  const logRows = uniqueOffers.map((o) => ({
    job_id:      jobId,
    store_slug:  storeSlug,
    offer_title: o.title,
    offer_code:  o.code || null,
    action:      'inserted',
    detail:      `Discovered via ${o._sourceName || 'Unknown'} — ${o._sourceUrl || ''}`,
  }));
  await supabase.from('scraper_logs').insert(logRows).catch(() => {});

  // Update store timestamp
  await supabase
    .from('stores')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', firstTarget.id);

  const storeElapsed = Date.now() - storeStart;
  console.log(
    `[Metrics] discovery-store | ${firstTarget.store_name} | ` +
    `sources=${sourcesScraped} found=${localStats.offers_found} inserted=${localStats.offers_inserted} | ${storeElapsed}ms`
  );

  return localStats;
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────

/**
 * Orchestrates the full multi-source coupon discovery pipeline.
 *
 * Improvements over the previous sequential implementation:
 *  - Stores are processed in parallel (DISCOVERY_CONCURRENCY workers)
 *  - All workers share a browser pool — no per-URL browser launch
 *  - Per-source and per-store timing metrics are emitted to the console
 *
 * @param {string} [manualJobId]
 * @returns {Promise<object>} Job statistics
 */
export async function runDiscoveryPipeline(manualJobId = null) {
  const pipelineStart = Date.now();
  let jobId = manualJobId;
  let stats = {
    stores_processed:  0,
    sources_scraped:   0,
    offers_found:      0,
    offers_inserted:   0,
  };

  try {
    // Create or load job record
    if (!jobId) {
      const { data: job, error: jobError } = await supabase
        .from('scraper_jobs')
        .insert({ job_type: 'discover', status: 'running', started_at: new Date().toISOString() })
        .select()
        .single();
      if (jobError) throw new Error(`Failed to create scraper job: ${jobError.message}`);
      jobId = job.id;
    }

    console.log(`[Discovery Pipeline] Started job ID: ${jobId}, concurrency: ${DISCOVERY_CONCURRENCY}`);

    // Initialise browser pool (no-op if already running)
    await initBrowserPool();

    // Load and group targets by store
    const allTargets = await loadTargets();
    console.log(`[Discovery Pipeline] Loaded ${allTargets.length} total source targets.`);

    const targetsByStore = new Map();
    for (const target of allTargets) {
      if (!targetsByStore.has(target.store_slug)) {
        targetsByStore.set(target.store_slug, []);
      }
      targetsByStore.get(target.store_slug).push(target);
    }

    // Sort sources within each store by priority
    const storeTasks = [];
    for (const [storeSlug, storeTargets] of targetsByStore) {
      storeTargets.sort((a, b) => a.source_priority - b.source_priority);
      storeTasks.push({ storeSlug, storeTargets });
    }

    console.log(`[Discovery Pipeline] Processing ${storeTasks.length} stores with ${DISCOVERY_CONCURRENCY} parallel workers.`);
    console.log(`[Discovery Pipeline] Browser pool status:`, getPoolStatus());

    // Run parallel queue
    const { results, metrics } = await runQueue(
      storeTasks,
      (task) => processStore(task, jobId),
      { concurrency: DISCOVERY_CONCURRENCY, label: 'discovery' }
    );

    // Aggregate stats
    for (const { result } of results) {
      if (!result) continue;
      stats.stores_processed++;
      stats.sources_scraped  += result.sources_scraped;
      stats.offers_found     += result.offers_found;
      stats.offers_inserted  += result.offers_inserted;
    }

    const totalMs = Date.now() - pipelineStart;

    // Persist job result
    await supabase.from('scraper_jobs').update({
      status:           'completed',
      completed_at:     new Date().toISOString(),
      stores_processed: stats.stores_processed,
      offers_found:     stats.offers_found,
      offers_inserted:  stats.offers_inserted,
      metrics:          JSON.stringify({ ...metrics, totalPipelineMs: totalMs }),
    }).eq('id', jobId);

    console.log(
      `\n[Discovery Pipeline] Job ${jobId} finished in ${totalMs}ms. Stats:`,
      `${stats.stores_processed} stores, ${stats.sources_scraped} sources, ` +
      `${stats.offers_found} found, ${stats.offers_inserted} inserted.`
    );
    return stats;

  } catch (error) {
    console.error(`[Discovery Pipeline] Critical error:`, error.message);
    if (jobId) {
      await supabase.from('scraper_jobs').update({
        status:        'failed',
        completed_at:  new Date().toISOString(),
        error_message: error.message,
      }).eq('id', jobId);
    }
    throw error;
  }
}
