'use client'

import { useState, useMemo } from 'react'
import { slugify } from '@/lib/slugify'

type Payload = {
  display_name: string
  concept: string
  sector: string
  city?: string
  slug: string
  tags?: string[]
}

export default function NewProfileForm({ onDone }: { onDone?: () => void }) {
  const [displayName, setDisplayName] = useState('')
  const [concept, setConcept] = useState('')
  const [sector, setSector] = useState('Finanças')
  const [city, setCity] = useState('')
  const [slugManual, setSlugManual] = useState('')
  const [tags, setTags] = useState<string>('')

  const slugAuto = useMemo(() => slugify(displayName), [displayName])
  const slug = slugManual?.trim() ? slugify(slugManual) : slugAuto

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  // 1) Usa env; 2) fallback pro teu endpoint real
  const webhook =
    process.env.NEXT_PUBLIC_N8N_LUMINA_CREATE ||
    'https://n8n.seureview.com.br/webhook/lumina/create-profile'

  const canSubmit =
    !!webhook && !!displayName.trim() && !!concept.trim() && !!sector.trim() && !!slug.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOkMsg(null)

    if (!canSubmit) {
      setError('Preencha nome, conceito, categoria e slug (ou configure o webhook).')
      return
    }

    const payload: Payload = {
      display_name: displayName.trim(),
      concept: concept.trim(),
      sector: sector.trim(),
      city: city.trim() || undefined,
      slug,
      tags: tags
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    }

    setLoading(true)
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // n8n normalmente responde 200/201/202; tratamos qualquer 2xx como ok
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `Falha no webhook: HTTP ${res.status}`)
      }

      setOkMsg('Perfil enviado para geração no n8n ✅')
      setDisplayName('')
      setConcept('')
      setCity('')
      setTags('')
      setSlugManual('')
      onDone?.()
    } catch (err: any) {
      setError(err?.message || 'Falha ao enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/80">Nome</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="Ex.: Camila Matos"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/80">Slug</span>
          <input
            value={slugManual}
            onChange={(e) => setSlugManual(e.target.value)}
            className="input"
            placeholder={slugAuto || 'camila-matos'}
          />
          <span className="text-xs text-white/50">Prévia: <code>{slug || '(vazio)'}</code></span>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/80">Conceito (tema do perfil)</span>
        <input
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="input"
          placeholder="Ex.: Renda passiva para autônomas com FIIs"
          required
        />
        <span className="text-xs text-white/50">
          Use palavras-chave valiosas naturalmente (ex.: “investimentos”, “renda passiva”, “FIIs”, “cartão de crédito”).
        </span>
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/80">Categoria</span>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="input"
          >
            <option>Finanças</option>
            <option>Saúde e Bem-estar</option>
            <option>Carreira e Negócios</option>
            <option>Relacionamentos</option>
            <option>Estilo de Vida</option>
            <option>Sexualidade e Corpo</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/80">Cidade (opcional)</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
            placeholder="Ex.: São Paulo"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/80">Tags (opcional, separadas por vírgula)</span>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="input"
          placeholder="investimentos, renda-passiva, planejamento"
        />
      </label>

      {!process.env.NEXT_PUBLIC_N8N_LUMINA_CREATE && (
        <p className="text-xs text-amber-300/90">
          Usando fallback do webhook: <code>{webhook}</code>
        </p>
      )}

      {error && <p className="text-rose-400 text-sm">{error}</p>}
      {okMsg && <p className="text-emerald-400 text-sm">{okMsg}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading || !canSubmit} className="btn btn-primary px-4 py-2">
          {loading ? 'Enviando…' : 'Enviar para n8n'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setDisplayName(''); setConcept(''); setCity(''); setTags(''); setSlugManual('')
            setError(null); setOkMsg(null)
          }}
          className="btn px-4 py-2"
        >
          Limpar
        </button>
      </div>
    </form>
  )
}