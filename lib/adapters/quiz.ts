import type { NormalizedQuiz } from "@/lib/types"

const DEFAULT_OPTIONS = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente",
]

export function buildQuizForWidget(raw: any): NormalizedQuiz | null {
  if (raw == null) return null
  const q = typeof raw === "string" ? safeJson(raw) : raw
  if (!q) return null

  // Shape 1: { questions: [{ title, options? }] }
  if (Array.isArray(q.questions) && q.questions.every((it: any) => it && typeof it === "object")) {
    return {
      title: String(q.title ?? "Quiz"),
      description: q.description ? String(q.description) : undefined,
      questions: q.questions.map((it: any, i: number) => ({
        id: String(it?.id ?? `q${i + 1}`),
        title: String(it?.title ?? it?.question ?? `Pergunta ${i + 1}`),
        options: Array.isArray(it?.options) && it.options.length > 0 ? it.options.map(String) : DEFAULT_OPTIONS,
      })),
    }
  }

  // Shape 2: { items: [...] }
  if (Array.isArray(q.items)) {
    return {
      title: String(q.title ?? "Quiz"),
      description: q.description ? String(q.description) : undefined,
      questions: q.items.map((it: any, i: number) => ({
        id: String(it?.id ?? `q${i + 1}`),
        title: String(it?.title ?? it?.question ?? `Pergunta ${i + 1}`),
        options: Array.isArray(it?.options) && it.options.length > 0 ? it.options.map(String) : DEFAULT_OPTIONS,
      })),
    }
  }

  // Shape 3: { questions: string[] }
  if (Array.isArray(q.questions) && q.questions.every((s: any) => typeof s !== "object")) {
    return {
      title: String(q.title ?? "Quiz"),
      description: q.description ? String(q.description) : undefined,
      questions: q.questions.map((t: any, i: number) => ({
        id: `q${i + 1}`,
        title: String(t),
        options: DEFAULT_OPTIONS,
      })),
    }
  }

  return null
}

function safeJson(s: string) {
  try { return JSON.parse(s) } catch { return null }
}