'use client'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500)) // só visual
    setDone(true)
    setLoading(false)
  }

  return (
    <form className="nl-hero" action="#" method="post" onSubmit={handleSubmit}>
      <label htmlFor="nl-home" className="sr-only">Seu e-mail</label>
      <input
        id="nl-home"
        name="email"
        type="email"
        required
        placeholder="Seu e-mail"
        className="nlh-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="nlh-btn" type="submit" disabled={loading || done}>
        {done ? 'Assinado ✓' : loading ? 'Enviando…' : 'Assinar'}
      </button>
      <p className="nlh-hint">
        {done ? 'Obrigado! Você receberá nossos destaques.' : 'Receba destaques semanais. Sem spam.'}
      </p>
    </form>
  )
}