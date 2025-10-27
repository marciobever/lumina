// components/QuizWidget.tsx
'use client'

import { useMemo, useState } from 'react'

type Q = { q: string; options?: string[]; correctIndex?: number }
type Quiz = { title: string; questions: Q[] }

export default function QuizWidget({ quiz }: { quiz?: Quiz }) {
  const DEFAULT_OPTS = [
    'Discordo totalmente',
    'Discordo',
    'Neutro',
    'Concordo',
    'Concordo totalmente',
  ]

  if (!quiz) return null

  const questions = useMemo(() => quiz.questions ?? [], [quiz])

  // garante estado com o mesmo comprimento das questões
  const [answers, setAnswers] = useState<number[]>(
    () => Array.from({ length: questions.length }, () => -1)
  )

  const choose = (qi: number, oi: number) =>
    setAnswers(prev => {
      const next = [...prev]
      next[qi] = oi
      return next
    })

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <h3 className="font-semibold text-xl text-white/95 mb-4">{quiz.title}</h3>

      {questions.map((q, qi) => {
        const opts = q.options?.length ? q.options : DEFAULT_OPTS
        const selected = answers[qi]

        return (
          <div key={qi} className="mb-6">
            <p className="font-medium text-white/90 mb-3">{q.q}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {opts.map((op, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => choose(qi, oi)}
                  className={[
                    'px-3 py-2 rounded-xl border text-sm transition-all',
                    'border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.08]',
                    selected === oi
                      ? 'font-semibold text-white [background:linear-gradient(90deg,rgba(var(--accent),0.9),rgba(var(--accent2),0.9))] border-transparent'
                      : ''
                  ].join(' ')}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
