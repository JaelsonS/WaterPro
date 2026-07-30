"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
}

interface HeroBackdropProps {
  slides: HeroSlide[];
  interval?: number;
  className?: string;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fundo full-bleed do hero — CSS background-image (visível de imediato,
 * sem depender de next/image fill).
 */
export function HeroBackdrop({
  slides,
  interval = 5500,
  className,
}: HeroBackdropProps) {
  const ordered = useMemo(() => shuffleArray(slides), [slides]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (ordered.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => {
        let next = Math.floor(Math.random() * ordered.length);
        let guard = 0;
        while (next === i && guard < 8) {
          next = Math.floor(Math.random() * ordered.length);
          guard += 1;
        }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [interval, ordered.length]);

  useEffect(() => {
    ordered.forEach((slide, i) => {
      const img = new window.Image();
      img.onload = () => setReady((prev) => ({ ...prev, [i]: true }));
      img.src = slide.src;
    });
  }, [ordered]);

  if (ordered.length === 0) return null;

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Imagens de destaque"
    >
      {/* Fallback de atmosfera enquanto carrega */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky via-mist-blue to-cyan/40" />

      {ordered.map((slide, i) => (
        <div
          key={`${slide.src}-${i}`}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-out",
            i === active && ready[i] ? "opacity-100" : "opacity-0",
            i === active && ready[i] && "animate-[hero-kenburns_10s_ease-out_forwards]"
          )}
          style={{ backgroundImage: `url("${slide.src}")` }}
          role="img"
          aria-label={slide.alt}
          aria-hidden={i !== active}
        />
      ))}

      {/* Overlay forte no centro — texto legível, imagem ainda presente */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-white/80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_45%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.2)_55%,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/55 to-transparent" />

      {ordered.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/75 px-3 py-2 shadow-sm backdrop-blur-md">
          {ordered.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full transition-all duration-500",
                i === active
                  ? "h-2.5 w-8 bg-azure"
                  : "h-2.5 w-2.5 bg-ink/25 hover:bg-azure/50"
              )}
              aria-label={`Ir para imagem ${i + 1} de ${ordered.length}`}
              aria-current={i === active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
