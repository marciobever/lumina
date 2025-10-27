"use client"
import React from "react"
import { Section } from "./Section"

export default function EditorialBlock({
  sections = [],
  tips = [],
  cta = null,
}: {
  sections?: Array<{ text: string }>
  tips?: string[]
  cta?: { headline?: string; text?: string; button?: string } | null
}) {
  if ((!sections || sections.length === 0) && (!tips || tips.length === 0) && !cta) return null

  return (
    <Section title="Editorial">
      {Array.isArray(sections) && sections.length > 0 && (
        <div className="prose max-w-none prose-p:leading-relaxed">
          {sections.map((sec, i) => <p key={i}>{sec?.text ?? ""}</p>)}
        </div>
      )}

      {Array.isArray(tips) && tips.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base font-semibold">Dicas práticas</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {tips.map((t, i) => <li key={i} className="text-gray-800">{t}</li>)}
          </ul>
        </div>
      )}

      {cta && (cta.headline || cta.text || cta.button) ? (
        <div className="mt-6 rounded-xl border bg-white/70 p-5">
          {cta.headline && <h4 className="text-lg font-semibold">{cta.headline}</h4>}
          {cta.text && <p className="mt-2 text-gray-700">{cta.text}</p>}
          {cta.button && (
            <div className="mt-4">
              <a href="#newsletter" className="btn btn-primary">{cta.button}</a>
            </div>
          )}
        </div>
      ) : null}
    </Section>
  )
}