-- ============================================================
-- COUPONCHY — Full Supabase Schema
-- Run this entire file in: Supabase → SQL Editor → Run
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT DEFAULT '',
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'social-media')),
  permissions TEXT[] DEFAULT '{}',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── STORES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL,
  slug                      TEXT UNIQUE NOT NULL,
  category                  TEXT NOT NULL,
  category_slug             TEXT,
  country_code              TEXT DEFAULT 'US',
  logo_image                TEXT DEFAULT '',
  logo_text                 TEXT DEFAULT '',
  affiliate_link            TEXT DEFAULT '',
  logo_class_name           TEXT DEFAULT '',
  description               TEXT DEFAULT '',
  content_intro_title       TEXT DEFAULT '',
  content_intro_paragraph1  TEXT DEFAULT '',
  content_intro_paragraph2  TEXT DEFAULT '',
  content_why_items_text    TEXT DEFAULT '',
  content_outro             TEXT DEFAULT '',
  faq1_question             TEXT DEFAULT '',
  faq1_answer               TEXT DEFAULT '',
  faq2_question             TEXT DEFAULT '',
  faq2_answer               TEXT DEFAULT '',
  faq3_question             TEXT DEFAULT '',
  faq3_answer               TEXT DEFAULT '',
  trust_status              TEXT DEFAULT 'Active' CHECK (trust_status IN ('Verified','Trusted','Pending','Active')),
  is_featured               BOOLEAN DEFAULT false,
  hero_image                TEXT DEFAULT '',
  rating                    TEXT DEFAULT '4.7 (0 reviews)',
  offers_count              INTEGER DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- ── OFFERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT DEFAULT '',
  type              TEXT DEFAULT 'Coupon' CHECK (type IN ('Coupon','Deal')),
  store_slug        TEXT NOT NULL,
  store_name        TEXT NOT NULL,
  source            TEXT DEFAULT 'Manual',
  expiry_date       TEXT DEFAULT '',
  status            TEXT DEFAULT 'Active',
  code              TEXT DEFAULT '',
  affiliate_link    TEXT DEFAULT '',
  cta_label         TEXT DEFAULT '',
  -- Scraper-specific columns
  validated_at      TIMESTAMPTZ,
  validation_status TEXT DEFAULT 'unchecked' CHECK (validation_status IN ('unchecked','pending','valid','invalid')),
  scraped_at        TIMESTAMPTZ,
  source_url        TEXT DEFAULT '',
  unchecked_count   INTEGER DEFAULT 0,
  is_sitewide       BOOLEAN DEFAULT false,
  -- Community validation columns
  success_count     INTEGER DEFAULT 0,
  failure_count     INTEGER DEFAULT 0,
  success_rate      INTEGER DEFAULT 0,
  last_worked_at    TIMESTAMPTZ,
  last_failed_at    TIMESTAMPTZ,
  last_verified_at  TIMESTAMPTZ,
  store_verified    BOOLEAN DEFAULT false,
  checkout_verified BOOLEAN DEFAULT false,
  is_exclusive      BOOLEAN DEFAULT false,
  is_featured       BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── EVENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  start_date  TEXT DEFAULT '',
  end_date    TEXT DEFAULT '',
  is_active   BOOLEAN DEFAULT true,
  image       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT DEFAULT '',
  description    TEXT DEFAULT '',
  image          TEXT DEFAULT '',
  price          TEXT DEFAULT '',
  original_price TEXT DEFAULT '',
  cta_label      TEXT DEFAULT 'Shop Now',
  product_url    TEXT DEFAULT '',
  store_slug     TEXT DEFAULT '',
  store_name     TEXT DEFAULT '',
  status         TEXT DEFAULT 'Active',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ── SETTINGS (single-row JSONB) ──────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id   INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'
);
-- Enforce single row
CREATE UNIQUE INDEX IF NOT EXISTS settings_single_row ON settings ((id));

-- ── SCRAPER TARGETS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scraper_targets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug       TEXT NOT NULL,
  store_name       TEXT NOT NULL,
  target_url       TEXT NOT NULL,
  is_enabled       BOOLEAN DEFAULT true,
  use_ai           BOOLEAN DEFAULT true,
  coupon_selector  TEXT DEFAULT '',
  title_selector   TEXT DEFAULT '',
  code_selector    TEXT DEFAULT '',
  desc_selector    TEXT DEFAULT '',
  last_scraped_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── SCRAPER JOBS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scraper_jobs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type           TEXT NOT NULL CHECK (job_type IN ('discover','validate')),
  status             TEXT DEFAULT 'running' CHECK (status IN ('running','completed','failed')),
  started_at         TIMESTAMPTZ DEFAULT now(),
  completed_at       TIMESTAMPTZ,
  stores_processed   INTEGER DEFAULT 0,
  offers_found       INTEGER DEFAULT 0,
  offers_inserted    INTEGER DEFAULT 0,
  offers_validated   INTEGER DEFAULT 0,
  offers_expired     INTEGER DEFAULT 0,
  error_message      TEXT DEFAULT ''
);

-- ── SCRAPER LOGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scraper_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID REFERENCES scraper_jobs(id) ON DELETE CASCADE,
  store_slug  TEXT DEFAULT '',
  offer_title TEXT DEFAULT '',
  offer_code  TEXT DEFAULT '',
  action      TEXT DEFAULT '' CHECK (action IN ('inserted','duplicate_skipped','validated_ok','validated_fail','expired','')),
  detail      TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── OFFER FEEDBACK ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offer_feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id    UUID REFERENCES offers(id) ON DELETE CASCADE,
  ip_address  TEXT NOT NULL,
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('success', 'failure')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── INDEXES (for query performance) ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_offers_store_slug       ON offers(store_slug);
CREATE INDEX IF NOT EXISTS idx_offers_status           ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_validation_status ON offers(validation_status);
CREATE INDEX IF NOT EXISTS idx_stores_slug             ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_category_slug    ON stores(category_slug);
CREATE INDEX IF NOT EXISTS idx_stores_country_code     ON stores(country_code);
CREATE INDEX IF NOT EXISTS idx_scraper_logs_job_id     ON scraper_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_scraper_targets_slug    ON scraper_targets(store_slug);
CREATE INDEX IF NOT EXISTS idx_offer_feedback_lookup   ON offer_feedback(offer_id, ip_address, created_at);

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────
-- Disable RLS on all tables — our server uses service_role key which bypasses RLS.
-- The service_role key is only used server-side, never exposed to browser.
ALTER TABLE users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores         DISABLE ROW LEVEL SECURITY;
ALTER TABLE offers         DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories     DISABLE ROW LEVEL SECURITY;
ALTER TABLE events         DISABLE ROW LEVEL SECURITY;
ALTER TABLE products       DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings       DISABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_jobs   DISABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_logs   DISABLE ROW LEVEL SECURITY;
ALTER TABLE offer_feedback DISABLE ROW LEVEL SECURITY;

