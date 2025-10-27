"use client"
import React from "react"
import dynamic from "next/dynamic"
import { Section } from "./Section"
import type { NormalizedQuiz } from "@/lib/types"

// Carrega o widget só no client
const QuizWidget = dynamic(() => import("@/components/QuizWidget"), { ssr: false, loading: () => null })

export default function QuizBlock({ quiz }: { quiz: NormalizedQuiz | null }) {
  const valid =
    !!quiz &&
    Array.isArray(quiz.questions) &&
    quiz.questions.length > 0 &&
    quiz.questions.every((q) => q && typeof q.title === "string" && Array.isArray(q.options) && q.options.length > 0)

  if (!valid) return null

  return (
    <Section title={quiz.title || "Quiz"}>
      {quiz.description ? <p className="text-gray-700 mb-4">{quiz.description}</p> : null}
      {/* O componente receberá: { title, description, questions[{id,title,options[]}] } */}
      <QuizWidget quiz={quiz as any} />
    </Section>
  )
}