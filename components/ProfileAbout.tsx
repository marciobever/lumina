// components/ProfileAbout.tsx
'use client'

import { useMemo, useState } from 'react'

type Props = {
  text?: string | null
  maxChars?: number
  tags?: string[]
}

function normalizeText(raw?: string | null) {
  if (!raw) return ''
  // trata \n vindo literal e normaliza CRLF
  return raw.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim()
}

export default function ProfileAbout({ text, maxChars = 650, tags = [] }: Props) {
  const [expanded, setExpanded] = useState(false)
  const clean = useMemo(() => normalizeText(text), [text])

  // separa em blocos por linhas em branco duplas
  const blocks = useMemo(() => {
    if (!clean) return []
    return clean
      .split(/\n{2,}/)
      .map(b => b.trim())
      .filter(Boolean)
  }, [clean])

  // renderização: lista com "-" no começo vira <ul>, senão <p>
  const renderBlock = (b: string, i: number) => {
    const lines = b.split('\n')
    const isList = lines.every(l => /^-\s+/.test(l)) && lines.length > 1

    if (i === 0 && !isList) {
      // primeiro parágrafo com dropcap
      return (
        <p key={i} className="dropcap text-white/90 leading-relaxed">
          {b}
        </p>
      )
    }

    if (isList) {
      const items = lines.map(l => l.replace(/^-\s+/, '').trim()).filter(Boolean)
      return (
        <ul key={i} className="list-disc pl-5 space-y-2 text-white/85">
          {items.map((li, k) => <li key={k}>{li}</li>)}
        </ul>
      )
    }

    return <p key={i} className="text-white/85 leading-relaxed">{b}</p>
  }

  // preview “ver mais/menos”
  const textForClamp = useMemo(() => {
    if (expanded) return blocks
    let acc = ''
    const out: string[] = []
    for (const b of blocks) {
      const next = acc ? `${acc}\n\n${b}` : b
      if (next.length <= maxChars || out.length === 0) {
        out.push(b)
        acc = next
      } else {
        break
      }
    }
    return out
  }, [blocks, expanded, maxChars])

  if (!clean) {
    return (
      <div className="card px-6 md:px-8 py-7 md:py-9">
        <h2 className="text-2xl font-semibold text-white/95 mb-4">Sobre</h2>
        <p className="text-white/75">
          Perfil editorial focado em nichos fortes de negócio e conteúdo orientado a performance.
        </p>
        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {tags.filter(Boolean).slice(0, 12).map((t) => (
              <li
                key={t}
                className="px-2.5 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-white/75"
              >
                #{t}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="space-y-4 reading-measure reading-loose hyphens-auto">
        {textForClamp.map(renderBlock)}
      </div>

      {blocks.length > textForClamp.length && (
        <div className="mt-5">
          <button
            className="btn btn-ghost border border-white/15 px-4 py-2 text-sm"
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'Mostrar menos' : 'Mostrar mais'}
          </button>
        </div>
      )}

      {tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {tags.filter(Boolean).slice(0, 12).map((t) => (
            <li
              key={t}
              className="px-2.5 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-white/75"
            >
              #{t}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
