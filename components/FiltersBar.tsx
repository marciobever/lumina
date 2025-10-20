'use client'
import { useState } from 'react'

const SECTORS = [
  { id: 'financas', label: 'Finanças' },
  { id: 'arquitetura', label: 'Arquitetura' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'saude', label: 'Saúde' },
  { id: 'juridico', label: 'Jurídico' },
  { id: 'educacao', label: 'Educação' },
  { id: 'imobiliario', label: 'Imobiliário' },
  { id: 'estetica', label: 'Estética' },
]

export default function FiltersBar() {
  const [q, setQ] = useState('')
  const [sector, setSector] = useState<string | null>(null)

  return (
    <div className="card p-3 md:p-4 flex flex-col gap-3 md:gap-4">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Buscar por nome, cidade ou palavra-chave…"
          className="flex-1 search-box !py-3 !bg-white/[0.06] !border-white/[0.1]"
        />
        <button className="btn btn-primary px-4">Buscar</button>
      </div>

      <div className="filters-wrap">
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={()=>setSector(sector===s.id ? null : s.id)}
            className={`filter-pill ${sector===s.id ? 'is-active' : ''}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}