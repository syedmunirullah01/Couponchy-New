import { openContext } from './browser-pool.js';
import { getCachedProductUrl, setCachedProductUrl } from './product-cache.js';

/**
 * Layer 2 — Deep Checkout Validator
 *
 * Navigates to a product page, adds the item to the cart, proceeds to
 * checkout, and attempts to apply the coupon code — recording success or
 * failure based on page feedback.
 *
 * Key optimisation vs the old validate.js:
 *   - Accepts a shared browser from the pool (no launch/close per coupon)
 *   - Uses the product URL cache to skip homepage → product navigation
 *     for stores already processed in this run or within the cache TTL
 *   - Returns precise timing info for metrics
 *
 * @param {import('playwright').Browser} browser - Shared browser from the pool
 * @param {string} storeUrl - Store homepage / promotions URL (used as fallback)
 * @param {string} code - Coupon code to apply
 * @param {string} storeSlug - Store slug (for product cache keying)
 * @returns {Promise<{ status: 'valid'|'invalid'|'inconclusive', detail: string, durationMs: number }>}
 */
export async function validateCouponAtCheckout(browser, storeUrl, code, storeSlug) {
  const start = Date.now();
  let context = null;

  try {
    context = await openContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(12000);

    // ── Step 1: Navigate to a product page ─────────────────────────────────
    const cachedProductUrl = getCachedProductUrl(storeSlug);
    let productClicked = false;

    if (cachedProductUrl) {
      // Fast path — go directly to cached product page
      console.log(`[CheckoutValidator] Cache hit for "${storeSlug}" — navigating to ${cachedProductUrl}`);
      try {
        await page.goto(cachedProductUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        productClicked = true;
      } catch {
        // Cache entry may be stale (page removed). Fall through to discovery.
        console.warn(`[CheckoutValidator] Cached URL unreachable for "${storeSlug}". Falling back to homepage.`);
      }
    }

    if (!productClicked) {
      console.log(`[CheckoutValidator] Navigating to store: ${storeUrl}`);
      await page.goto(storeUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await dismissPopups(page);

      // Try to click a product link
      const productSelectors = [
        'a[href*="/product/"]', 'a[href*="/products/"]',
        'a[href*="/shop/"]',   'a[href*="/item/"]',
        'a[href*="/p/"]',      'a[href*="/buy/"]',
        'a[href*="/t/"]',
      ];

      for (const selector of productSelectors) {
        const locator = page.locator(selector).first();
        if (await locator.count() > 0 && await locator.isVisible({ timeout: 1000 })) {
          await locator.click();
          await page.waitForLoadState('domcontentloaded');
          productClicked = true;
          break;
        }
      }

      if (!productClicked) {
        // Broader fallback
        const fallback = page
          .locator('main a, body a')
          .filter({ hasText: /buy|shop|product|item|add|price|\$/i })
          .first();
        if (await fallback.count() > 0 && await fallback.isVisible({ timeout: 1000 })) {
          await fallback.click();
          await page.waitForLoadState('domcontentloaded');
          productClicked = true;
        }
      }

      if (!productClicked) {
        return timed('inconclusive', 'Could not navigate to a product details page', start);
      }

      // Cache the product URL we landed on for future runs
      const landedUrl = page.url();
      if (landedUrl && landedUrl !== storeUrl) {
        setCachedProductUrl(storeSlug, landedUrl);
      }
    }

    // ── Step 2: Add to cart ────────────────────────────────────────────────
    const addToCartSelectors = [
      'button:has-text("Add to Cart")',
      'button:has-text("Add to Bag")',
      'input[value="Add to Cart"]',
      'button[id*="add-to-cart"]',
      'button[class*="add-to-cart"]',
      'button:has-text("Buy Now")',
    ];

    let itemAdded = false;
    for (const selector of addToCartSelectors) {
      const locator = page.locator(selector).first();
      if (await locator.count() > 0 && await locator.isVisible({ timeout: 1000 })) {
        await locator.click();
        itemAdded = true;
        break;
      }
    }

    if (!itemAdded) {
      return timed('inconclusive', 'Could not find "Add to Cart" button', start);
    }

    await page.waitForTimeout(2000);

    // ── Step 3: Navigate to checkout / cart ───────────────────────────────
    const checkoutSelectors = [
      'a:has-text("Checkout")', 'button:has-text("Checkout")',
      'a:has-text("View Cart")', 'a[href*="/checkout"]',
      'a[href*="/cart"]',
    ];

    let checkoutVisited = false;
    for (const selector of checkoutSelectors) {
      const locator = page.locator(selector).first();
      if (await locator.count() > 0 && await locator.isVisible({ timeout: 1000 })) {
        await locator.click();
        await page.waitForLoadState('domcontentloaded');
        checkoutVisited = true;
        break;
      }
    }

    if (!checkoutVisited) {
      const origin = new URL(page.url()).origin;
      await page.goto(`${origin}/checkout`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      if (!page.url().includes('checkout') && !page.url().includes('cart')) {
        await page.goto(`${origin}/cart`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      }
    }

    // ── Step 4: Enter coupon code ─────────────────────────────────────────
    const inputSelectors = [
      'input[placeholder*="discount" i]', 'input[placeholder*="coupon" i]',
      'input[placeholder*="promo" i]',    'input[placeholder*="code" i]',
      'input[name*="discount" i]',        'input[name*="coupon" i]',
      'input[name*="promo" i]',           'input[id*="discount" i]',
      'input[id*="coupon" i]',            'input[id*="promo" i]',
    ];

    let inputField = null;
    for (const selector of inputSelectors) {
      const locator = page.locator(selector).first();
      if (await locator.count() > 0 && await locator.isVisible({ timeout: 1000 })) {
        inputField = locator;
        break;
      }
    }

    if (!inputField) {
      return timed('inconclusive', 'Could not find coupon input on checkout page', start);
    }

    await inputField.focus();
    await inputField.fill(code);

    // ── Step 5: Apply ──────────────────────────────────────────────────────
    const applySelectors = [
      'button:has-text("Apply")', 'input[value="Apply" i]',
      'button:has-text("Redeem")', 'button:has-text("Submit")',
      'button[id*="apply" i]',    'button[class*="apply" i]',
    ];

    let applied = false;
    for (const selector of applySelectors) {
      const locator = page.locator(selector).first();
      if (await locator.count() > 0 && await locator.isVisible({ timeout: 1000 })) {
        await locator.click();
        applied = true;
        break;
      }
    }

    if (!applied) {
      await inputField.press('Enter');
    }

    await page.waitForTimeout(3000);

    // ── Step 6: Read feedback ──────────────────────────────────────────────
    const errorText = await page.evaluate(() => {
      const errorRx = [/invalid/i, /expired/i, /cannot be applied/i, /not valid/i, /does not exist/i, /unknown coupon/i, /not match/i];
      const els = Array.from(document.querySelectorAll('div, span, p, label'));
      const visible = els.find(
        (el) => el.clientHeight > 0 && el.innerText?.length < 150 && errorRx.some((r) => r.test(el.innerText || ''))
      );
      return visible ? visible.innerText : null;
    });

    if (errorText) {
      console.log(`[CheckoutValidator] INVALID — "${errorText.trim()}"`);
      return timed('invalid', `Site error: ${errorText.trim()}`, start);
    }

    const success = await page.evaluate((couponCode) => {
      const body = document.body.innerText;
      const upper = couponCode.toUpperCase();
      const codeVisible = body.toUpperCase().includes(upper);
      const appliedWord = /discount applied|coupon applied|promo applied|code applied|savings/i.test(body);
      if (codeVisible && appliedWord) return true;
      const html = document.body.innerHTML;
      if (html.includes('-') && (html.includes('$') || html.includes('€') || html.includes('£'))) return true;
      return false;
    }, code);

    if (success) {
      console.log(`[CheckoutValidator] VALID — code "${code}" applied successfully`);
      return timed('valid', 'Discount verified successfully', start);
    }

    console.log(`[CheckoutValidator] INCONCLUSIVE — no clear feedback for code "${code}"`);
    return timed('inconclusive', 'No clear success or error message detected after applying', start);

  } catch (error) {
    console.error(`[CheckoutValidator] Error for code "${code}":`, error.message);
    return timed('inconclusive', `Execution error: ${error.message}`, start);
  } finally {
    if (context) await context.close().catch(() => {});
    const elapsed = Date.now() - start;
    console.log(`[Metrics] checkout | code "${code}" | store "${storeSlug}" | ${elapsed}ms`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timed(status, detail, start) {
  return { status, detail, durationMs: Date.now() - start };
}

async function dismissPopups(page) {
  const selectors = [
    'button:has-text("Accept")', 'button:has-text("Accept All")',
    'button:has-text("Close")', '.close-button', '.modal-close',
    '#close', '[aria-label="Close"]',
  ];
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.isVisible({ timeout: 800 })) {
        await locator.click({ timeout: 800 });
      }
    } catch { /* ignore */ }
  }
}
