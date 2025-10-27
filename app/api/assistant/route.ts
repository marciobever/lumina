// app/api/assistant/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const N8N_WEBHOOK =
  process.env.N8N_ASSISTANT_WEBHOOK ??
  'https://n8n.seureview.com.br/webhook/assistente/chat'

// ajuda a aceitar payload legado (array messages) sem duplicar
function unwrapContent(raw: unknown): string {
  const s = (raw ?? '').toString().trim()
  if (!s) return ''
  try {
    const j = JSON.parse(s)
    if (typeof j === 'string') return j
    if (j && typeof j === 'object') {
      // formatos comuns que você recebeu
      if (typeof (j as any).output === 'string') return (j as any).output
      if (Array.isArray(j) && (j[0] as any)?.output) return String((j[0] as any).output)
      if (typeof (j as any).message === 'string') return (j as any).message
      if (typeof (j as any).text === 'string') return (j as any).text
    }
  } catch { /* não era json */ }
  // tenta casar {output:"..."} simples
  const mArr = s.match(/^\s*\[\s*{?"?output"?\s*:\s*"([^]*)"?}?\s*\]\s*$/s)
  if (mArr?.[1]) return mArr[1].trim()
  const mObj = s.match(/^\s*{?"?output"?\s*:\s*"([^]*)"?}?\s*$/s)
  if (mObj?.[1]) return mObj[1].trim()
  return s
}

function lastUserText(messages: any[]): string {
  if (!Array.isArray(messages)) return ''
  // mantém só user e pega a última
  const cleaned = messages
    .map(m => {
      const role = String(m?.role || '').toLowerCase()
      if (role !== 'user') return null
      const content = unwrapContent(m?.content)
      return content ? { role, content } : null
    })
    .filter(Boolean) as { role: 'user'; content: string }[]
  return (cleaned.at(-1)?.content || '').trim()
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json().catch(() => ({}))

    // 1) mensagem do usuário (modelo novo) OU legado
    const message =
      (typeof body?.message === 'string' && body.message.trim()) ||
      lastUserText(body?.messages) ||
      'Olá!'

    // 2) slug (vem no context do front)
    const slug =
      String(body?.context?.slug || body?.slug || '').trim()

    // 3) opcional: nome da modelo já vindo do front (pra pular Postgres no n8n)
    const display_name =
      String(body?.context?.display_name || body?.display_name || '').trim() || undefined

    // 4) session id estável (cookie > header IP > fallback)
    const sessionId =
      req.cookies.get('lumina_sid')?.value ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for') ||
      'anon'

    // 🚚 pacote mínimo para o n8n
    const payload = {
      message,
      context: {
        slug,
        // se vier o nome, o n8n usa e você pode pular o Postgres
        display_name,
      },
      session: { id: sessionId },
      // nada de system_prompt vindo do cliente
    }

    const upstream = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      // @ts-ignore (Edge)
      keepalive: true,
    })

    const text = await upstream.text()
    const ct = upstream.headers.get('content-type') || ''

    if (!upstream.ok) {
      return new NextResponse(
        `n8n upstream error (${upstream.status}): ${text || 'sem corpo'}`,
        { status: 502, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      )
    }

    return new NextResponse(text, {
      status: 200,
      headers: {
        'content-type': ct.includes('application/json')
          ? 'application/json; charset=utf-8'
          : 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  } catch (e: any) {
    return new NextResponse(
      `assistant route error: ${e?.message || 'unknown'}`,
      { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    )
  }
}