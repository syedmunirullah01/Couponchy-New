/**
 * Source Quality Validator
 *
 * Runs a strict multi-layer quality gate on every scraped page BEFORE
 * any content is sent to Gemini for AI extraction.
 *
 * Checks performed (in order):
 *   1. HTTP status — reject anything that isn't 200
 *   2. Error-page detection — reject pages with known 404 / not-found text patterns
 *   3. Merchant name match — page must mention the target store name (or a close variant)
 *   4. Coupon content signal — page must contain at least one coupon/deal keyword
 *
 * A source that fails ANY check is rejected with a reason string.
 * No AI calls are made for rejected sources.
 */

// ── 1. HTTP Status ────────────────────────────────────────────────────────────

/**
 * Returns true if the HTTP status code indicates a successful response.
 *
 * @param {number|null} httpStatus
 * @returns {boolean}
 */
export function isStatusOk(httpStatus) {
  return typeof httpStatus === 'number' && httpStatus >= 200 && httpStatus < 300;
}

// ── 2. Error-page patterns ────────────────────────────────────────────────────

/**
 * Common patterns that indicate the page is an error, 404, or invalid listing.
 * Matched case-insensitively against the full visible page text.
 */
const ERROR_PAGE_PATTERNS = [
  // Generic HTTP error indicators
  /\b404\b/,
  /\b403\b/,
  /\b500\b/,

  // "Not found" variants
  /page\s+not\s+found/i,
  /page\s+doesn['']t\s+exist/i,
  /this\s+page\s+doesn['']t\s+exist/i,
  /page\s+does\s+not\s+exist/i,
  /the\s+page\s+you.{0,30}not\s+found/i,
  /we\s+couldn['']t\s+find\s+that\s+page/i,
  /sorry,\s+we\s+can['']t\s+find/i,
  /content\s+not\s+found/i,

  // Merchant / store not found
  /merchant\s+not\s+found/i,
  /store\s+not\s+found/i,
  /brand\s+not\s+found/i,
  /retailer\s+not\s+found/i,
  /no\s+coupons?\s+found\s+for/i,
  /we\s+don['']t\s+have\s+coupons?\s+for/i,
  /no\s+deals?\s+found\s+for/i,

  // Removed / taken down
  /this\s+merchant\s+has\s+been\s+removed/i,
  /this\s+store\s+has\s+been\s+removed/i,
  /this\s+listing\s+has\s+been\s+removed/i,
  /no\s+longer\s+available/i,
  /account\s+suspended/i,

  // Generic error
  /something\s+went\s+wrong/i,
  /internal\s+server\s+error/i,
  /service\s+unavailable/i,
  /access\s+denied/i,
  /you\s+don['']t\s+have\s+permission/i,
  /forbidden/i,

  // Redirect / login walls (no actual content)
  /please\s+log\s+in\s+to\s+continue/i,
  /sign\s+in\s+to\s+view/i,
];

/**
 * Detects whether the page body text is an error or not-found page.
 *
 * Scans only the first 3,000 characters where error messages typically
 * appear — avoids false positives from lengthy valid pages that happen
 * to mention "404" in an article body.
 *
 * @param {string} bodyText - Visible page text (not raw HTML)
 * @returns {{ isError: boolean, reason: string | null }}
 */
export function detectErrorPage(bodyText) {
  // Only scan the first ~3k chars — error messages appear near the top
  const sample = bodyText.slice(0, 3000);

  for (const pattern of ERROR_PAGE_PATTERNS) {
    if (pattern.test(sample)) {
      return { isError: true, reason: `Error-page pattern matched: "${pattern.toString()}"` };
    }
  }
  return { isError: false, reason: null };
}

// ── 3. Merchant name match ────────────────────────────────────────────────────

/**
 * Verifies that the page text mentions the target store name (or a close
 * variant). Prevents pages for a completely different merchant from being
 * scraped against the wrong store.
 *
 * Strategy:
 *  - Normalise both name and body text (lowercase, collapse whitespace)
 *  - Split name into significant words (length ≥ 3, no stopwords)
 *  - Require at least one significant word to appear in the page
 *
 * A permissive 1-word match is intentional — aggregators often abbreviate
 * store names, so requiring full name match would cause too many false rejects.
 *
 * @param {string} storeName - Expected store name
 * @param {string} bodyText  - Full visible page text
 * @returns {{ matches: boolean, reason: string }}
 */
export function merchantNameMatches(storeName, bodyText) {
  if (!storeName) return { matches: true, reason: 'No store name to check' };

  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'from', 'store', 'shop', 'online',
    'official', 'site', 'website', 'corp', 'inc', 'llc', 'ltd',
  ]);

  const normalise = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  const nameNorm = normalise(storeName);
  const bodyNorm = normalise(bodyText.slice(0, 20000)); // cap for speed

  // Try full name first
  if (bodyNorm.includes(nameNorm)) {
    return { matches: true, reason: `Full store name "${storeName}" found on page` };
  }

  // Try significant words
  const words = nameNorm.split(' ').filter((w) => w.length >= 3 && !stopwords.has(w));
  if (words.length === 0) {
    return { matches: true, reason: 'Store name has no significant words to check' };
  }

  const matched = words.filter((w) => bodyNorm.includes(w));
  if (matched.length > 0) {
    return {
      matches: true,
      reason: `Store word(s) "${matched.join(', ')}" found on page`,
    };
  }

  return {
    matches: false,
    reason: `Store name "${storeName}" not found on page (checked words: ${words.join(', ')})`,
  };
}

// ── 4. Coupon content signal ──────────────────────────────────────────────────

/**
 * Minimum signals that indicate a page actually contains coupon/deal content.
 * Must find at least MIN_SIGNALS different matches.
 */
const COUPON_SIGNALS = [
  /\bcoupon\b/i,
  /\bpromo\b/i,
  /\bpromo\s+code\b/i,
  /\bdiscount\b/i,
  /\bvoucher\b/i,
  /\bdeal\b/i,
  /\bsale\b/i,
  /\boff\b/i,
  /\bsave\b/i,
  /\bcode\b/i,
  /\bfree\s+shipping\b/i,
  /\bcashback\b/i,
  /\b\d+%\s+off\b/i,
  /\$\d+\s+off\b/i,
];

const MIN_SIGNALS = 2; // at least 2 different signals must match

/**
 * Checks whether the page contains enough coupon/deal content signals
 * to justify sending to Gemini for extraction.
 *
 * @param {string} bodyText
 * @returns {{ hasCouponContent: boolean, reason: string, signalsFound: number }}
 */
export function hasCouponContent(bodyText) {
  const sample = bodyText.slice(0, 50000);
  const matched = COUPON_SIGNALS.filter((p) => p.test(sample));

  if (matched.length >= MIN_SIGNALS) {
    return {
      hasCouponContent: true,
      reason: `${matched.length} coupon signal(s) found`,
      signalsFound: matched.length,
    };
  }

  return {
    hasCouponContent: false,
    reason: `Only ${matched.length}/${MIN_SIGNALS} required coupon signal(s) found`,
    signalsFound: matched.length,
  };
}

// ── Main gate ─────────────────────────────────────────────────────────────────

/**
 * Runs all quality checks on a fetched source page. Returns a detailed
 * result object. If `ok` is false, the source must be skipped.
 *
 * @param {{
 *   httpStatus:  number | null,
 *   bodyText:    string,
 *   html:        string,
 *   sourceUrl:   string,
 *   sourceName:  string,
 *   storeName:   string,
 * }} params
 * @returns {{
 *   ok:       boolean,
 *   reason:   string | null,
 *   checks:   object,
 * }}
 */
export function validateSource({ httpStatus, bodyText, sourceUrl, sourceName, storeName }) {
  const checks = {};

  // ── Check 1: HTTP status ──
  checks.httpStatus = {
    pass: isStatusOk(httpStatus),
    value: httpStatus,
    reason: isStatusOk(httpStatus)
      ? `HTTP ${httpStatus} OK`
      : `HTTP ${httpStatus ?? 'unknown'} — non-200 response`,
  };
  if (!checks.httpStatus.pass) {
    return { ok: false, reason: checks.httpStatus.reason, checks };
  }

  // ── Check 2: Error-page detection ──
  const errorCheck = detectErrorPage(bodyText);
  checks.errorPage = {
    pass: !errorCheck.isError,
    reason: errorCheck.reason || 'No error-page patterns detected',
  };
  if (!checks.errorPage.pass) {
    return { ok: false, reason: checks.errorPage.reason, checks };
  }

  // ── Check 3: Merchant name match ──
  const nameCheck = merchantNameMatches(storeName, bodyText);
  checks.merchantName = {
    pass: nameCheck.matches,
    reason: nameCheck.reason,
  };
  if (!checks.merchantName.pass) {
    return { ok: false, reason: checks.merchantName.reason, checks };
  }

  // ── Check 4: Coupon content signal ──
  const contentCheck = hasCouponContent(bodyText);
  checks.couponContent = {
    pass: contentCheck.hasCouponContent,
    reason: contentCheck.reason,
    signalsFound: contentCheck.signalsFound,
  };
  if (!checks.couponContent.pass) {
    return { ok: false, reason: checks.couponContent.reason, checks };
  }

  return { ok: true, reason: null, checks };
}
