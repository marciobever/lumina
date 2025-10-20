'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type ChatMsg = { role: 'user'|'assistant'|'system'; content: string }
type Props = {
  context?: {
    slug?: string
    profile?: any
    [k: string]: any
  }
  suggestions?: string[]
}

export default function ChatPanel({ context, suggestions = [] }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Oi! Como posso te ajudar hoje?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Fallback: captura ?slug= da URL caso a prop venha vazia
  const urlSlug = useMemo(() => {
    if (typeof window === 'undefined') return ''
    try {
      const u = new URL(window.location.href)
      return (u.searchParams.get('slug') || '').trim()
    } catch {
      return ''
    }
  }, [])

  // Contexto efetivo SEMPRE com slug
  const effectiveContext = useMemo(() => {
    const c = context || {}
    const slug = (c.slug || urlSlug || '').trim()
    const profile = c.profile || null
    return { ...c, slug, profile }
  }, [context, urlSlug])

  // System prompt básico – pode ser sobrescrito no backend se quiser
  const system_prompt = useMemo(() => {
    const name = effectiveContext?.profile?.display_name || 'a especialista'
    return [
      'Você é um assistente editorial útil e objetivo (PG-13), em pt-BR.',
      'Adapte o tom à persona do perfil e mantenha respostas claras, envolventes e respeitosas.',
      `Persona atual: ${name}.`,
      'Sugira próximos passos, materiais e CTAs quando fizer sentido.'
    ].join('\n')
  }, [effectiveContext])

  // auto scroll
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    if (!text.trim() || loading) return

    const next = [...messages, { role: 'user', content: text.trim() }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      // Limpa histórico (remove vazias e limita tamanho)
      const cleanHistory = next
        .filter(m => m && typeof m.content === 'string' && m.content.trim())
        .slice(-20)

      if (!effectiveContext.slug) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Não consegui identificar o perfil. Abra o assistente pelo botão do próprio perfil para carregar o contexto.'
        }])
        return
      }

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 🔑 Pacote enviado: messages + context (com slug garantido) + system_prompt
        body: JSON.stringify({
          messages: cleanHistory,
          context: effectiveContext,
          system_prompt
        })
      })
      if (!res.ok) throw new Error('Falha ao consultar o assistente')

      // Streaming simples (fallback para texto inteiro)
      const reader = res.body?.getReader()
      let assistantText = ''
      if (reader) {
        const decoder = new TextDecoder()
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          assistantText += decoder.decode(value)
          setMessages(prev => {
            const lastIsAssistant = prev[prev.length - 1]?.role === 'assistant'
            if (lastIsAssistant) {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: assistantText }
              return updated
            }
            return [...prev, { role: 'assistant', content: assistantText }]
          })
        }
      } else {
        const txt = await res.text()
        setMessages(prev => [...prev, { role: 'assistant', content: txt }])
      }
    } catch (e:any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, tive um problema. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* caixa de mensagens */}
      <div ref={boxRef} className="h-[520px] overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user'
              ? 'ml-auto max-w-[85%] rounded-2xl bg-white/10 border border-white/15 px-3 py-2'
              : 'mr-auto max-w-[85%] rounded-2xl bg-white/5 border border-white/10 px-3 py-2'}
          >
            <div className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed">
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="mr-auto max-w-[85%] rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-white/70 text-sm">
            digitando…
          </div>
        )}
      </div>

      {/* sugestões */}
      {suggestions.length > 0 && (
        <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-t border-white/10">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="pc-chip pc-chip-dim hover:bg-white/[0.12]"
              onClick={() => send(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <form
        className="p-3 border-t border-white/10 flex gap-2"
        onSubmit={e => { e.preventDefault(); send(input) }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Digite sua pergunta…"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-white/90 outline-none"
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>Enviar</button>
      </form>
    </div>
  )
}