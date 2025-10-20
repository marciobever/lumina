'use client'
import { useState } from 'react'

export default function QuizWidget({ quiz }:{ quiz?:{title:string;questions:{q:string;options:string[];correctIndex:number}[]} }) {
  const [answers, setAnswers] = useState<number[]>([])
  if (!quiz) return null
  return (
    <section className="mt-6 p-4 rounded-2xl border">
      <h3 className="font-semibold text-xl mb-2">{quiz.title}</h3>
      {quiz.questions.map((it, idx)=>(
        <div key={idx} className="mb-4">
          <p className="font-medium">{it.q}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {it.options.map((op, oi)=>(
              <button key={oi}
                onClick={()=>setAnswers(a=>{ const b=[...a]; b[idx]=oi; return b; })}
                className={`px-3 py-2 rounded-xl border ${answers[idx]===oi ? 'bg-black text-white' : 'bg-white'}`}>
                {op}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
