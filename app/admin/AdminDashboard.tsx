// app/admin/AdminDashboard.tsx
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React from 'react';
import { getAdminMetrics, listProfiles, type Profile } from '@/lib/queries';

export type JobStatus = 'queued' | 'running' | 'failed' | 'completed' | 'cancelled';

interface DashboardJob {
  id: string;
  status: JobStatus;
  nome: string;
  nicho: string;
  categoria: string;
  created_at: string;
  updated_at: string;
}

interface WebhookInfo {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

interface DashboardData {
  counters: {
    perfis_publicados: number;
    perfis_rascunho: number;
    jobs_pendentes: number;
    jobs_falhos: number;
  };
  recentJobs: DashboardJob[];
  webhooks: WebhookInfo[];
}

function StatusPill({ s }: { s: JobStatus }) {
  const map: Record<JobStatus, string> = {
    queued: 'bg-amber-500/15 text-amber-400 border border-amber-400/30',
    running: 'bg-indigo-500/15 text-indigo-300 border border-indigo-400/30',
    completed: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
    failed: 'bg-rose-500/15 text-rose-300 border border-rose-400/30',
    cancelled: 'bg-slate-500/15 text-slate-300 border border-slate-400/30',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[s]}`}>{s}</span>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 ${className}`}>{children}</div>;
}

type StatProps = { label: string | number; value: string | number };
function Stat({ label, value }: StatProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-3xl font-semibold mt-1">{value}</span>
    </div>
  );
}

function statusDbToJobStatus(dbStatus?: string | null): JobStatus {
  switch ((dbStatus || '').toLowerCase()) {
    case 'published':
    case 'publicado':
      return 'completed';
    case 'draft':
    case 'rascunho':
      return 'queued';
    default:
      return 'queued';
  }
}

async function fetchData(): Promise<DashboardData> {
  const metrics = await getAdminMetrics();

  const { data: perfis } = await listProfiles({ page: 1, perPage: 12 });
  const recentJobs: DashboardJob[] = (perfis as Profile[]).map((p) => ({
    id: p.id,
    status: statusDbToJobStatus(p.status),
    nome: p.display_name ?? '(sem nome)',
    nicho: p.sector ?? '-',
    categoria: p.sector ?? '-',
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  const webhooks: WebhookInfo[] = [];
  const whGen =
    process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
    process.env.N8N_WEBHOOK_URL ||
    process.env.N8N_LUMINA_CREATE;
  if (whGen) webhooks.push({ id: 'wh1', name: 'n8n-generate', url: whGen, enabled: true });

  const whStories = process.env.NEXT_PUBLIC_N8N_WEBSTORIES_URL || process.env.N8N_WEBSTORIES_URL;
  if (whStories) webhooks.push({ id: 'wh2', name: 'n8n-webstories', url: whStories, enabled: true });

  const published = metrics.publishedProfiles ?? 0;
  const total = metrics.totalProfiles ?? 0;
  const drafts = Math.max(0, total - published);
  const pending = drafts;

  return {
    counters: {
      perfis_publicados: published,
      perfis_rascunho: drafts,
      jobs_pendentes: pending,
      jobs_falhos: 0,
    },
    recentJobs,
    webhooks,
  };
}

export default async function AdminDashboard() {
  // Guard extra: nunca renderizar no client
  if (typeof window !== 'undefined') {
    return (
      <div className="container py-10">
        <div className="text-rose-300">Este painel só pode rodar no servidor.</div>
      </div>
    );
  }

  let data: DashboardData | null = null;
  let error: string | null = null;

  try {
    data = await fetchData();
  } catch (e: any) {
    error = e?.message || 'Falha ao carregar';
  }

  if (error || !data) {
    return (
      <div className="container py-10">
        <div className="text-rose-300">Erro: {error}</div>
        <p className="text-white/60 mt-2 text-sm">
          Verifique as variáveis de NocoDB no <code>.env</code> (<code>NOCODB_BASE_URL</code>,{' '}
          <code>NOCODB_API_TOKEN</code>, <code>NOCODB_TABLE_ID</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="h-section text-3xl md:text-4xl">LUMINA · Admin</h1>
          <p className="text-white/70 mt-1">Visão geral dos perfis, jobs e webhooks</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a className="btn border-white/10 hover:bg-white/10" href="/admin">Atualizar</a>
          <a href="/admin/create" className="btn btn-primary">Novo Perfil</a>
          <a href="#actions" className="btn border-white/10 hover:bg-white/10">Disparar Job (n8n)</a>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card><Stat label="Publicados" value={data.counters.perfis_publicados} /></Card>
        <Card><Stat label="Rascunhos" value={data.counters.perfis_rascunho} /></Card>
        <Card><Stat label="Jobs pendentes" value={data.counters.jobs_pendentes} /></Card>
        <Card><Stat label="Jobs falhos" value={data.counters.jobs_falhos} /></Card>
      </div>

      {/* Grid principal */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Jobs recentes */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Jobs recentes</h2>
            <a className="text-sm text-indigo-300 hover:underline" href="#/jobs">ver todos</a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/60">
                  <th className="py-2 pr-4">Job</th>
                  <th className="py-2 pr-4">Perfil</th>
                  <th className="py-2 pr-4">Nicho</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Atualizado</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.recentJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-white/5">
                    <td className="py-3 pr-4 font-mono text-xs text-white/80">{j.id}</td>
                    <td className="py-3 pr-4 font-medium">{j.nome}</td>
                    <td className="py-3 pr-4 text-white/80">{j.nicho}</td>
                    <td className="py-3 pr-4"><StatusPill s={j.status} /></td>
                    <td className="py-3 pr-4 text-white/60">
                      {new Date(j.updated_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="btn border-white/10 hover:bg-white/10">Ver</button>
                        {j.status === 'failed' && (
                          <button className="btn border-rose-400/30 text-rose-300 hover:bg-rose-500/10">Reprocessar</button>
                        )}
                        {j.status === 'queued' && (
                          <button className="btn border-white/10 hover:bg-white/10">Cancelar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.recentJobs.length === 0 && (
                  <tr>
                    <td className="py-6 text-white/60" colSpan={6}>Nenhum registro por enquanto.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Webhooks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Webhooks</h2>
            <a className="text-sm text-indigo-300 hover:underline" href="#/settings">configurar</a>
          </div>
          <ul className="space-y-3">
            {data.webhooks.map((w) => (
              <li key={w.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-xs text-white/60 break-all">{w.url}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      w.enabled
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                        : 'bg-slate-500/15 text-slate-300 border border-slate-400/30'
                    }`}
                  >
                    {w.enabled ? 'ativo' : 'desativado'}
                  </span>
                </div>
              </li>
            ))}
            {data.webhooks.length === 0 && (
              <li className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm">
                Configure <code>NEXT_PUBLIC_N8N_WEBHOOK_URL</code> / <code>N8N_WEBHOOK_URL</code> ou{' '}
                <code>N8N_LUMINA_CREATE</code> no .env.local
              </li>
            )}
          </ul>
          <div className="mt-4">
            <button className="btn border-white/10 hover:bg-white/10 w-full" disabled>
              Adicionar webhook
            </button>
          </div>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div className="mt-8 grid md:grid-cols-3 gap-4" id="actions">
        <Card>
          <h3 className="font-semibold mb-2">Criar perfil rápido</h3>
          <p className="text-sm text-white/70 mb-3">Dispara um job no n8n com nome, nicho e categoria.</p>
          <a href="/admin/create" className="btn btn-primary w-full">Abrir formulário</a>
        </Card>
        <Card>
          <h3 className="font-semibold mb-2">Sincronizar imagens órfãs</h3>
          <p className="text-sm text-white/70 mb-3">Varre o storage e associa ao perfil correto.</p>
          <button className="btn border-white/10 hover:bg-white/10 w-full" disabled>Executar</button>
        </Card>
        <Card>
          <h3 className="font-semibold mb-2">Limpar jobs antigos</h3>
          <p className="text-sm text-white/70 mb-3">Remove jobs &gt; 30 dias (completed/failed).</p>
          <button className="btn border-white/10 hover:bg-white/10 w-full" disabled>Limpar</button>
        </Card>
      </div>
    </div>
  );
}
