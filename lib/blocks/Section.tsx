"use client"
import React from "react"

export const Section = ({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) => (
  <section id={id} className="rounded-2xl border bg-white/70 shadow-sm backdrop-blur p-5 md:p-6">
    <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
)