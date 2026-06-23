import cron from 'node-cron';
import { runDiscoveryPipeline } from '../scraper/discover.js';
import { runValidationPipeline, runStoreVerificationPipeline } from '../scraper/validate.js';

/**
 * Initializes scheduled cron jobs for the scraper service.
 *
 * Three independent schedules:
 *
 *  1. Discovery          — every 12 hours (1:00 AM & 1:00 PM)
 *                          Finds new coupons/deals from merchant + aggregator pages.
 *
 *  2. Store Verification — every 6 hours
 *                          Lightweight Layer 1 check: is the offer still visible on the
 *                          store's promotions page? No checkout interaction.
 *
 *  3. Full Validation    — daily at 3:00 AM
 *                          Layer 1 + selective Layer 2 (checkout) for new, changed,
 *                          sitewide, and high-priority coupons.
 */
export function initScheduler() {
  console.log('[Scheduler] Initializing automated schedules...');

  // 1. Discovery: 1:00 AM and 1:00 PM daily
  cron.schedule('0 1,13 * * *', async () => {
    console.log('[Scheduler] ▶ Triggering Discovery Job...');
    try {
      await runDiscoveryPipeline();
      console.log('[Scheduler] ✓ Discovery Job completed.');
    } catch (err) {
      console.error('[Scheduler] ✗ Discovery Job failed:', err.message);
    }
  });

  // 2. Store Verification: every 6 hours (lightweight freshness check)
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] ▶ Triggering Store Verification Job (Layer 1 only)...');
    try {
      await runStoreVerificationPipeline();
      console.log('[Scheduler] ✓ Store Verification Job completed.');
    } catch (err) {
      console.error('[Scheduler] ✗ Store Verification Job failed:', err.message);
    }
  });

  // 3. Full Validation: 3:00 AM daily (Layer 1 + selective Layer 2 checkout)
  cron.schedule('0 3 * * *', async () => {
    console.log('[Scheduler] ▶ Triggering Full Validation Job (Layer 1 + checkout)...');
    try {
      await runValidationPipeline();
      console.log('[Scheduler] ✓ Full Validation Job completed.');
    } catch (err) {
      console.error('[Scheduler] ✗ Full Validation Job failed:', err.message);
    }
  });

  console.log('[Scheduler] ✓ Discovery scheduled        — 1:00 AM & 1:00 PM daily  (0 1,13 * * *)');
  console.log('[Scheduler] ✓ Store Verification scheduled — every 6 hours           (0 */6 * * *)');
  console.log('[Scheduler] ✓ Full Validation scheduled  — 3:00 AM daily             (0 3 * * *)');
}
