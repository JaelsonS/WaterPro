"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils";

export function WaterFlowOverlay({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const streams = Array.from({ length: 24 }, (_, i) => ({
      x: (i / 24) * 1,
      speed: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      width: 1 + Math.random() * 2,
      opacity: 0.04 + Math.random() * 0.08,
    }));

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w;
      canvas.height = h;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const t = time * 0.001;

      for (const stream of streams) {
        const x = stream.x * w + Math.sin(t * stream.speed + stream.phase) * 30;
        const grad = ctx.createLinearGradient(x, 0, x, h);
        grad.addColorStop(0, `rgba(78, 205, 196, 0)`);
        grad.addColorStop(0.3, `rgba(78, 205, 196, ${stream.opacity})`);
        grad.addColorStop(0.7, `rgba(26, 127, 184, ${stream.opacity * 0.8})`);
        grad.addColorStop(1, `rgba(78, 205, 196, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = stream.width;
        ctx.beginPath();
        ctx.moveTo(x, -20);
        for (let y = 0; y <= h + 20; y += 12) {
          ctx.lineTo(
            x + Math.sin(t * stream.speed * 2 + y * 0.02 + stream.phase) * 8,
            y
          );
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-[2] mix-blend-screen opacity-60 ${className}`}
      aria-hidden="true"
    />
  );
}
