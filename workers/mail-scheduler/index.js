// Separate Worker: scheduled delivery cannot run inside a Pages request lifecycle.
export default {
 async scheduled(_event, env) {
  if (env.MAIL_ENABLED !== 'true') return
  const call = async (action, after) => {
   const response = await fetch('https://ugabuga.co.il/api/mail', { method: 'POST', headers: { Authorization: `Bearer ${env.MAIL_CRON_SECRET}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ action, after }) })
   if (!response.ok) throw new Error(`Mail scheduler failed: ${response.status}`)
   return response.json()
  }
  let after = null, failed = 0, batches = 0
  do { const result = await call('dispatch', after); failed += result.failed; after = result.next; batches++ } while (after && batches < 40)
  await call('cleanup')
  if (after) throw new Error('Mail pilot exceeded 200 recipients per run; upgrade scheduling capacity before expanding the list')
  if (failed) throw new Error(`Mail deliveries awaiting retry: ${failed}`)
 },
}
