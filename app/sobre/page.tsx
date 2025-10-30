// app/sobre/page.tsx
export const metadata = {
  title: "Sobre • LUMINA",
  description:
    "Entenda a proposta do LUMINA: curadoria editorial PG-13, estilo, estética e direção de arte neon/glass.",
};

export default function SobrePage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 blur-2xl">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600/30" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-600/30" />
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">
          <span className="text-xs tracking-widest uppercase text-violet-300/80">
            Quem somos
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">Sobre</h1>
          <p className="mt-3 text-white/70">
            LUMINA é um diretório editorial feminino (PG-13) com foco em estética,
            estilo e curadoria visual — sempre com respeito e bom gosto.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8 shadow-[0_0_1px_#fff_inset,0_10px_40px_-20px_rgba(139,92,246,0.35)]">
          <div className="space-y-8 text-white/90">
            <div>
              <h2 className="text-xl font-semibold">Nossa proposta</h2>
              <p className="mt-3 text-white/80">
                Celebramos o visual editorial com direção de arte moderna (neon/glass),
                fotografia elegante e apresentação consistente. Os perfis destacam estilo,
                biografia breve e galeria com curadoria — sem conteúdo adulto.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Diretrizes editoriais</h2>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-white/80">
                <li>Conteúdo PG-13, respeitoso e adequado a público geral.</li>
                <li>Imagens e textos com estética consistente e ficha informativa.</li>
                <li>Transparência de anúncios e links identificados.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Tecnologia & desempenho</h2>
              <p className="mt-3 text-white/80">
                O site utiliza Next.js (App Router) e integrações de anúncios que respeitam
                performance e experiência (renderização limpa por página, sem “travas”).
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold">Contato</h3>
              <p className="mt-2 text-white/80">
                Fale com a equipe editorial:{" "}
                <a
                  href="mailto:contato@lumina.site"
                  className="underline decoration-violet-400 hover:text-violet-300"
                >
                  contato@lumina.site
                </a>
              </p>
            </div>

            <p className="text-xs text-white/50">
              Aviso: LUMINA é independente e não possui relação com órgãos públicos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
