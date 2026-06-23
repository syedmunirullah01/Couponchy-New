/**
 * Async Worker Queue
 *
 * Processes an array of tasks with bounded concurrency. Up to `concurrency`
 * tasks run simultaneously. Each task result is annotated with timing info.
 *
 * Returns all results plus aggregate timing metrics so bottlenecks can be
 * identified without any external profiling tool.
 *
 * Usage:
 *   const { results, metrics } = await runQueue(tasks, workerFn, { concurrency: 5, label: 'validation' });
 */

/**
 * @template T
 * @template R
 * @param {T[]} tasks - Array of task inputs
 * @param {(task: T, index: number) => Promise<R>} workerFn - Async function to process one task
 * @param {{ concurrency?: number, label?: string }} [options]
 * @returns {Promise<{
 *   results: Array<{ task: T, result: R | null, error: string | null, durationMs: number }>,
 *   metrics: { label: string, total: number, succeeded: number, failed: number, minMs: number, maxMs: number, avgMs: number, totalMs: number }
 * }>}
 */
export async function runQueue(tasks, workerFn, options = {}) {
  const concurrency = options.concurrency ?? 3;
  const label = options.label ?? 'queue';

  if (tasks.length === 0) {
    return {
      results: [],
      metrics: buildMetrics(label, []),
    };
  }

  console.log(`[Queue:${label}] Starting ${tasks.length} task(s) with concurrency=${concurrency}`);

  const taskQueue = [...tasks.entries()]; // [ [index, task], ... ]
  const results = new Array(tasks.length);
  let active = 0;
  let queueIndex = 0;

  await new Promise((resolveAll) => {
    function startNext() {
      while (active < concurrency && queueIndex < taskQueue.length) {
        const [origIndex, task] = taskQueue[queueIndex++];
        active++;

        const start = Date.now();
        Promise.resolve()
          .then(() => workerFn(task, origIndex))
          .then((result) => {
            results[origIndex] = {
              task,
              result,
              error: null,
              durationMs: Date.now() - start,
            };
          })
          .catch((err) => {
            results[origIndex] = {
              task,
              result: null,
              error: err?.message ?? String(err),
              durationMs: Date.now() - start,
            };
            console.error(`[Queue:${label}] Task #${origIndex} failed: ${err?.message}`);
          })
          .finally(() => {
            active--;
            startNext();
            if (active === 0 && queueIndex >= taskQueue.length) {
              resolveAll();
            }
          });
      }
    }
    startNext();
  });

  const metrics = buildMetrics(label, results);
  console.log(
    `[Queue:${label}] Finished — ${metrics.succeeded}/${metrics.total} succeeded, ` +
    `avg ${metrics.avgMs}ms, max ${metrics.maxMs}ms, total wall-time ${metrics.totalMs}ms`
  );

  return { results, metrics };
}

// ── Internal ──────────────────────────────────────────────────────────────────

function buildMetrics(label, results) {
  const durations = results.map((r) => r.durationMs);
  const succeeded = results.filter((r) => r.error === null).length;
  const minMs = durations.length ? Math.min(...durations) : 0;
  const maxMs = durations.length ? Math.max(...durations) : 0;
  const totalMs = durations.reduce((s, d) => s + d, 0);
  const avgMs = durations.length ? Math.round(totalMs / durations.length) : 0;

  return {
    label,
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    minMs,
    maxMs,
    avgMs,
    totalMs,
  };
}
