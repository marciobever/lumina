// lib/n8n.ts
export async function triggerN8nGenerateProfile(payload: any) {
  const url = process.env.N8N_WEBHOOK_URL // defina no .env.local
  if (!url) throw new Error('N8N_WEBHOOK_URL não configurada')
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`n8n webhook falhou: ${r.status} ${text}`)
  }
  return await r.json().catch(() => ({}))
}