// components/GlassCard.tsx
import { PropsWithChildren } from 'react'

export default function GlassCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`card p-5 glow-ring ${className ?? ''}`}>{children}</div>
  )
}