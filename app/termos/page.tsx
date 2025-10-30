// app/termos/page.tsx
export const metadata = {
  title: "Termos de Uso • LUMINA",
  description:
    "Condições de uso do LUMINA: responsabilidades, limitações e diretrizes de conteúdo.",
};

export default function TermosPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 blur-2xl">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-600/30" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-pink-600/30" />
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">
          <span className="text-xs tracking-widest uppercase text-purple-300/80">
            Diretrizes
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">
            Termos de Uso
          </h1>
          <p className="mt-3 text-white/70">
            Leia com atenção. O uso deste site implica concordância com as condições
            abaixo.
          </p>
          <p className="mt-2 text-xs text-white/50">Última atualização: 30/10/2025</p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8 shadow-[0_0_1px_#fff_inset,0_10px_40px_-20px_rgba(236,72,153,0.35)]">
          <div className="space-y-8 text-white/90">
            <div>
              <h2 className="text-xl font-semibold">1. Objeto e Aceitação</h2>
              <p className="mt-3 text-white/80">
                O LUMINA é um diretório editorial de caráter informativo e curatorial
                (PG-13). Ao acessar ou utilizar nossos serviços, você concorda com estes
                Termos de Uso.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">2. Conteúdo e Responsabilidade</h2>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-white/80">
                <li>
                  O conteúdo é fornecido “como está”, sem garantias de exatidão ou
                  disponibilidade contínua.
                </li>
                <li>
                  Não nos responsabilizamos por decisões tomadas com base em informações
                  publicadas no site.
                </li>
                <li>
                  Links externos podem direcionar para conteúdos de terceiros, fora do
                  nosso controle editorial.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold">3. Propriedade Intelectual</h2>
              <p className="mt-3 text-white/80">
                Marcas, identidades visuais, textos e imagens presentes no site podem ser
                protegidos por direitos autorais e outras leis. É proibido uso não
                autorizado.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">4. Uso Adequado</h2>
              <p className="mt-3 text-white/80">
                É vedado qualquer uso que comprometa segurança, disponibilidade ou
                integridade do site, incluindo tentativas de exploração ou scraping
                abusivo.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">5. Anúncios e Monetização</h2>
              <p className="mt-3 text-white/80">
                Exibimos anúncios por meio de provedores como Google Ad Manager e Videoo,
                seguindo políticas de parceiros e boas práticas de veiculação.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold">6. Alterações</h2>
              <p className="mt-3 text-white/80">
                Estes Termos podem ser atualizados periodicamente. Mudanças passam a valer
                após a publicação nesta página.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold">Contato</h3>
              <p className="mt-2 text-white/80">
                Suporte e dúvidas gerais:{" "}
                <a
                  href="mailto:contato@lumina.site"
                  className="underline decoration-pink-400 hover:text-pink-300"
                >
                  contato@lumina.site
                </a>
              </p>
            </div>

            <p className="text-xs text-white/50">
              Aviso: LUMINA é um projeto editorial independente, sem vínculo com órgãos
              públicos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
