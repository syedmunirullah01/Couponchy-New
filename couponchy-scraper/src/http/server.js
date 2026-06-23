import express from 'express';
import dotenv from 'dotenv';
import { runDiscoveryPipeline } from '../scraper/discover.js';
import { runValidationPipeline, runStoreVerificationPipeline } from '../scraper/validate.js';
import { supabase } from '../config/supabase.js';
import { getPoolStatus } from '../scraper/browser-pool.js';
import { getProductCacheStats } from '../scraper/product-cache.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const INTERNAL_SECRET = process.env.SCRAPER_INTERNAL_SECRET;

if (!INTERNAL_SECRET) {
  console.warn('[HTTP Server] ⚠️  SCRAPER_INTERNAL_SECRET is not set!');
}

const VALID_JOB_TYPES = ['discover', 'validate', 'store-verify'];

// ── Auth Middleware ───────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const token =
    (req.headers['x-scraper-secret'] || '').trim() ||
    (req.headers.authorization || '').replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication secret' });
  }
  if (token !== INTERNAL_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
  next();
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Root status
app.get('/', (req, res) => {
  res.status(200).json({
    name:      'Couponchy AI Scraper Microservice',
    status:    'active',
    scheduler: 'running',
    endpoints: {
      health:  'GET  /health',
      metrics: 'GET  /metrics (authenticated)',
      trigger: 'POST /trigger (authenticated)',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics / diagnostics (authenticated)
app.get('/metrics', requireAuth, (req, res) => {
  res.status(200).json({
    browserPool:  getPoolStatus(),
    productCache: getProductCacheStats(),
    timestamp:    new Date().toISOString(),
  });
});

// Trigger job (asynchronous)
app.post('/trigger', requireAuth, async (req, res) => {
  const job_type = req.body.job_type || req.body.jobType;
  const job_id   = req.body.job_id   || req.body.jobId;
  const forceAll = req.body.forceAll || req.body.force_all || false;

  if (!job_type || !VALID_JOB_TYPES.includes(job_type)) {
    return res.status(400).json({
      error: `Invalid or missing job_type. Must be one of: ${VALID_JOB_TYPES.join(', ')}.`,
    });
  }

  let activeJobId = job_id;

  if (!activeJobId) {
    try {
      const { data: job, error: jobError } = await supabase
        .from('scraper_jobs')
        .insert({ job_type, status: 'running', started_at: new Date().toISOString() })
        .select()
        .single();
      if (jobError) {
        return res.status(500).json({ error: `Failed to create job: ${jobError.message}` });
      }
      activeJobId = job.id;
    } catch (dbErr) {
      return res.status(500).json({ error: `Database error: ${dbErr.message}` });
    }
  }

  console.log(`[HTTP Server] Triggering job: type=${job_type}, id=${activeJobId}, forceAll=${forceAll}`);

  // Run asynchronously — respond immediately to prevent HTTP timeouts
  if (job_type === 'discover') {
    runDiscoveryPipeline(activeJobId)
      .then((stats) => console.log(`[HTTP Server] discover job ${activeJobId} finished:`, stats))
      .catch((err) => console.error(`[HTTP Server] discover job ${activeJobId} failed:`, err.message));

  } else if (job_type === 'store-verify') {
    runStoreVerificationPipeline(activeJobId)
      .then((stats) => console.log(`[HTTP Server] store-verify job ${activeJobId} finished:`, stats))
      .catch((err) => console.error(`[HTTP Server] store-verify job ${activeJobId} failed:`, err.message));

  } else {
    runValidationPipeline(activeJobId, forceAll)
      .then((stats) => console.log(`[HTTP Server] validate job ${activeJobId} finished:`, stats))
      .catch((err) => console.error(`[HTTP Server] validate job ${activeJobId} failed:`, err.message));
  }

  return res.status(202).json({
    success: true,
    job_id:  activeJobId,
    message: `Job ${activeJobId} (${job_type}) accepted and running in background.`,
  });
});

// ── Server startup ────────────────────────────────────────────────────────────

export function startServer() {
  app.listen(PORT, () => {
    console.log(`[HTTP Server] Scraper microservice is listening on port ${PORT}`);
  });
}
