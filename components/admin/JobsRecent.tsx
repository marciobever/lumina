// components/admin/JobsRecent.tsx
'use client';

import { useEffect, useState } from 'react';

type Job = {
  id: string;
  name: string;
  slug: string;
  nicho: string | null;
  status: 'queued' | 'processing' | 'published' | 'failed' | string;
  updated_at: string | null;
};

export default function JobsRecent({ pollMs = 8000, limit = 8 }: { pollMs?: number; limit?: number }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const res = await fetch(`/api/admin/jobs?limit=${limit}`, { cache: 'no-store' });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Falha ao carregar jobs');
      setJobs(Array.isArray(j.data) ? j.data : []);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [pollMs, limit]);

  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Jobs recentes</h3>
        <button
          onClick={load}
          className="text-sm rounded-md border border-white/10 px-3 py-1 hover:bg-white/10"
        >
          Atualizar
        </button>
      </div>

      {loading && <div className="text-sm text-white/70">Carregando…</div>}
      {err && <div className="text-sm text-red-300">Erro: {err}</div>}

      {!loading && !err && (
        <div className="divide-y divide-white/10">
          {jobs.length === 0 ? (
            <div className="text-sm text-white/60 py-3">Nenhum job encontrado.</div>
          ) : (
            jobs.map((j) => (
              <div key={j.id} className="py-3 flex items-center gap-3">
                <div className="w-10 shrink-0 text-xs text-white/60">#{j.id}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {j.name || '—'} {j.slug ? <span className="text-white/50">({j.slug})</span> : null}
                  </div>
                  <div className="text-xs text-white/60">
                    Nicho: {j.nicho || '—'} {j.updated_at ? ` • Atualizado: ${new Date(j.updated_at).toLocaleString()}` : ''}
                  </div>
                </div>
                <StatusBadge status={j.status} />
                <a
                  href={j.slug ? `/perfil/${j.slug}` : '#'}
                  className="text-xs rounded-md border border-white/10 px-2 py-1 hover:bg-white/10"
                >
                  Ver
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    processing: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
    published: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    failed: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  };
  const cls = map[status] || 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30';
  return (
    <span className={`text-xs px-2 py-1 border rounded-md ${cls}`}>
      {status}
    </span>
  );
}
