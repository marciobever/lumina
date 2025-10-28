// app/admin/create/page.tsx
'use client';

import { useMemo, useState } from 'react';

// -------------------------------
// Listas BR com leve ponderação
// -------------------------------
const FIRST_NAMES_BR = [
  'Isabela','Clara','Luana','Marina','Bianca','Camila','Helena','Valentina','Sofia','Manuela',
  'Lívia','Giovanna','Yasmin','Carolina','Júlia','Ana','Beatriz','Larissa','Fernanda','Raquel',
  'Patrícia','Renata','Natália','Aline','Amanda','Priscila','Tatiane','Bruna','Letícia','Nicole',
];

const LAST_NAMES_BR = [
  'Silva','Souza','Almeida','Costa','Oliveira','Araújo','Barbosa','Ferreira','Macedo','Monteiro',
  'Cardoso','Pereira','Ramos','Rocha','Gomes','Moura','Barros','Campos','Castro','Duarte',
  'Rezende','Nascimento','Cavalcanti','Carvalho','Melo','Moreira','Teixeira','Lopes','Machado','Freitas'
];

// Pequena função para “ponderar” sem complicar (repete alguns sobrenomes muito comuns)
const WEIGHTED_LAST = [...LAST_NAMES_BR, 'Silva','Silva','Silva','Souza','Oliveira','Santos','Santos','Pereira'];

// Etnias em PT-BR (terminologia comum no Brasil)
const ETHNICITIES_BR = [
  'Parda (mestiça)',
  'Preta (afro-brasileira)',
  'Branca (euro-brasileira)',
  'Amarela (descendência asiática)',
  'Indígena',
];

// Tons de pele — se você usar isso em prompts, manter em inglês costuma ajudar modelos de imagem
const SKIN_TONES = ['fair','light','tan','olive','brown','dark'];

// Nichos com histórico de RPM alto no AdSense (finanças/serviços)
const HIGH_RPM_NICHES = [
  'Cartão de crédito (comparador)',
  'Empréstimo pessoal / consignado',
  'Financiamento imobiliário (habitação)',
  'Seguros (auto, vida, residencial, dispositivos)',
  'Conta digital / bancos / Pix / tarifas',
  'Investimentos (CDB, Tesouro Direto, renda fixa)',
  'Consórcio (auto, imóvel, serviços)',
  'Renegociação de dívidas / score de crédito',
  'Planos de saúde / odontológico (comparador)',
  'Telefonia / internet (planos e portabilidade)',
  'Preparação fiscal (IRPF simples, MEI, contabilidade)',
  'Cursos profissionalizantes / certificações (B2C pagantes)',
];

// --------------------------------
// Helpers
// --------------------------------
function randomOf<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomName() {
  const first = randomOf(FIRST_NAMES_BR);
  const last  = randomOf(WEIGHTED_LAST);
  return `${first} ${last}`;
}

function randomAge() {
  // faixa segura para o projeto
  const min = 21, max = 34;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// “Melhor” escolha de nicho: prioriza finance/seguros com leve viés
function pickProfitableNiche() {
  // dá um boost em 6 nichos topo
  const weighted = [
    'Cartão de crédito (comparador)','Cartão de crédito (comparador)',
    'Empréstimo pessoal / consignado','Empréstimo pessoal / consignado',
    'Seguros (auto, vida, residencial, dispositivos)','Seguros (auto, vida, residencial, dispositivos)',
    'Investimentos (CDB, Tesouro Direto, renda fixa)',
    'Conta digital / bancos / Pix / tarifas',
    ...HIGH_RPM_NICHES
  ];
  return randomOf(weighted);
}

export default function CreateProfilePage() {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [result, setResult]       = useState<{Id:string; slug:string} | null>(null);

  // estados dos dados gerados
  const [name, setName]             = useState('');
  const [ethnicity, setEthnicity]   = useState('');
  const [skin, setSkin]             = useState('');
  const [age, setAge]               = useState<number | ''>('');
  const [nicho, setNicho]           = useState('');
  const [customNiche, setCustomNiche] = useState('');

  // lista pronta para um <select>, memorizada
  const NICHES = useMemo(() => HIGH_RPM_NICHES, []);

  function handleGenerate() {
    setGenerated(true);
    setResult(null);
    setError(null);
    setName(randomName());
    setEthnicity(randomOf(ETHNICITIES_BR));
    setSkin(randomOf(SKIN_TONES));
    setAge(randomAge());
    const chosen = pickProfitableNiche();
    setNicho(chosen);
    setCustomNiche(chosen);
  }

  function shuffleNiche() {
    const chosen = pickProfitableNiche();
    setNicho(chosen);
    setCustomNiche(chosen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!generated || !name || !ethnicity || !skin || !age) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/admin/profiles/start', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          name,
          ethnicity,          // BR realista
          skin_tone: skin,    // prompts costumam entender melhor em EN
          age,
          style: 'editorial',
          nicho: customNiche?.trim() || nicho, // envia o nicho para o N8N
        })
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao criar perfil');
      setResult({ Id: String(json.Id), slug: String(json.slug) });
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#0b0c10] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide">
              Novo Perfil
            </h1>
            <p className="text-sm text-gray-300/80">
              Clique em <span className="font-medium">Gerar aleatoriamente</span>.
              O <span className="font-medium">n8n</span> cuida dos prompts e imagens.
            </p>
          </header>

          {/* Botões principais */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            >
              Gerar aleatoriamente
            </button>
            <button
              type="button"
              onClick={shuffleNiche}
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/15 transition"
              disabled={!generated}
              title="Trocar por outro nicho de alto RPM"
            >
              Trocar nicho
            </button>
          </div>

          {/* Bloco dos valores gerados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs text-gray-300/80">Nome</label>
              <input
                readOnly
                value={name}
                placeholder="—"
                className="w-full rounded-lg px-3 py-2 bg-zinc-900/70 border border-zinc-700/70 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-300/80">Etnia (PT-BR)</label>
              <input
                readOnly
                value={ethnicity}
                placeholder="—"
                className="w-full rounded-lg px-3 py-2 bg-zinc-900/70 border border-zinc-700/70 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-300/80">Tom de pele (para prompt)</label>
              <input
                readOnly
                value={skin}
                placeholder="—"
                className="w-full rounded-lg px-3 py-2 bg-zinc-900/70 border border-zinc-700/70 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-300/80">Idade</label>
              <input
                readOnly
                value={age}
                placeholder="—"
                className="w-full rounded-lg px-3 py-2 bg-zinc-900/70 border border-zinc-700/70 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Nicho (pré-seleção rápida + campo editável) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs text-gray-300/80">Nicho (alto RPM AdSense)</label>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                <select
                  value={nicho}
                  onChange={(e)=>{ setNicho(e.target.value); setCustomNiche(e.target.value); }}
                  className="w-full rounded-lg px-3 py-2 bg-zinc-900/70 border border-zinc-700/70 text-white focus:outline-none"
                >
                  <option value="" disabled>Selecione um nicho</option>
                  {NICHES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={shuffleNiche}
                  className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/15 transition"
                  title="Sugerir outro nicho rentável"
                >
                  Sugerir outro
                </button>
              </div>
              <p className="text-[12px] text-gray-400 mt-1">
                Você pode personalizar abaixo antes de enviar:
              </p>
              <input
                value={customNiche}
                onChange={(e)=>setCustomNiche(e.target.value)}
                placeholder="Ex.: Cartão de crédito universitário; Seguro auto para condutor jovem; Consórcio de imóveis..."
                className="mt-2 w-full rounded-lg px-3 py-2 bg-zinc-900/70 border border-zinc-700/70 text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs text-gray-400">
              Status inicial: <code className="text-gray-200">queued</code> no NocoDB
            </span>
            <button
              type="submit"
              disabled={!generated || loading}
              className="rounded-xl px-4 py-2 bg-white text-black hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando…' : 'Enviar para a fila'}
            </button>
          </div>

          {/* Feedback */}
          {result && (
            <div className="mt-2 rounded-lg border border-emerald-700/50 bg-emerald-900/20 px-3 py-2 text-sm">
              Enviado ✅ — ID: <span className="font-medium">{result.Id}</span> — slug: <span className="font-medium">{result.slug}</span>
            </div>
          )}
          {error && (
            <div className="mt-2 rounded-lg border border-red-700/50 bg-red-900/20 px-3 py-2 text-sm">
              Erro: {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
