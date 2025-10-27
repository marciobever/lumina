"use client"

import React, { useMemo, useState, useEffect } from "react"

export type QuizOption = { label: string; next?: string; result?: string }
export type QuizStep   = { id: string; title: string; subtitle?: string; options: QuizOption[] }
export type QuizProduct = {
  title: string; url: string; image?: string; description?: string; badge?: string
}

export type InteractiveQuizProps = {
  steps: QuizStep[]
  firstId: string
  onComplete?: (resultId: string | null, answers: { stepId: string; label: string }[]) => void
  products?: QuizProduct[]
  productsTitle?: string
  ctaAfterFinish?: { label: string; href: string }
}

type ChatItem = { type: "bot" | "user"; text: string; sub?: string }

export default function InteractiveQuiz({
  steps,
  firstId,
  onComplete,
  products = [],
  productsTitle = "Recomendações para você",
  ctaAfterFinish,
}: InteractiveQuizProps) {
  // mapa de passos
  const map = useMemo(() => {
    const m = new Map<string, QuizStep>()
    for (const s of steps) m.set(s.id, s)
    return m
  }, [steps])

  const [currentId, setCurrentId] = useState<string>(firstId)
  const [chat, setChat] = useState<ChatItem[]>([])
  const [answers, setAnswers] = useState<{ stepId: string; label: string }[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [shown, setShown] = useState<Record<string, boolean>>({}) // evita duplicar perguntas

  const current = map.get(currentId) || null

  // mostra a pergunta atual sem usar findLast
  useEffect(() => {
    if (!current) return
    if (shown[current.id]) return
    setShown((prev) => ({ ...prev, [current.id]: true }))
    setChat((prev) => [...prev, { type: "bot", text: current.title, sub: current.subtitle }])
  }, [current, shown])

  function choose(opt: QuizOption) {
    if (!current) return
    // adiciona resposta do usuário
    setChat((prev) => [...prev, { type: "user", text: opt.label }])
    const newAnswers = [...answers, { stepId: current.id, label: opt.label }]
    setAnswers(newAnswers)

    if (opt.result) {
      setResult(opt.result)
      onComplete && onComplete(opt.result, newAnswers)
      return
    }
    if (opt.next) {
      // pequena pausa para fluidez
      setTimeout(() => setCurrentId(opt.next as string), 120)
      return
    }
    setResult("done")
    onComplete && onComplete("done", newAnswers)
  }

  const finished = result !== null

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <h3 className="text-xl font-semibold text-white/95 mb-3">Perguntas rápidas</h3>

      {/* Chat */}
      <div className="space-y-3">
        {chat.map((c, i) =>
          c.type === "bot" ? (
            <div key={`b-${i}`} className="max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
              <div className="text-white/90">{c.text}</div>
              {c.sub ? <div className="text-white/60 text-sm mt-1">{c.sub}</div> : null}
            </div>
          ) : (
            <div key={`u-${i}`} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl bg-gradient-to-r from-white/[0.08] to-white/[0.06] px-4 py-2 border border-white/10">
                <div className="text-white text-sm font-medium">{c.text}</div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Opções (somem ao finalizar) */}
      {!finished && current ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {current.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white/85 hover:bg-white/[0.08] transition"
              onClick={() => choose(opt)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Resultado + Produtos */}
      {finished ? (
        <div className="mt-6 space-y-5">
          <div className="text-base text-white/85">
            {result && result !== "done"
              ? <>Análise concluída: <span className="font-semibold">{result}</span>.</>
              : "Análise concluída."}
          </div>

          {products.length ? (
            <>
              <div className="text-white/90 font-semibold">{productsTitle}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p, idx) => {
                  const hasImg = typeof p.image === "string" && p.image.length > 6
                  return (
                    <a
                      key={idx}
                      href={p.url}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition overflow-hidden"
                      target="_blank" rel="noopener noreferrer"
                    >
                      {hasImg ? (
                        <div
                          className="h-36 bg-cover bg-center"
                          style={{ backgroundImage: `url("${(p.image as string).replace(/"/g,'\\"')}")` }}
                        />
                      ) : <div className="h-3" />}
                      <div className="p-4 space-y-1">
                        <div className="flex items-center gap-2">
                          {p.badge ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15">{p.badge}</span> : null}
                          <div className="font-medium text-white/95">{p.title}</div>
                        </div>
                        {p.description ? <div className="text-sm text-white/70">{p.description}</div> : null}
                      </div>
                    </a>
                  )
                })}
              </div>
            </>
          ) : null}

          {ctaAfterFinish ? (
            <div className="pt-1">
              <a className="btn btn-primary px-6" href={ctaAfterFinish.href} target="_blank" rel="noopener noreferrer">
                {ctaAfterFinish.label}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}