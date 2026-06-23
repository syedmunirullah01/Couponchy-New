import { supabase } from '../config/supabase.js';

/**
 * Bulk updates offers marked as 'invalid' during validation to status='Expired'.
 * Typically called at the end of a validation run, or on a schedule.
 * 
 * @param {string} [jobId] - Associated scraper job ID for logging
 * @returns {Promise<number>} Number of offers expired
 */
export async function expireInvalidOffers(jobId = null) {
  try {
    console.log('[Auto-Expire] Fetching offers with validation_status = "invalid" and status = "Active"...');
    
    const { data: invalidOffers, error: fetchError } = await supabase
      .from('offers')
      .select('id, title, store_slug, code')
      .eq('validation_status', 'invalid')
      .eq('status', 'Active');

    if (fetchError) {
      console.error('[Auto-Expire] Error fetching invalid offers:', fetchError.message);
      return 0;
    }

    if (!invalidOffers || invalidOffers.length === 0) {
      console.log('[Auto-Expire] No active invalid offers to expire.');
      return 0;
    }

    console.log(`[Auto-Expire] Found ${invalidOffers.length} offers to expire. Updating database...`);

    const offerIds = invalidOffers.map(o => o.id);

    const { error: updateError } = await supabase
      .from('offers')
      .update({ status: 'Expired', updated_at: new Date().toISOString() })
      .in('id', offerIds);

    if (updateError) {
      console.error('[Auto-Expire] Error updating offers to Expired:', updateError.message);
      return 0;
    }

    // Log the expiration events to scraper_logs
    if (jobId) {
      const logs = invalidOffers.map(o => ({
        job_id: jobId,
        store_slug: o.store_slug,
        offer_title: o.title,
        offer_code: o.code || null,
        action: 'expired',
        detail: 'Auto-expired: coupon code failed verification'
      }));

      await supabase.from('scraper_logs').insert(logs);
    }

    console.log(`[Auto-Expire] Successfully expired ${invalidOffers.length} offers.`);
    return invalidOffers.length;
  } catch (error) {
    console.error('[Auto-Expire] Unexpected error during expiry:', error.message);
    return 0;
  }
}
