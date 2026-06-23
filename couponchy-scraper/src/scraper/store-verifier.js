import { openContext } from './browser-pool.js';

/**
 * Layer 1 — Store-Page Presence Verifier
 *
 * Checks whether a coupon code or deal is still visibly promoted on the
 * merchant's official promotions / sale page, without touching checkout.
 *
 * This is extracted from validate.js into a standalone module so it can be:
 *  - Run independently on a high-frequency schedule (e.g. every 6 hours)
 *  - Used as the lightweight first gate before costly checkout validation
 *  - Processed in parallel by the worker queue without side-effects
 *
 * @param {import('playwright').Browser} browser - Shared browser from the pool
 * @param {string} validationUrl - Merchant promotions / sale page URL
 * @param {object} offer - Offer record from the database
 * @returns {Promise<{ present: boolean, detail: string, durationMs: number }>}
 */
export async function verifyOfferOnStorePage(browser, validationUrl, offer) {
  const start = Date.now();
  let context = null;

  try {
    context = await openContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(12000);

    console.log(`[StoreVerifier] Visiting: ${validationUrl}`);
    await page.goto(validationUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500); // Allow late-rendered text

    // Dismiss common popups
    await dismissPopups(page);

    const bodyText = await page.innerText('body').catch(() => '');

    if (offer.type === 'Coupon') {
      if (!offer.code) {
        return result(false, 'No coupon code to check', start);
      }
      const cleanCode = offer.code.trim().toUpperCase();
      const present = bodyText.toUpperCase().includes(cleanCode);
      console.log(
        `[StoreVerifier] Coupon "${cleanCode}" ${present ? 'FOUND' : 'NOT FOUND'} on store page`
      );
      return result(present, present ? `Code "${cleanCode}" visible on store page` : `Code "${cleanCode}" not found on store page`, start);
    }

    // Deal presence check
    return result(...checkDealPresence(offer, bodyText), start);

  } catch (error) {
    console.error(`[StoreVerifier] Error for offer "${offer.title}":`, error.message);
    // Return true on error to avoid accidental expiry
    return result(true, `Presence check errored — defaulting to present: ${error.message}`, start);
  } finally {
    if (context) await context.close().catch(() => {});
    const elapsed = Date.now() - start;
    console.log(`[Metrics] store-verify | "${offer.title}" | ${elapsed}ms`);
  }
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

function result(present, detail, start) {
  return { present, detail, durationMs: Date.now() - start };
}

/**
 * Checks whether a deal's key terms and discount values are still visible
 * on the page. Returns [present, detail].
 *
 * @param {object} offer
 * @param {string} bodyText
 * @returns {[boolean, string]}
 */
function checkDealPresence(offer, bodyText) {
  const title = (offer.title || '').toLowerCase();
  const body  = bodyText.toLowerCase();

  const percentMatch = title.match(/\d+%/);
  const dollarMatch  = title.match(/\$\d+/);

  if (percentMatch && !body.includes(percentMatch[0])) {
    return [false, `Deal missing discount "${percentMatch[0]}" on store page`];
  }
  if (dollarMatch && !body.includes(dollarMatch[0])) {
    return [false, `Deal missing amount "${dollarMatch[0]}" on store page`];
  }

  const stopwords = new Set([
    'the', 'this', 'that', 'with', 'from', 'your', 'store', 'online',
    'free', 'here', 'deal', 'deals', 'coupon', 'coupons',
  ]);
  const words = title
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !stopwords.has(w));

  if (words.length === 0) {
    const fallback = body.includes('sale') || body.includes('off');
    return [fallback, fallback ? 'Generic deal terms found' : 'No matching deal terms on store page'];
  }

  const matched = words.filter((w) => body.includes(w));
  const rate = matched.length / words.length;
  const present = rate >= 0.5;
  return [
    present,
    present
      ? `Deal words matched ${matched.length}/${words.length} (${Math.round(rate * 100)}%)`
      : `Deal words matched only ${matched.length}/${words.length} (${Math.round(rate * 100)}%)`,
  ];
}

async function dismissPopups(page) {
  const popupSelectors = [
    'button:has-text("Accept")',
    'button:has-text("Accept All")',
    'button:has-text("Close")',
    '.close-button',
    '.modal-close',
    '#close',
    '[aria-label="Close"]',
  ];
  for (const selector of popupSelectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.isVisible({ timeout: 800 })) {
        await locator.click({ timeout: 800 });
      }
    } catch { /* ignore — popup may not be present */ }
  }
}
