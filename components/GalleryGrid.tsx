// components/GalleryGrid.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type Photo = { image_url: string; alt?: string };

type Props = { photos: Photo[] };

export default function GalleryGrid({ photos }: Props) {
  const items = (photos || []).slice(0, 8);

  const [isOpen, setIsOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  const resetTransform = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setPanning(false);
    startRef.current = null;
  };
  const open = (i: number) => { setIdx(i); setIsOpen(true); resetTransform(); };
  const close = () => { setIsOpen(false); resetTransform(); };
  const next = () => { setIdx((v) => (v + 1) % items.length); resetTransform(); };
  const prev = () => { setIdx((v) => (v - 1 + items.length) % items.length); resetTransform(); };

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const step = delta > 0 ? 0.1 : -0.1;
    setScale((s) => clamp(Number((s + step).toFixed(2)), 1, 4));
  };
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (scale === 1) return;
    setPanning(true);
    startRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!panning || !startRef.current) return;
    setOffset({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  };
  const onMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    setPanning(false);
    startRef.current = null;
  };
  const onDoubleClick = () => {
    setScale((s) => (s === 1 ? 2 : 1));
    if (scale === 1) setOffset({ x: 0, y: 0 });
  };

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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  return (
    <>
      {/* Grade 2x4 com altura fixa por tile */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {items.map((ph, i) => (
          <button
            key={i}
            onClick={() => open(i)}
            aria-label={`Abrir foto ${i + 1}`}
            className="group relative w-full h-56 md:h-64 overflow-hidden rounded-2xl"
          >
            <img
              src={ph.image_url}
              alt={ph.alt || `Foto ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Lightbox centralizado via portal */}
      {isOpen && typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/80"
            role="dialog"
            aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          >
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

            <div
              className="absolute inset-0 flex items-center justify-center p-4 select-none"
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onDoubleClick={onDoubleClick}
            >
              <div
                className="will-change-transform transition-transform duration-75 cursor-grab active:cursor-grabbing"
                style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}
              >
                <img
                  src={items[idx]?.image_url}
                  alt={items[idx]?.alt || `Foto ${idx + 1}`}
                  className="max-h-[92dvh] max-w-[95vw] object-contain m-0"
                  draggable={false}
                />
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 text-white rounded-full px-3 py-1.5">
              <button className="px-2 py-1 hover:bg-white/20 rounded" onClick={() => setScale((s) => clamp(Number((s - 0.1).toFixed(2)), 1, 4))} aria-label="Diminuir zoom">−</button>
              <span className="tabular-nums text-sm w-14 text-center">{Math.round(scale * 100)}%</span>
              <button className="px-2 py-1 hover:bg-white/20 rounded" onClick={() => setScale((s) => clamp(Number((s + 0.1).toFixed(2)), 1, 4))} aria-label="Aumentar zoom">+</button>
              <button className="ml-2 px-2 py-1 hover:bg-white/20 rounded" onClick={resetTransform} aria-label="Resetar zoom">Reset</button>
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}
