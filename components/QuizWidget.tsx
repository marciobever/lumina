// components/ProfileQuizBlock.tsx
'use client'

import QuizWidget from './QuizWidget'

type Q = {
  q: string
  options?: string[]        // agora opcional
  correctIndex?: number     // agora opcional
}

type Props = {
  title: string
  description?: string
  questions: Q[]
}

export default function ProfileQuizBlock({ title, description, questions }: Props) {
  if (!questions?.length) return null

  return (
    <section className="card px-6 md:px-8 py-7 md:py-9" id="quiz">
      <h2 className="h-section mb-1">{title}</h2>
      {description && <p className="text-white/70 mb-3">{description}</p>}
      <QuizWidget quiz={{ title, questions }} />
    </section>
  )
}
