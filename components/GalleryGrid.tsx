// components/GalleryGrid.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Photo = { image_url: string; alt?: string };

export default function GalleryGrid({ photos }: { photos: Photo[] }) {
  const items = (photos || []).slice(0, 8);

  const [isOpen, setIsOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // zoom/pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const open = (i: number) => {
    setIdx(i);
    setIsOpen(true);
    resetTransform();
  };

  const close = () => {
    setIsOpen(false);
    resetTransform();
  };

  const next = () => {
    setIdx((v) => (v + 1) % items.length);
    resetTransform();
  };

  const prev = () => {
    setIdx((v) => (v - 1 + items.length) % items.length);
    resetTransform();
  };

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const resetTransform = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setPanning(false);
    startRef.current = null;
  };

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    // zoom with wheel (trackpads too)
    e.preventDefault();
    const delta = -e.deltaY; // up = zoom in
    const zoomStep = delta > 0 ? 0.1 : -0.1;
    setScale((s) => clamp(Number((s + zoomStep).toFixed(2)), 1, 4));
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (scale === 1) return;
    setPanning(true);
    startRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!panning || !startRef.current) return;
    setOffset({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
    });
  };

  const onMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    setPanning(false);
    startRef.current = null;
  };

  const onDoubleClick = () => {
    setScale((s) => (s === 1 ? 2 : 1));
    if (scale === 1) setOffset({ x: 0, y: 0 });
  };

  // keyboard: esc/←/→/+/-/0
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "+" || e.key === "=") setScale((s) => clamp(s + 0.1, 1, 4));
      else if (e.key === "-") setScale((s) => clamp(s - 0.1, 1, 4));
      else if (e.key === "0") resetTransform();
    };
    document.addEventListener("keydown", onKey);
    // lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((ph, i) => (
          <button
            key={i}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
            onClick={() => open(i)}
            aria-label={`Abrir foto ${i + 1}`}
          >
            <img
              src={ph.image_url}
              alt={ph.alt || `Foto ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {isOpen && items[idx] && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            // fecha ao clicar fora do conteúdo
            if (e.target === e.currentTarget) close();
          }}
        >
          {/* Controles */}
          <button
            onClick={close}
            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-sm"
            aria-label="Fechar"
          >
            Fechar ✕
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-2"
                aria-label="Anterior"
              >
                ←
              </button>
              <button
                onClick={next}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-2"
                aria-label="Próxima"
              >
                →
              </button>
            </>
          )}

          {/* Área de imagem com zoom/pan */}
          <div
            className="relative max-w-[95vw] max-h-[90vh] w-full h-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onDoubleClick={onDoubleClick}
          >
            <div
              className="will-change-transform transition-transform duration-75"
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
              }}
            >
              <img
                src={items[idx].image_url}
                alt={items[idx].alt || `Foto ${idx + 1}`}
                className="max-h-[90vh] max-w-[95vw] object-contain"
                draggable={false}
              />
            </div>
          </div>

          {/* Barra de zoom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 text-white rounded-full px-3 py-1.5">
            <button
              className="px-2 py-1 hover:bg-white/20 rounded"
              onClick={() => setScale((s) => clamp(Number((s - 0.1).toFixed(2)), 1, 4))}
              aria-label="Diminuir zoom"
            >
              −
            </button>
            <span className="tabular-nums text-sm w-14 text-center">{Math.round(scale * 100)}%</span>
            <button
              className="px-2 py-1 hover:bg-white/20 rounded"
              onClick={() => setScale((s) => clamp(Number((s + 0.1).toFixed(2)), 1, 4))}
              aria-label="Aumentar zoom"
            >
              +
            </button>
            <button
              className="ml-2 px-2 py-1 hover:bg-white/20 rounded"
              onClick={resetTransform}
              aria-label="Resetar zoom"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </>
  );
}
