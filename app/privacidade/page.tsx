// app/privacidade/page.tsx
export const metadata = {
  title: "Política de Privacidade • LUMINA",
  description:
    "Como coletamos, usamos e protegemos seus dados no LUMINA. Política de privacidade transparente e em conformidade com boas práticas.",
};

export default function PrivacidadePage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 blur-2xl">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-600/30" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-600/30" />
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">
          <span className="text-xs tracking-widest uppercase text-fuchsia-300/80">
            Transparência
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">
            Política de Privacidade
          </h1>
          <p className="mt-3 text-white/70">
            Sua privacidade é prioridade. Explicamos aqui, de forma clara, como tratamos
            informações, cookies e preferências.
          </p>
          <p className="mt-2 text-xs text-white/50">Última atualização: 30/10/2025</p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8 shadow-[0_0_1px_#fff_inset,0_10px_40px_-20px_rgba(168,85,247,0.35)]">
          <div className="space-y-8 text-white/90">
            <div>
              <h2 className="text-xl font-semibold">1. Informações que coletamos</h2>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-white/80">
                <li>
                  <span className="font-medium">Dados de navegação</span> (ex.: IP
                  anonimizado, agente do navegador, páginas visitadas).
                </li>
                <li>
                  <span className="font-medium">Cookies e tecnologias similares</span> para
                  lembrar preferências e medir audiência.
                </li>
                <li>
                  <span className="font-medium">Dados fornecidos voluntariamente</span>{" "}
                  (ex.: formulários, comentários ou contato).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold">2. Como usamos seus dados</h2>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-white/80">
                <li>Melhorar conteúdo, experiência e performance do site.</li>
                <li>Mensurar audiência, engajamento e eficácia de campanhas.</li>
                <li>Exibir publicidade de forma contextual e responsável.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold">3. Publicidade e parceiros</h2>
              <p className="mt-3 text-white/80">
                Utilizamos soluções como Google Ad Manager (GPT) e Videoo (Video Wall) para
                veiculação de anúncios. Esses parceiros podem usar cookies/IDs para
                entrega, limitação de frequência e relatórios de desempenho.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">4. Cookies e controle</h2>
              <p className="mt-3 text-white/80">
                Você pode gerenciar cookies no seu navegador. Alguns recursos podem
                depender deles para funcionar corretamente.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">5. Retenção e segurança</h2>
              <p className="mt-3 text-white/80">
                Mantemos dados pelo tempo necessário às finalidades descritas e aplicamos
                medidas técnicas e organizacionais compatíveis com o escopo editorial do
                site.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold">Contato</h3>
              <p className="mt-2 text-white/80">
                Dúvidas sobre privacidade? Fale conosco:{" "}
                <a
                  href="mailto:contato@lumina.site"
                  className="underline decoration-fuchsia-400 hover:text-fuchsia-300"
                >
                  contato@lumina.site
                </a>
              </p>
            </div>

            <p className="text-xs text-white/50">
              Aviso: LUMINA é um diretório editorial independente, sem vínculo com órgãos
              governamentais.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
