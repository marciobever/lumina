// lib/adapters/article.ts
export type ParagraphBlock = { type: "paragraph"; text: string }
export type TipsBlock = { type: "tips"; title?: string; items: string[] }
export type CtaBlock = { type: "cta"; headline?: string; text?: string; button?: string; href?: string }
export type ArticleBlock = ParagraphBlock | TipsBlock | CtaBlock

export type NormalizedArticle = {
  hook?: string
  content: ArticleBlock[]
}

const toStr = (v: any) => (v == null ? "" : String(v))
const clean = (s: any) => toStr(s).replace(/\s+/g, " ").trim()

const parseMaybe = <T,>(v: any, fallback: T): T => {
  if (v == null) return fallback
  if (typeof v === "string") {
    try { return JSON.parse(v) as T } catch { return fallback }
  }
  return v as T
}

/** Converte o JSON (ou string JSON) do artigo para blocos de UI (tolerante com formatos). */
export function normalizeArticle(raw: any): NormalizedArticle | null {
  const a = parseMaybe<any>(raw, null)
  if (!a) return null

  const content: ArticleBlock[] = []

  // 1) HOOK (aceita a.hook ou a.intro)
  const hook = clean(a.hook ?? a.intro ?? "")
  const out: NormalizedArticle = { hook: hook || undefined, content }

  // 2) SECTIONS → paragraphs
  //    aceita: [{text}], ["texto"], ou {sections: string}
  const pushParagraph = (t: string) => {
    const txt = clean(t)
    if (txt) content.push({ type: "paragraph", text: txt })
  }

  if (Array.isArray(a.sections)) {
    for (const sec of a.sections) {
      if (!sec) continue
      if (typeof sec === "string") pushParagraph(sec)
      else if (sec.text) pushParagraph(sec.text)
      else if (sec.body) pushParagraph(sec.body)
      else if (sec.copy) pushParagraph(sec.copy)
    }
  } else if (typeof a.sections === "string") {
    pushParagraph(a.sections)
  }

  // 3) TIPS
  //    aceita: tips: string[]  OU tips: { title?: string, items: string[] }
  if (Array.isArray(a.tips) && a.tips.length) {
    const items = a.tips.map(clean).filter(Boolean)
    if (items.length) content.push({ type: "tips", items })
  } else if (a.tips?.items && Array.isArray(a.tips.items)) {
    const items = a.tips.items.map(clean).filter(Boolean)
    if (items.length) content.push({ type: "tips", title: clean(a.tips.title), items })
  }

  // 4) CTA
  //    aceita a.cta ou a.call_to_action; adiciona href default "#quiz" p/ embutir quiz
  const ctaRaw = a.cta ?? a.call_to_action
  if (ctaRaw && (ctaRaw.headline || ctaRaw.text || ctaRaw.button)) {
    content.push({
      type: "cta",
      headline: clean(ctaRaw.headline),
      text: clean(ctaRaw.text),
      button: clean(ctaRaw.button || "Participar"),
      href: clean(ctaRaw.href || "#quiz"),
    })
  }

  // 5) FALLBACK: se nada entrou, tenta usar title/context/body
  if (!content.length) {
    const fallback =
      clean(a.title) ||
      clean(a.context) ||
      clean(a.body) ||
      ""
    if (fallback) content.push({ type: "paragraph", text: fallback })
  }

  return out.content.length ? out : null
}