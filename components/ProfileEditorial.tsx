// components/ProfileEditorial.tsx
'use client'

import React from "react"
import type { NormalizedArticle as NormalizedArticleFromAdapter } from "@/lib/adapters/article"

/** Tipos de blocos que esperamos receber */
type ParagraphBlock = { type: "paragraph"; text: string }
type TipsBlock      = { type: "tips"; title?: string; items: string[] }
type CtaBlock       = { type: "cta"; headline?: string; text?: string; button?: string; href?: string }
type ArticleBlock   = ParagraphBlock | TipsBlock | CtaBlock

export type NormalizedArticle = NormalizedArticleFromAdapter | {
  hook?: string
  content: ArticleBlock[]
}

/* ---------- Partes ---------- */

const Paragraph = ({ text, dropcap = false }: { text: string; dropcap?: boolean }) => (
  <p className={`reading-loose ${dropcap ? "dropcap" : ""}`}>{text}</p>
)

const Tips = ({ title, items }: { title?: string; items: string[] }) => (
  <div className="my-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <h3 className="flex items-center gap-2 text-xl font-display font-semibold text-white text-balance">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
           fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18h6" /><path d="M10 22h4" />
        <path d="M2 11a10 10 0 1 1 20 0c0 3-1.5 4.5-3.5 6.5S17 20 17 20H7s0-2-.5-2.5S2 14 2 11Z"/>
      </svg>
      {title || "Dicas práticas"}
    </h3>
    <ul className="mt-3 list-disc pl-5 space-y-2 text-white/90">
      {items.map((item, i) => <li key={i} className="reading-loose">{item}</li>)}
    </ul>
  </div>
)

/** CTA com suporte a href (default #quiz) para abrir o quiz embutido via :target */
const Cta = ({ headline, text, button, href = "#quiz" }: { headline?: string; text?: string; button?: string; href?: string }) => (
  <div
    className="mt-8 rounded-2xl p-6 text-center"
    style={{ background: "linear-gradient(45deg, rgba(var(--accent),0.10), rgba(var(--accent2),0.10))" }}
  >
    {headline && <h4 className="text-2xl font-display font-bold text-white text-balance">{headline}</h4>}
    {text && <p className="mt-3 mx-auto max-w-xl text-white/80 reading-loose">{text}</p>}
    {button && (
      <div className="mt-6">
        <a href={href} className="btn btn-primary px-6">{button}</a>
      </div>
    )}
  </div>
)

/* ---------- Mini quiz embutido (curtinho e discreto) ---------- */
type MiniQ = { id: string; title: string; options?: string[] }
const DEFAULT_OPTS = ["Discordo totalmente","Discordo","Neutro","Concordo","Concordo totalmente"]

function InlineQuiz({ questions }: { questions: MiniQ[] }) {
  if (!questions?.length) return null
  const qs = questions.slice(0, 3) // sempre curto

  return (
    <section id="quiz" className="mt-8 scroll-mt-24">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <h3 className="text-lg font-semibold text-white/95 mb-3">Mini Quiz</h3>
        <p className="text-sm text-white/60 mb-5">Três perguntinhas rápidas para personalizar a experiência.</p>

        <div className="space-y-7">
          {qs.map((q, qi) => (
            <div key={q.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.15] text-xs font-bold text-white/90">
                  {qi + 1}
                </span>
                <h4 className="text-sm font-medium text-white/90 pt-1">{q.title}</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:pl-11">
                {(q.options?.length ? q.options : DEFAULT_OPTS).map((opt, oi) => {
                  const id = `${q.id}-${oi}`
                  return (
                    <label key={id} htmlFor={id} className="relative cursor-pointer">
                      <input id={id} type="radio" name={q.id} className="peer sr-only" />
                      <div className="px-3 py-2 rounded-lg border border-white/8 bg-white/[0.04] text-white/75 text-center
                                      hover:bg-white/[0.06] hover:border-white/12 transition-all
                                      peer-checked:border-transparent peer-checked:text-white peer-checked:font-medium
                                      peer-checked:[background:linear-gradient(90deg,rgba(var(--accent),0.95),rgba(var(--accent2),0.95))]">
                        <span className="text-xs leading-tight">{opt}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-2">
            <button
              type="button"
              className="btn btn-primary px-7 py-3 text-sm font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              onClick={() => {
                // feedback visual discreto
                const el = document.getElementById("quiz")
                if (!el) return
                el.classList.add("ring-2","ring-emerald-400/60","ring-offset-2","ring-offset-black")
                setTimeout(() => el.classList.remove("ring-2","ring-emerald-400/60","ring-offset-2","ring-offset-black"), 900)
              }}
            >
              Enviar respostas
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Componente principal ---------- */

export default function ProfileEditorial({
  article,
  quiz, // <<— passe o quiz normalizado a partir da page (opcional)
}: {
  article: NormalizedArticle | null
  quiz?: { title?: string; description?: string; questions?: Array<{ id: string; title: string; options?: string[] }> } | null
}) {
  if (!article || !Array.isArray(article.content) || article.content.length === 0) return null

  const blocks: React.ReactNode[] = []

  article.content.forEach((block, idx) => {
    if (!block || typeof (block as any).type !== "string") return

    switch (block.type) {
      case "paragraph": {
        const raw = String((block as ParagraphBlock).text ?? "").trim()
        if (!raw) break
        // separa por linhas em branco e remove espaços
        const parts = raw.split(/\n{2,}/).map(s => s.trim()).filter(Boolean)
        parts.forEach((pText, pi) => {
          blocks.push(
            <Paragraph key={`p-${idx}-${pi}`} text={pText} dropcap={idx === 0 && pi === 0} />
          )
        })
        break
      }
      case "tips": {
        const { title, items } = block as TipsBlock
        const list = Array.isArray(items) ? items.map(String).filter(Boolean) : []
        if (list.length) blocks.push(<Tips key={`t-${idx}`} title={title} items={list} />)
        break
      }
      case "cta": {
        const b = block as CtaBlock
        if (b.headline || b.text || b.button)
          blocks.push(<Cta key={`c-${idx}`} headline={b.headline} text={b.text} button={b.button} href={(b as any).href ?? "#quiz"} />)
        break
      }
      default:
        break
    }
  })

  if (blocks.length === 0) return null

  // Mini-quiz (curto) embutido; só renderiza se vier algo do back
  const miniQuiz =
    quiz?.questions?.length
      ? <InlineQuiz questions={quiz.questions.slice(0, 3).map((q, i) => ({ id: String(q.id ?? `q${i+1}`), title: String(q.title ?? ""), options: q.options }))} />
      : null

  return (
    <section className="card px-6 md:px-8 py-7 md:py-9">
      <h2 className="h-section text-balance">Editorial</h2>

      {article.hook ? (
        <blockquote className="quote-glow mt-5 px-5 py-4 italic text-white/80 reading-loose">
          {article.hook}
        </blockquote>
      ) : null}

      {/* Medida de leitura + tipografia refinada */}
      <div className="mt-6 mx-auto reading-measure prose prose-invert prose-dark text-lg hyphens-auto">
        {blocks}
      </div>

      {/* Quiz embutido (aparece ao clicar no CTA → #quiz) */}
      {miniQuiz}
    </section>
  )
}