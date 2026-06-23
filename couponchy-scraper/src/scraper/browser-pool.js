import { chromium } from 'playwright';

/**
 * Singleton Playwright Browser Pool
 *
 * Maintains a fixed number of Chromium browser instances that are shared
 * across all concurrent workers. Workers acquire a browser, open an isolated
 * context, do their work, close the context, then release the browser back.
 *
 * This eliminates the cost of launching and closing a new browser for every
 * single URL fetch or coupon validation — which becomes catastrophic at scale.
 *
 * Configuration (env vars):
 *   BROWSER_POOL_SIZE  — number of Chromium instances to keep alive (default: 3)
 */

const POOL_SIZE = parseInt(process.env.BROWSER_POOL_SIZE || '3', 10);

const LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-accelerated-2d-canvas',
  '--window-size=1280,800',
];

const DEFAULT_CONTEXT_OPTIONS = {
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
};

// ── Pool State ────────────────────────────────────────────────────────────────

/** @type {Array<{ browser: import('playwright').Browser, busy: boolean }>} */
let pool = [];
let initialized = false;
let shutdownRegistered = false;

/** Queue of { resolve } callbacks waiting for a free browser slot */
const waiters = [];

// ── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Launches a single Chromium browser and adds it to the pool.
 */
async function launchOne(index) {
  const browser = await chromium.launch({ headless: true, args: LAUNCH_ARGS });
  pool[index] = { browser, busy: false };
  console.log(`[BrowserPool] Instance #${index + 1} launched.`);
  return browser;
}

/**
 * Wakes up the next waiter in the queue if a browser just became free.
 */
function notifyNextWaiter() {
  if (waiters.length === 0) return;
  const freeSlot = pool.findIndex((slot) => !slot.busy);
  if (freeSlot === -1) return;
  const { resolve } = waiters.shift();
  pool[freeSlot].busy = true;
  resolve({ browser: pool[freeSlot].browser, slotIndex: freeSlot });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Initializes the browser pool by launching POOL_SIZE Chromium instances.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function initBrowserPool() {
  if (initialized) return;
  initialized = true;
  console.log(`[BrowserPool] Initializing pool with ${POOL_SIZE} browser instance(s)...`);
  await Promise.all(Array.from({ length: POOL_SIZE }, (_, i) => launchOne(i)));
  console.log(`[BrowserPool] Pool ready — ${POOL_SIZE} browser(s) available.`);

  if (!shutdownRegistered) {
    shutdownRegistered = true;
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, async () => {
        console.log(`[BrowserPool] Received ${signal}. Closing all browser instances...`);
        await closeBrowserPool();
        process.exit(0);
      });
    }
  }
}

/**
 * Acquires a browser from the pool, waiting if all are currently busy.
 *
 * @returns {Promise<{ browser: import('playwright').Browser, slotIndex: number }>}
 */
export function acquireBrowser() {
  if (!initialized) {
    throw new Error('[BrowserPool] Pool is not initialized. Call initBrowserPool() first.');
  }

  const freeSlot = pool.findIndex((slot) => !slot.busy);
  if (freeSlot !== -1) {
    pool[freeSlot].busy = true;
    return Promise.resolve({ browser: pool[freeSlot].browser, slotIndex: freeSlot });
  }

  // All browsers are busy — queue the caller
  return new Promise((resolve) => {
    waiters.push({ resolve });
  });
}

/**
 * Returns a browser slot back to the pool and wakes up the next waiter.
 *
 * @param {number} slotIndex - The index returned by acquireBrowser()
 */
export function releaseBrowser(slotIndex) {
  if (pool[slotIndex]) {
    pool[slotIndex].busy = false;
  }
  notifyNextWaiter();
}

/**
 * Opens a new isolated browser context on the given browser instance.
 * The context is configured with a standard user-agent and viewport.
 *
 * @param {import('playwright').Browser} browser
 * @param {object} [overrides] - Optional context option overrides
 * @returns {Promise<import('playwright').BrowserContext>}
 */
export async function openContext(browser, overrides = {}) {
  return browser.newContext({ ...DEFAULT_CONTEXT_OPTIONS, ...overrides });
}

/**
 * Closes all browser instances and resets the pool.
 * Called automatically on SIGINT/SIGTERM, but can also be called manually.
 */
export async function closeBrowserPool() {
  await Promise.allSettled(pool.map(({ browser }) => browser.close()));
  pool = [];
  initialized = false;
  console.log('[BrowserPool] All browser instances closed.');
}

/**
 * Returns the current pool status snapshot (useful for health checks / metrics).
 *
 * @returns {{ size: number, busy: number, free: number, waiting: number }}
 */
export function getPoolStatus() {
  const busy = pool.filter((s) => s.busy).length;
  return {
    size: pool.length,
    busy,
    free: pool.length - busy,
    waiting: waiters.length,
  };
}
