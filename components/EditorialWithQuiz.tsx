// components/EditorialWithQuiz.tsx
"use client"

import { useState } from "react"
import ProfileEditorial from "@/components/ProfileEditorial"

type Quiz = {
  title: string
  description?: string
  questions: Array<{ id: string; title: string; options: string[] }>
}

export default function EditorialWithQuiz({
  article,
  quiz,
}: {
  article: any
  quiz: Quiz | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ProfileEditorial article={article} onCtaClick={() => setOpen(true)} />

      {open && quiz && quiz.questions?.length ? (
        <section className="card px-6 md:px-8 py-7 md:py-9" id="quiz">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white/95">{quiz.title || "Quiz"}</h2>
            <button className="text-white/70 hover:text-white text-sm" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>
          {quiz.description ? <p className="mt-2 text-white/80">{quiz.description}</p> : null}

          <div className="mt-5 space-y-7">
            <ol className="space-y-6">
              {quiz.questions.map((q, qi) => (
                <li key={q.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12] text-sm font-semibold">
                      {qi + 1}
                    </span>
                    <h3 className="font-medium text-slate-100">{q.title}</h3>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {q.options.map((opt, oi) => {
                      const id = `${q.id}-${oi}`
                      return (
                        <label key={id} htmlFor={id} className="relative cursor-pointer">
                          <input id={id} type="radio" name={q.id} className="peer sr-only" />
                          <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.05] text-white/85
                                          hover:bg-white/[0.07] transition shadow-sm
                                          peer-checked:border-transparent
                                          peer-checked:text-white
                                          peer-checked:shadow
                                          peer-checked:[background:linear-gradient(90deg,rgba(var(--accent),0.95),rgba(var(--accent2),0.95))]">
                            <span className="text-sm font-medium">{opt}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex justify-end">
              <button className="btn btn-primary">Enviar respostas</button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}