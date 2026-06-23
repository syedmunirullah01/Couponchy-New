import { supabase } from '../config/supabase.js';
import { initBrowserPool, acquireBrowser, releaseBrowser, getPoolStatus } from './browser-pool.js';
import { runQueue } from './queue.js';
import { scheduleValidation } from './validation-scheduler.js';
import { verifyOfferOnStorePage } from './store-verifier.js';
import { validateCouponAtCheckout } from './checkout-validator.js';
import { pruneProductCache } from './product-cache.js';

/**
 * Validation Pipeline (optimised)
 *
 * Replaces the old sequential for-loop with a two-phase parallel worker queue:
 *
 *  Phase 1 — Store Verification (Layer 1)
 *    Runs `verifyOfferOnStorePage` for all offers due for a store-page check.
 *    Fast — no checkout interaction. Concurrency: STORE_VERIFY_CONCURRENCY workers.
 *
 *  Phase 2 — Checkout Validation (Layer 2)
 *    Runs `validateCouponAtCheckout` only for the subset of coupons flagged by
 *    the scheduler (new, changed, sitewide, or high-priority).
 *    Slow — navigates checkout flow. Concurrency: CHECKOUT_CONCURRENCY workers.
 *
 * Configuration (env vars):
 *   STORE_VERIFY_CONCURRENCY — parallel workers for Layer 1 (default: 5)
 *   CHECKOUT_CONCURRENCY     — parallel workers for Layer 2 (default: 3)
 */

const STORE_VERIFY_CONCURRENCY = parseInt(process.env.STORE_VERIFY_CONCURRENCY || '5', 10);
const CHECKOUT_CONCURRENCY     = parseInt(process.env.CHECKOUT_CONCURRENCY     || '3', 10);

// ── Store-verification task ───────────────────────────────────────────────────

/**
 * Runs Layer 1 (store-page presence check) for one offer.
 * Returns an enriched object so Phase 2 can consume it without a DB round-trip.
 *
 * @param {object} offer
 * @param {string} jobId
 * @returns {Promise<object>} offer annotated with { storeVerified, verifyDetail }
 */
async function runStoreVerify(offer, jobId) {
  const validationUrl = await resolveValidationUrl(offer);
  const { browser, slotIndex } = await acquireBrowser();

  try {
    const { present, detail } = await verifyOfferOnStorePage(browser, validationUrl, offer);

    // Persist Layer 1 result immediately
    await supabase.from('offers').update({
      store_verified:   present,
      last_verified_at: new Date().toISOString(),
    }).eq('id', offer.id);

    return { ...offer, storeVerified: present, verifyDetail: detail, validationUrl };
  } finally {
    releaseBrowser(slotIndex);
  }
}

// ── Checkout-validation task ──────────────────────────────────────────────────

/**
 * Runs Layer 2 (checkout) for one offer.
 * Updates the DB with the final combined result.
 *
 * @param {object} offer - Must include storeVerified, verifyDetail, validationUrl from Phase 1
 * @param {string} jobId
 * @param {{ offers_validated: number, offers_expired: number }} stats - Mutated in place
 */
async function runCheckoutValidate(offer, jobId, stats) {
  const { browser, slotIndex } = await acquireBrowser();

  try {
    const checkoutResult = await validateCouponAtCheckout(
      browser,
      offer.validationUrl,
      offer.code,
      offer.store_slug
    );

    const checkoutVerified = checkoutResult.status === 'valid';
    const passed = offer.storeVerified || checkoutVerified;

    stats.offers_validated++;

    const offerUpdate = {
      validated_at:      new Date().toISOString(),
      last_verified_at:  new Date().toISOString(),
      store_verified:    offer.storeVerified,
      checkout_verified: checkoutVerified,
    };

    let resultStatus = 'inconclusive';
    let detailMsg = '';

    if (passed) {
      offerUpdate.validation_status = 'valid';
      offerUpdate.unchecked_count   = 0;
      resultStatus = 'valid';
      detailMsg = `Verified: Store=${offer.storeVerified ? 'PASS' : 'FAIL'}, Checkout=${checkoutVerified ? 'PASS' : 'FAIL'}`;
      console.log(`[Validation] ✓ "${offer.title}" verified`);
    } else {
      const isExplicit =
        checkoutResult.status === 'invalid' ||
        (!offer.storeVerified && offer.type === 'Deal');

      if (isExplicit) {
        offerUpdate.status            = 'Expired';
        offerUpdate.validation_status = 'invalid';
        offerUpdate.unchecked_count   = 0;
        stats.offers_expired++;
        resultStatus = 'invalid';
        detailMsg = `Failed: Store=FAIL, Checkout=${checkoutResult.status.toUpperCase()}`;
        console.log(`[Validation] ✗ "${offer.title}" expired`);
      } else {
        offerUpdate.validation_status = 'unchecked';
        offerUpdate.unchecked_count   = (offer.unchecked_count || 0) + 1;
        resultStatus = 'inconclusive';
        detailMsg = `Inconclusive: Store=${offer.storeVerified ? 'PASS' : 'FAIL'}, Checkout=${checkoutResult.status.toUpperCase()}`;
        console.log(`[Validation] ~ "${offer.title}" inconclusive`);
      }
    }

    await supabase.from('offers').update(offerUpdate).eq('id', offer.id);

    const allowedActionMap = {
      valid: 'validated_ok',
      invalid: 'expired',
      inconclusive: ''
    };

    await supabase.from('scraper_logs').insert({
      job_id:      jobId,
      store_slug:  offer.store_slug,
      offer_title: offer.title,
      offer_code:  offer.code || null,
      action:      allowedActionMap[resultStatus] || '',
      detail:      detailMsg,
    });

  } finally {
    releaseBrowser(slotIndex);
  }
}

/**
 * Runs Layer 1 only for offers that don't need checkout.
 * Marks them valid/unchecked without touching checkout.
 *
 * @param {object} offer - annotated with storeVerified, verifyDetail from Phase 1
 * @param {string} jobId
 * @param {{ offers_validated: number, offers_expired: number }} stats
 */
async function persistStoreVerifyOnly(offer, jobId, stats) {
  stats.offers_validated++;
  const passed = offer.storeVerified;

  const offerUpdate = {
    validated_at:      new Date().toISOString(),
    last_verified_at:  new Date().toISOString(),
    store_verified:    offer.storeVerified,
  };

  if (passed) {
    offerUpdate.validation_status = 'valid';
    offerUpdate.unchecked_count   = 0;
  } else if (offer.type === 'Deal') {
    // Deals fail on store-page absence
    offerUpdate.status            = 'Expired';
    offerUpdate.validation_status = 'invalid';
    offerUpdate.unchecked_count   = 0;
    stats.offers_expired++;
  } else {
    offerUpdate.validation_status = 'unchecked';
    offerUpdate.unchecked_count   = (offer.unchecked_count || 0) + 1;
  }

  await supabase.from('offers').update(offerUpdate).eq('id', offer.id);

  await supabase.from('scraper_logs').insert({
    job_id:      jobId,
    store_slug:  offer.store_slug,
    offer_title: offer.title,
    offer_code:  offer.code || null,
    action:      passed ? 'validated_ok' : '',
    detail:      offer.verifyDetail || '',
  });
}

// ── Main Pipeline ─────────────────────────────────────────────────────────────

/**
 * Runs the full two-phase validation pipeline.
 *
 * Phase 1: Store verification — lightweight, high concurrency, runs for all
 *           eligible offers via `scheduleValidation`.
 * Phase 2: Checkout validation — expensive, lower concurrency, runs only for
 *           the subset flagged as needing deep verification.
 *
 * @param {string}  [manualJobId]
 * @param {boolean} [forceAll]    - bypass all cooldowns
 * @returns {Promise<object>} Job statistics
 */
export async function runValidationPipeline(manualJobId = null, forceAll = false) {
  const pipelineStart = Date.now();
  let jobId = manualJobId;
  const stats = { offers_validated: 0, offers_expired: 0 };

  try {
    if (!jobId) {
      const { data: job, error: jobError } = await supabase
        .from('scraper_jobs')
        .insert({ job_type: 'validate', status: 'running', started_at: new Date().toISOString() })
        .select()
        .single();
      if (jobError) throw new Error(`Failed to create validation job: ${jobError.message}`);
      jobId = job.id;
    }

    console.log(`[Validation Pipeline] Started job ID: ${jobId}, forceAll: ${forceAll}`);
    console.log(`[Validation Pipeline] Concurrency — StoreVerify: ${STORE_VERIFY_CONCURRENCY}, Checkout: ${CHECKOUT_CONCURRENCY}`);

    await initBrowserPool();
    pruneProductCache();

    // Schedule: bucket offers into needsStoreVerify / needsCheckout / skip
    const { needsStoreVerify, needsCheckout, skip } = await scheduleValidation({ forceAll });

    console.log(
      `[Validation Pipeline] Offers — StoreVerify: ${needsStoreVerify.length}, ` +
      `Checkout: ${needsCheckout.length}, Skipped: ${skip.length}`
    );
    console.log(`[Validation Pipeline] Browser pool:`, getPoolStatus());

    if (needsStoreVerify.length === 0) {
      await supabase.from('scraper_jobs').update({
        status: 'completed', completed_at: new Date().toISOString(),
        offers_validated: 0, offers_expired: 0,
      }).eq('id', jobId);
      return stats;
    }

    // ── Phase 1: Store verification ───────────────────────────────────────
    console.log(`\n[Validation Pipeline] ── Phase 1: Store Verification (${needsStoreVerify.length} offers) ──`);
    const { results: phase1Results, metrics: phase1Metrics } = await runQueue(
      needsStoreVerify,
      (offer) => runStoreVerify(offer, jobId),
      { concurrency: STORE_VERIFY_CONCURRENCY, label: 'store-verify' }
    );

    // Build a Set of IDs that need checkout (from scheduler decision)
    const checkoutIds = new Set(needsCheckout.map((o) => o.id));

    // Separate Phase 1 results into checkout queue vs store-verify-only
    const checkoutQueue = [];
    const storeOnlyQueue = [];

    for (const { result, error } of phase1Results) {
      if (!result || error) continue;
      if (checkoutIds.has(result.id)) {
        checkoutQueue.push(result); // will be processed in Phase 2
      } else {
        storeOnlyQueue.push(result); // persist store-verify result and stop
      }
    }

    // Persist store-verify-only results in parallel
    await runQueue(
      storeOnlyQueue,
      (offer) => persistStoreVerifyOnly(offer, jobId, stats),
      { concurrency: STORE_VERIFY_CONCURRENCY, label: 'store-verify-persist' }
    );

    // ── Phase 2: Checkout validation ──────────────────────────────────────
    let phase2Metrics = null;
    if (checkoutQueue.length > 0) {
      console.log(`\n[Validation Pipeline] ── Phase 2: Checkout Validation (${checkoutQueue.length} coupons) ──`);
      const { metrics } = await runQueue(
        checkoutQueue,
        (offer) => runCheckoutValidate(offer, jobId, stats),
        { concurrency: CHECKOUT_CONCURRENCY, label: 'checkout' }
      );
      phase2Metrics = metrics;
    }

    const totalMs = Date.now() - pipelineStart;

    await supabase.from('scraper_jobs').update({
      status:           'completed',
      completed_at:     new Date().toISOString(),
      offers_validated: stats.offers_validated,
      offers_expired:   stats.offers_expired,
      metrics:          JSON.stringify({
        phase1: phase1Metrics,
        phase2: phase2Metrics,
        totalPipelineMs: totalMs,
      }),
    }).eq('id', jobId);

    console.log(
      `\n[Validation Pipeline] Job ${jobId} completed in ${totalMs}ms. ` +
      `Validated: ${stats.offers_validated}, Expired: ${stats.offers_expired}, Skipped: ${skip.length}`
    );
    return stats;

  } catch (error) {
    console.error(`[Validation Pipeline] Critical error:`, error.message);
    if (jobId) {
      await supabase.from('scraper_jobs').update({
        status: 'failed', completed_at: new Date().toISOString(), error_message: error.message,
      }).eq('id', jobId);
    }
    throw error;
  }
}

/**
 * Lightweight store-verification-only pipeline.
 * Runs Layer 1 for all eligible offers — no checkout interaction.
 * Designed to run every 6 hours as a cheap freshness check.
 *
 * @param {string} [manualJobId]
 * @returns {Promise<object>}
 */
export async function runStoreVerificationPipeline(manualJobId = null) {
  const pipelineStart = Date.now();
  let jobId = manualJobId;
  const stats = { offers_validated: 0, offers_expired: 0 };

  try {
    if (!jobId) {
      const { data: job, error } = await supabase
        .from('scraper_jobs')
        .insert({ job_type: 'store-verify', status: 'running', started_at: new Date().toISOString() })
        .select().single();
      if (error) throw new Error(`Failed to create store-verify job: ${error.message}`);
      jobId = job.id;
    }

    console.log(`[StoreVerify Pipeline] Started job ID: ${jobId}`);
    await initBrowserPool();

    const { needsStoreVerify, skip } = await scheduleValidation({ forceAll: false });
    console.log(
      `[StoreVerify Pipeline] ${needsStoreVerify.length} offer(s) to verify, ${skip.length} skipped`
    );

    if (needsStoreVerify.length === 0) {
      await supabase.from('scraper_jobs').update({
        status: 'completed', completed_at: new Date().toISOString(),
      }).eq('id', jobId);
      return stats;
    }

    const { results, metrics } = await runQueue(
      needsStoreVerify,
      (offer) => runStoreVerify(offer, jobId),
      { concurrency: STORE_VERIFY_CONCURRENCY, label: 'store-verify' }
    );

    // Persist results (no checkout)
    await runQueue(
      results.filter((r) => r.result).map((r) => r.result),
      (offer) => persistStoreVerifyOnly(offer, jobId, stats),
      { concurrency: STORE_VERIFY_CONCURRENCY, label: 'store-verify-persist' }
    );

    const totalMs = Date.now() - pipelineStart;

    await supabase.from('scraper_jobs').update({
      status:           'completed',
      completed_at:     new Date().toISOString(),
      offers_validated: stats.offers_validated,
      offers_expired:   stats.offers_expired,
      metrics:          JSON.stringify({ phase1: metrics, totalPipelineMs: totalMs }),
    }).eq('id', jobId);

    console.log(
      `[StoreVerify Pipeline] Job ${jobId} done in ${totalMs}ms. ` +
      `Verified: ${stats.offers_validated}, Expired: ${stats.offers_expired}`
    );
    return stats;

  } catch (error) {
    console.error(`[StoreVerify Pipeline] Error:`, error.message);
    if (jobId) {
      await supabase.from('scraper_jobs').update({
        status: 'failed', completed_at: new Date().toISOString(), error_message: error.message,
      }).eq('id', jobId);
    }
    throw error;
  }
}

// ── Internal: URL resolution ──────────────────────────────────────────────────

async function resolveValidationUrl(offer) {
  // Try scraper target first (promotions page), excluding aggregators
  const { data: targets } = await supabase
    .from('scraper_targets')
    .select('target_url')
    .eq('store_slug', offer.store_slug);

  const officialTarget = targets?.find(t => {
    const url = t.target_url.toLowerCase();
    return !url.includes("retailmenot.com") && 
           !url.includes("coupons.com") && 
           !url.includes("dealspotr.com") && 
           !url.includes("knoji.com") && 
           !url.includes("couponfollow.com") &&
           !url.includes("ebay.com");
  });

  if (officialTarget?.target_url) return officialTarget.target_url;

  // Try store affiliate link next
  const { data: storeData } = await supabase
    .from('stores')
    .select('affiliate_link')
    .eq('slug', offer.store_slug)
    .limit(1);

  if (storeData?.[0]?.affiliate_link) return storeData[0].affiliate_link;

  // Fallback to offer's source_url only if it is not an aggregator URL
  if (offer.source_url) {
    const url = offer.source_url.toLowerCase();
    if (!url.includes("retailmenot.com") && 
        !url.includes("coupons.com") && 
        !url.includes("dealspotr.com") && 
        !url.includes("knoji.com") && 
        !url.includes("couponfollow.com") &&
        !url.includes("ebay.com")) {
      return offer.source_url;
    }
  }

  return `https://www.google.com/search?q=${encodeURIComponent(offer.store_name)}`;
}
