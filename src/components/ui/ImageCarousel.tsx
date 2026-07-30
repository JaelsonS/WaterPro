"use client";

import { useCallback, useEffect, useState } from "react";
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
  overlay?: "dark" | "gradient" | "none";
  priority?: boolean;
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
}: ImageCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [paused, interval, next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className={cn("group relative overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Galeria de imagens"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 transition-all duration-[1800ms] ease-out",
            i === active ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          aria-hidden={i !== active}
        >
          <SafeImage
            src={slide.src}
            alt={slide.alt}
            fill
            className={cn("object-cover", imageClassName)}
            sizes="100vw"
            priority={priority && i === 0}
          />
        </div>
      ))}

      {overlay === "gradient" && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/45 to-white/95 pointer-events-none" />
      )}
      {overlay === "dark" && (
        <div className="absolute inset-0 bg-ink/20 pointer-events-none" />
      )}

      {showCaptions && slides[active]?.caption && (
        <div className="absolute bottom-24 left-6 right-6 z-10 md:left-12 md:right-auto md:max-w-lg">
          <p className="font-[family-name:var(--font-display)] text-2xl font-light text-ink md:text-3xl animate-fade-in drop-shadow-sm">
            {slides[active].caption}
          </p>
        </div>
      )}

      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-line bg-white/90 text-lg text-ink shadow-md backdrop-blur-sm transition-all hover:border-azure hover:text-azure md:left-6 md:h-12 md:w-12"
            aria-label="Imagem anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-line bg-white/90 text-lg text-ink shadow-md backdrop-blur-sm transition-all hover:border-azure hover:text-azure md:right-6 md:h-12 md:w-12"
            aria-label="Imagem seguinte"
          >
            →
          </button>
        </>
      )}

      {(showDots || showCounter) && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
          {showCounter && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-ink shadow-sm backdrop-blur-sm">
              {active + 1} / {slides.length}
            </span>
          )}
          {showDots && (
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
              {slides.map((_, i) => (
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
                  aria-label={`Ir para imagem ${i + 1} de ${slides.length}`}
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
