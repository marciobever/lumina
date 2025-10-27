// app/admin/create/page.tsx
'use client';

import { useState } from 'react';

// opções de geração
const ETHNICITIES = ['Latina', 'Afro-Brazilian', 'Euro-Brazilian', 'Asian-Brazilian', 'Mestiza'];
const SKIN_TONES  = ['fair', 'light', 'tan', 'olive', 'brown', 'dark'];

function randomOf<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomName() {
  const first = ['Isabela','Clara','Luana','Marina','Bianca','Camila','Helena','Valentina','Sofia','Manuela','Lívia','Giovanna','Yasmin','Carolina','Júlia'];
  const last  = ['Freitas','Silva','Souza','Almeida','Costa','Oliveira','Araújo','Barbosa','Ferreira','Macedo','Monteiro','Cardoso','Pereira','Ramos','Rocha'];
  return `${randomOf(first)} ${randomOf(last)}`;
}

function randomAge() {
  // faixa segura para o projeto
  const min = 21, max = 34;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function CreateProfilePage() {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<{Id:number; slug:string} | null>(null);

  // estados dos dados gerados
  const [name, setName]           = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [skin, setSkin]           = useState('');
  const [age, setAge]             = useState<number | ''>('');

  function handleGenerate() {
    setGenerated(true);
    setResult(null);
    setError(null);
    setName(randomName());
    setEthnicity(randomOf(ETHNICITIES));
    setSkin(randomOf(SKIN_TONES));
    setAge(randomAge());
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
          ethnicity,
          skin_tone: skin,
          age,
          style: 'editorial',
          // sem prompt; quem gera é o n8n
        })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Falha ao criar perfil');
      setResult({ Id: json.Id, slug: json.slug });
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

          {/* Botão central para gerar */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            >
              Gerar aleatoriamente
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
              <label className="block text-xs text-gray-300/80">Etnia</label>
              <input
                readOnly
                value={ethnicity}
                placeholder="—"
                className="w-full rounded-lg px-3 py-2 bg-zinc-900/70 border border-zinc-700/70 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-gray-300/80">Tom de pele</label>
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
