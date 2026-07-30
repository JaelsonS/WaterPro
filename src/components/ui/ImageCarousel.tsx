"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

export interface CarouselSlide {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageCarouselProps {
  slides: CarouselSlide[];
  interval?: number;
  className?: string;
  imageClassName?: string;
  showCaptions?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  showCounter?: boolean;
  overlay?: "dark" | "gradient" | "hero" | "none";
  priority?: boolean;
  /** Embaralha a ordem ao montar e avança com ordem aleatória */
  shuffle?: boolean;
  /** Não pausa no hover — ideal para hero automático */
  autoplayLocked?: boolean;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function ImageCarousel({
  slides,
  interval = 6000,
  className,
  imageClassName,
  showCaptions = false,
  showDots = true,
  showArrows = true,
  showCounter = false,
  overlay = "gradient",
  priority = false,
  shuffle = false,
  autoplayLocked = false,
}: ImageCarouselProps) {
  const ordered = useMemo(
    () => (shuffle ? shuffleArray(slides) : slides),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shuffle once on mount / slides identity
    [slides, shuffle]
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    if (shuffle && ordered.length > 2) {
      setActive((i) => {
        let nextIdx = Math.floor(Math.random() * ordered.length);
        let guard = 0;
        while (nextIdx === i && guard < 8) {
          nextIdx = Math.floor(Math.random() * ordered.length);
          guard += 1;
        }
        return nextIdx;
      });
      return;
    }
    setActive((i) => (i + 1) % ordered.length);
  }, [ordered.length, shuffle]);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + ordered.length) % ordered.length);
  }, [ordered.length]);

  useEffect(() => {
    if ((!autoplayLocked && paused) || ordered.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [paused, interval, next, ordered.length, autoplayLocked]);

  if (ordered.length === 0) return null;

  return (
    <div
      className={cn("group relative overflow-hidden", className)}
      onMouseEnter={() => !autoplayLocked && setPaused(true)}
      onMouseLeave={() => !autoplayLocked && setPaused(false)}
      onFocus={() => !autoplayLocked && setPaused(true)}
      onBlur={() => !autoplayLocked && setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Galeria de imagens"
    >
      {ordered.map((slide, i) => (
        <div
          key={`${slide.src}-${i}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1600ms] ease-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={i !== active}
        >
          <SafeImage
            src={slide.src}
            alt={slide.alt}
            fill
            className={cn(
              "object-cover",
              i === active && "animate-[hero-kenburns_8s_ease-out_forwards]",
              imageClassName
            )}
            sizes="100vw"
            priority={priority && i === 0}
          />
        </div>
      ))}

      {overlay === "gradient" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/85 via-white/45 to-white/95" />
      )}
      {overlay === "dark" && (
        <div className="pointer-events-none absolute inset-0 bg-ink/20" />
      )}
      {overlay === "hero" && (
        <>
          {/* Topo suave para o header transparente “fazer parte” da imagem */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/35 via-white/10 to-transparent" />
          {/* Centro leve + base para legibilidade do título */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/25 to-white/88" />
        </>
      )}

      {showCaptions && ordered[active]?.caption && (
        <div className="absolute bottom-24 left-6 right-6 z-10 md:left-12 md:right-auto md:max-w-lg">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink md:text-3xl animate-fade-in drop-shadow-sm">
            {ordered[active].caption}
          </p>
        </div>
      )}

      {showArrows && ordered.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/70 text-lg text-ink shadow-md backdrop-blur-sm transition-all hover:border-azure hover:text-azure md:left-6"
            aria-label="Imagem anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/70 text-lg text-ink shadow-md backdrop-blur-sm transition-all hover:border-azure hover:text-azure md:right-6"
            aria-label="Imagem seguinte"
          >
            →
          </button>
        </>
      )}

      {(showDots || showCounter) && ordered.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
          {showCounter && (
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium tracking-wide text-ink shadow-sm backdrop-blur-sm">
              {active + 1} / {ordered.length}
            </span>
          )}
          {showDots && (
            <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm backdrop-blur-md">
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
      )}
    </div>
  );
}
