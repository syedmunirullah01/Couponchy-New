import { supabase } from '../config/supabase.js';

/**
 * Validation Scheduler
 *
 * Queries the offers table and buckets each offer into one of three queues:
 *
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │  needsStoreVerify  — due for Layer 1 (store-page presence check) │
 *  │  needsCheckout     — also needs Layer 2 (checkout validation)    │
 *  │  skip              — within cooldown, no action needed           │
 *  └─────────────────────────────────────────────────────────────────┘
 *
 * Rules (all configurable via env vars):
 *
 *  VERIFY_COOLDOWN_DAYS   — skip Layer 1 if verified within N days (default: 3)
 *  CHECKOUT_COOLDOWN_DAYS — skip Layer 2 if verified within N days (default: 3)
 *  FAILURE_RECHECK_DAYS   — recheck failed offers every N days (default: 7)
 *
 * Layer 2 is triggered for:
 *  - New coupons (status = 'pending')
 *  - Sitewide coupons (is_sitewide = true)
 *  - Coupons that changed (updated_at newer than last_verified_at)
 *  - Coupons that have never had a checkout verification (checkout_verified = false and no validated_at)
 *  - Coupons that passed Layer 1 and are due for a re-verify
 */

const VERIFY_COOLDOWN_MS   = parseInt(process.env.VERIFY_COOLDOWN_DAYS   || '3', 10) * 86400000;
const CHECKOUT_COOLDOWN_MS = parseInt(process.env.CHECKOUT_COOLDOWN_DAYS || '3', 10) * 86400000;
const FAILURE_RECHECK_MS   = parseInt(process.env.FAILURE_RECHECK_DAYS   || '7', 10) * 86400000;

/**
 * @typedef {object} ScheduledOffer
 * @property {string}  id
 * @property {string}  title
 * @property {string}  type              'Coupon' | 'Deal'
 * @property {string}  code
 * @property {string}  store_slug
 * @property {string}  store_name
 * @property {string}  source_url
 * @property {string}  validated_at
 * @property {string}  last_verified_at
 * @property {string}  validation_status
 * @property {number}  unchecked_count
 * @property {boolean} is_sitewide
 * @property {boolean} checkout_verified
 * @property {string}  updated_at
 */

/**
 * Loads all active offers and returns three buckets.
 *
 * @param {{ forceAll?: boolean }} [options]
 * @returns {Promise<{
 *   needsStoreVerify: ScheduledOffer[],
 *   needsCheckout: ScheduledOffer[],
 *   skip: ScheduledOffer[],
 * }>}
 */
export async function scheduleValidation(options = {}) {
  const { forceAll = false } = options;

  const { data: rawOffers, error } = await supabase
    .from('offers')
    .select(
      'id, title, type, code, store_slug, store_name, source_url, ' +
      'validated_at, last_verified_at, validation_status, unchecked_count, ' +
      'is_sitewide, checkout_verified, updated_at'
    )
    .eq('status', 'Active');

  if (error) {
    throw new Error(`[ValidationScheduler] Failed to fetch offers: ${error.message}`);
  }

  const offers = rawOffers || [];
  const now = Date.now();

  const needsStoreVerify = [];
  const needsCheckout    = [];
  const skip             = [];

  for (const offer of offers) {
    const status       = offer.validation_status || 'pending';
    const verifiedAt   = offer.last_verified_at ? new Date(offer.last_verified_at).getTime() : 0;
    const validatedAt  = offer.validated_at      ? new Date(offer.validated_at).getTime()      : 0;
    const updatedAt    = offer.updated_at        ? new Date(offer.updated_at).getTime()        : 0;
    const failCount    = offer.unchecked_count   || 0;
    const isSitewide   = offer.is_sitewide       || false;
    const ageVerify    = now - verifiedAt;
    const ageFailed    = now - validatedAt;

    // Determine if the coupon is "new" (never checked)
    const isNew = status === 'pending' || verifiedAt === 0;

    // Determine if it recently changed (scraped/updated after last verification)
    const changed = updatedAt > verifiedAt && verifiedAt > 0;

    // Repeated failure — throttle to FAILURE_RECHECK_MS cadence
    if (failCount >= 3) {
      if (!forceAll && ageFailed < FAILURE_RECHECK_MS) {
        skip.push(offer);
        continue;
      }
      // Due for a low-cost re-check (store page only, no checkout)
      needsStoreVerify.push(offer);
      continue;
    }

    // Within cooldown — skip entirely
    if (!forceAll && !isNew && !isSitewide && ageVerify < VERIFY_COOLDOWN_MS) {
      skip.push(offer);
      continue;
    }

    // Eligible for Layer 1
    needsStoreVerify.push(offer);

    // Determine if Layer 2 checkout is also needed
    const needsDeepCheck = (
      (offer.type === 'Coupon') &&  // Deals never need checkout
      (
        forceAll       ||
        isNew          ||           // Brand-new coupon
        isSitewide     ||           // Always validate sitewide codes
        changed        ||           // Content changed since last verification
        !offer.checkout_verified || // Never been checkout-verified
        ageVerify >= CHECKOUT_COOLDOWN_MS // Due for scheduled re-verify
      )
    );

    if (needsDeepCheck) {
      needsCheckout.push(offer);
    }
  }

  console.log(
    `[ValidationScheduler] Bucketed ${offers.length} active offers: ` +
    `${needsStoreVerify.length} store-verify, ${needsCheckout.length} checkout, ${skip.length} skipped`
  );

  return { needsStoreVerify, needsCheckout, skip };
}
