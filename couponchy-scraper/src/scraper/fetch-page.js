import { openContext } from './browser-pool.js';

/**
 * Fetches a URL using Playwright and returns both the HTML content and the
 * HTTP status code of the final (post-redirect) response.
 *
 * Returning the status allows callers to reject non-200 pages before running
 * any further processing (parse, AI extraction, etc.).
 *
 * When a shared `browser` instance is supplied (from the browser pool) the
 * function reuses it by opening an isolated context — eliminating the
 * per-request browser launch/close cycle.
 *
 * When called without a browser (standalone test scripts) it falls back to
 * launching its own Chromium instance — preserving backwards compatibility.
 *
 * @param {string} url - Target URL to fetch
 * @param {object} [options]
 * @param {import('playwright').Browser} [options.browser]  - Shared browser from pool (preferred)
 * @param {number}  [options.timeout]                       - Navigation timeout ms (default: 30000)
 * @param {string}  [options.waitUntil]                     - Playwright load state (default: 'domcontentloaded')
 * @param {number}  [options.delay]                         - Extra wait after navigation ms (default: 0)
 * @returns {Promise<{ html: string, httpStatus: number | null }>}
 */
export async function fetchPage(url, options = {}) {
  const timeout   = options.timeout   || 30000;
  const waitUntil = options.waitUntil || 'domcontentloaded';

  if (options.browser) {
    // ── Pooled path: reuse shared browser ────────────────────────────────
    let context = null;
    try {
      context = await openContext(options.browser);
      const page = await context.newPage();
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

      console.log(`[Scraper] Navigating to: ${url}`);
      let httpStatus = null;
      const response = await page.goto(url, { waitUntil, timeout });
      if (response) httpStatus = response.status();

      if (options.delay) await page.waitForTimeout(options.delay);

      const html = await page.content();
      return { html, httpStatus };
    } finally {
      if (context) await context.close().catch(() => {});
    }
  }

  // ── Standalone fallback: launch own browser ───────────────────────────────
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas', '--disable-gpu', '--window-size=1920,1080',
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    console.log(`[Scraper] Navigating to: ${url}`);
    let httpStatus = null;
    const response = await page.goto(url, { waitUntil, timeout });
    if (response) httpStatus = response.status();

    if (options.delay) await page.waitForTimeout(options.delay);
    const html = await page.content();
    await context.close();
    return { html, httpStatus };
  } catch (error) {
    console.error(`[Scraper] Error fetching URL ${url}:`, error.message);
    throw error;
  } finally {
    await browser.close();
  }
}
