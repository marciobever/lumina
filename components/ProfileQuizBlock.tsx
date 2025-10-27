import QuizWidget from './QuizWidget'

type Q = { q: string; options?: string[] }
type Props = { title: string; description?: string; questions: Q[] }

export default function ProfileQuizBlock({ title, description, questions }: Props) {
  if (!questions?.length) return null
  return (
    <div className="card p-4 md:p-5 mt-6">
      <h2 className="h-section mb-1">{title}</h2>
      {description && <p className="text-white/70 mb-3">{description}</p>}
      <QuizWidget title={title} questions={questions} />
    </div>
  )
}