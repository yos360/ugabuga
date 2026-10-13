export function prerenderConcurrency(value = '6') {
  const concurrency = Number(value)
  if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 32) {
    throw new Error('PRERENDER_CONCURRENCY must be an integer from 1 to 32')
  }
  return concurrency
}

// Reuse one tab per worker, and drain every worker before closing the browser.
// The render callback handles per-path failures according to each pass's policy.
export async function renderPagePool(context, paths, concurrency, render) {
  let next = 0
  const workers = await Promise.allSettled(Array.from({ length: Math.min(concurrency, paths.length) }, async () => {
    const page = await context.newPage()
    try {
      while (next < paths.length) {
        const index = next++
        await render(page, paths[index], index)
      }
    } finally {
      await page.close()
    }
  }))
  const errors = workers.filter(worker => worker.status === 'rejected').map(worker => worker.reason)
  if (errors.length) throw new AggregateError(errors, 'Prerender worker failed')
}
