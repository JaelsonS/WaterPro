"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const uniqueImages = [...new Set(images)].filter((img) => !img.match(/600x\d+/));
  const displayImages = uniqueImages.length > 0 ? uniqueImages : images;

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          className="relative aspect-square w-full overflow-hidden rounded-2xl bg-ice/50 cursor-zoom-in"
          onClick={() => setLightbox(true)}
          aria-label={`Ampliar imagem de ${productName}`}
        >
          <SafeImage
            src={displayImages[active] || displayImages[0]}
            alt={productName}
            fill
            className="object-contain p-8 transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </button>

        {displayImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {displayImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                  active === i ? "border-azure" : "border-slate-line hover:border-white/30"
                )}
                aria-label={`Imagem ${i + 1}`}
              >
                <SafeImage src={img} alt="" fill className="object-contain p-2" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria ampliada"
        >
          <button
            className="absolute top-6 right-6 text-ink-soft hover:text-ink"
            onClick={() => setLightbox(false)}
            aria-label="Fechar"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <SafeImage
              src={displayImages[active] || displayImages[0]}
              alt={productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {displayImages.length > 1 && (
            <div className="absolute bottom-8 flex gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((a) => (a - 1 + displayImages.length) % displayImages.length);
                }}
                className="rounded-full glass-panel px-4 py-2 text-ink"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((a) => (a + 1) % displayImages.length);
                }}
                className="rounded-full glass-panel px-4 py-2 text-ink"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
