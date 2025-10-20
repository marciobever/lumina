"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

type Phase = "idle" | "sending" | "processing" | "watching" | "done" | "error";

const INPUT =
  "px-3 py-2 rounded-lg bg-slate-900/70 text-slate-50 placeholder-slate-300/50 " +
  "border border-slate-700/50 outline-none focus:ring-2 focus:ring-fuchsia-400/40 focus:border-fuchsia-400/40";

const CARD =
  "rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-sm p-5";

export default function NovoPerfilForm() {
  const [pending, start] = useTransition();
  const [phase, setPhase] = useState<Phase>("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [slugFound, setSlugFound] = useState<string | null>(null);
  const [sectorWatched, setSectorWatched] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!pending && (phase === "idle" || phase === "done" || phase === "error")) {
      setProgress(0);
      return;
    }
    let raf: number, cur = progress;
    const cap = phase === "watching" ? 92 : 75;
    const step = phase === "watching" ? 0.15 : 0.6;
    const tick = () => { cur = Math.min(cap, cur + step); setProgress(cur); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, phase]);

  async function pollUntilPublished(sector: string, startedAt: number) {
    setPhase("watching");
    setMsg("Gerando conteúdo… acompanhando publicação");
    const deadline = Date.now() + 5 * 60_000;
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`/api/profiles?perPage=1&status=published&sector=${encodeURIComponent(sector)}`, { cache: "no-store" });
        const j = await r.json();
        const it = j?.items?.[0];
        if (it) {
          const created = new Date(it.created_at).getTime();
          if (created >= startedAt - 30_000) {
            setSlugFound(it.slug || null);
            setPhase("done");
            setMsg("Perfil publicado com sucesso!");
            setProgress(100);
            return;
          }
        }
      } catch {}
      // eslint-disable-next-line no-await-in-loop
      await new Promise(res => setTimeout(res, 3500));
    }
    setPhase("done");
    setMsg("Job finalizado (não consegui detectar o slug automaticamente).");
    setProgress(100);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    const fd = new FormData(e.currentTarget);
    const sector = String(fd.get("sector") || "").trim();
    const locale = String(fd.get("locale") || "pt-BR");
    if (!sector) { setMsg("Informe o nicho/sector."); submittingRef.current = false; return; }

    const ageRaw = Number(fd.get("age") || 0) || undefined;
    const age = ageRaw && ageRaw < 25 ? 25 : ageRaw || undefined;
    const eye_color  = (String(fd.get("eye_color")  || "").trim() || undefined);
    const ethnicity  = (String(fd.get("ethnicity")  || "").trim() || undefined);
    const skin_color = (String(fd.get("skin_color") || "").trim() || undefined);

    const payload: Record<string, any> = { sector, locale };
    if (age) payload.age = age;
    if (eye_color) payload.eye_color = eye_color;
    if (ethnicity) payload.ethnicity = ethnicity;
    if (skin_color) payload.skin_color = skin_color;

    start(async () => {
      try {
        setSlugFound(null);
        setSectorWatched(sector);
        setPhase("sending");
        setMsg("Enviando job para o n8n…");
        const startedAt = Date.now();

        const res = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });

        setPhase("processing");
        const out = await res.json().catch(() => ({} as any));
        if (!res.ok) { setPhase("error"); throw new Error(out?.error || res.statusText || "Falha"); }

        const maybeSlug = out?.slug || out?.data?.slug || null;
        if (maybeSlug) {
          setSlugFound(String(maybeSlug));
          setPhase("done");
          setMsg("Perfil publicado com sucesso!");
          setProgress(100);
        } else {
          await pollUntilPublished(sector, startedAt);
        }

        (e.target as HTMLFormElement).reset();
      } catch (err: any) {
        setPhase("error");
        setMsg(`Erro: ${err.message || String(err)}`);
      } finally {
        submittingRef.current = false;
      }
    });
  }

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case "idle": return "";
      case "sending": return "Enviando…";
      case "processing": return "Processando no n8n…";
      case "watching": return "Gerando conteúdo…";
      case "done": return "Concluído";
      case "error": return "Erro";
      default: return "";
    }
  }, [phase]);

  return (
    <div className="grid gap-6">
      {/* FORM CARD */}
      <div className={CARD}>
        <form onSubmit={onSubmit} className="grid gap-4 max-w-xl">
          <h2 className="text-2xl font-semibold text-slate-50">Novo Perfil</h2>

          {/* Obrigatórios */}
          <input name="sector" placeholder="Nicho/Setor (ex.: Finanças)" className={INPUT} required />
          <select name="locale" className={INPUT} defaultValue="pt-BR">
            <option value="pt-BR">pt-BR</option>
            <option value="pt-PT">pt-PT</option>
          </select>

          {/* Hints */}
          <div className="grid grid-cols-2 gap-3">
            <input name="age" type="number" min={25} max={55} placeholder="Idade (≥25)" className={INPUT} />
            <input name="eye_color" placeholder="Cor dos olhos" className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="ethnicity" placeholder="Etnia" className={INPUT} />
            <input name="skin_color" placeholder="Cor da pele" className={INPUT} />
          </div>

          <button
            type="submit"
            className={`relative inline-flex items-center justify-center px-4 py-2 rounded-xl
              font-medium shadow-sm transition
              ${pending ? "opacity-70 cursor-not-allowed" : "hover:brightness-110"}
              bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white
            `}
            disabled={pending || phase === "watching"}
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                {phaseLabel || "Enviando…"}
              </span>
            ) : (
              "Criar perfil"
            )}
          </button>

          {(pending || phase === "watching") && (
            <div className="h-1 bg-slate-700/40 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                style={{ width: `${Math.round(progress)}%`, transition: "width 200ms linear" }}
              />
            </div>
          )}

          {msg && (
            <div className={`text-sm ${phase === "error" ? "text-rose-300" : "text-emerald-300"}`}>
              {msg}
            </div>
          )}
        </form>
      </div>

      {/* MONITOR CARD */}
      {(pending || phase !== "idle") && (
        <div className={CARD}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-50">Monitor</h3>
            <span className="text-xs text-slate-300/70">{phaseLabel}</span>
          </div>

          <ol className="mt-3 space-y-2 text-sm">
            <li className={`${["sending","processing","watching","done"].includes(phase) ? "text-slate-100" : "text-slate-300/70"}`}>1) Job enviado ao n8n</li>
            <li className={`${["processing","watching","done"].includes(phase) ? "text-slate-100" : "text-slate-300/70"}`}>2) Pipeline em execução</li>
            <li className={`${["watching","done"].includes(phase) ? "text-slate-100" : "text-slate-300/70"}`}>3) Publicando no Supabase</li>
            <li className={`${phase === "done" ? "text-emerald-300" : "text-slate-300/70"}`}>4) Finalizado</li>
          </ol>

          <div className="mt-3 text-sm">
            {slugFound ? (
              <div className="space-y-1 text-slate-100">
                <div>
                  <span className="text-slate-300/80">Slug:</span>{" "}
                  <code className="px-2 py-1 bg-slate-900/80 border border-slate-700/50 rounded">{slugFound}</code>
                </div>
                <a className="text-indigo-300 hover:underline" href={`/perfis/${slugFound}`}>
                  Ver perfil
                </a>
              </div>
            ) : (
              <div className="text-slate-300/80">
                {sectorWatched ? <>Aguardando publicação em <strong>{sectorWatched}</strong>…</> : <>Aguardando…</>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}