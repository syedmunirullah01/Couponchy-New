import { supabase } from '../config/supabase.js';

/**
 * Filters out offers that already exist in Supabase for the given store.
 * 
 * @param {Array} newOffers - The list of newly extracted offers
 * @param {string} storeSlug - The slug of the store being processed
 * @returns {Promise<Array>} List of filtered, unique offers that are ready for insertion
 */
export async function dedupOffers(newOffers, storeSlug) {
  if (!newOffers || newOffers.length === 0) return [];

  try {
    // Fetch all existing offers for this store (both active and expired to avoid re-inserting dead codes)
    const { data: existingOffers, error } = await supabase
      .from('offers')
      .select('title, code, type, status')
      .eq('store_slug', storeSlug);

    if (error) {
      console.error(`[Dedup] Error fetching existing offers for ${storeSlug}:`, error.message);
      // If db read fails, proceed with all new offers but log warning
      return newOffers;
    }

    console.log(`[Dedup] Found ${existingOffers.length} existing offers for ${storeSlug} in database.`);

    // Create sets of existing codes and titles for fast lookup
    const existingCodes = new Set();
    const existingTitles = new Set();

    existingOffers.forEach(o => {
      if (o.code) {
        existingCodes.add(o.code.trim().toUpperCase());
      } else if (o.title) {
        existingTitles.add(o.title.trim().toLowerCase());
      }
    });

    const uniqueOffers = [];

    for (const offer of newOffers) {
      const offerCode = offer.code ? offer.code.trim().toUpperCase() : null;
      const offerTitle = offer.title ? offer.title.trim().toLowerCase() : '';

      if (offerCode) {
        // If it has a code, check if the code already exists
        if (existingCodes.has(offerCode)) {
          console.log(`[Dedup] Skipping duplicate coupon code: ${offer.code}`);
          continue;
        }
      } else {
        // If it is a deal (no code), check if the exact title exists
        if (existingTitles.has(offerTitle)) {
          console.log(`[Dedup] Skipping duplicate deal title: "${offer.title}"`);
          continue;
        }
      }

      // Add to list of unique offers
      uniqueOffers.push(offer);
    }

    console.log(`[Dedup] Filtered new offers: ${newOffers.length} raw → ${uniqueOffers.length} unique`);
    return uniqueOffers;
  } catch (error) {
    console.error(`[Dedup] Unexpected error during deduplication for ${storeSlug}:`, error.message);
    return newOffers;
  }
}
