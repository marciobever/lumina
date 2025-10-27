// app/api/chat/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message, slug } = await req.json()

    if (!message || !slug)
      return NextResponse.json({ error: 'Faltam parâmetros' }, { status: 400 })

    // Chama o webhook do n8n
    const response = await fetch('https://n8n.seureview.com.br/webhook/assistente/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, slug }),
      cache: 'no-store',
    })

    const data = await response.json()

    return NextResponse.json({ reply: data.reply || data.response || '(sem resposta)' })
  } catch (err: any) {
    console.error('Erro no proxy chat:', err)
    return NextResponse.json({ error: 'Erro ao comunicar com o assistente' }, { status: 500 })
  }
}
