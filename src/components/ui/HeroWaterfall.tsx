"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Cascata 3D no hero — folhas de água cristalina a descer pelas laterais.
 */
export function HeroWaterfall() {
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
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent?.clientWidth || window.innerWidth;
      h = parent?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const drawSheet = (side: "left" | "right", lane: number) => {
      const base = side === "left" ? w * (0.03 + lane * 0.025) : w * (0.97 - lane * 0.025);
      const sheetW = 14 + lane * 5;
      const segments = 36;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const p = i / segments;
        const y = p * h;
        const sway =
          Math.sin(t * 2.5 + p * 6 + lane + (side === "left" ? 0 : 2)) * (10 + lane * 3) +
          Math.sin(t * 1.4 + p * 3) * 4;
        const x = base + (side === "left" ? sway : -sway);
        const half = sheetW * (1 - p * 0.4) * 0.5;
        if (i === 0) ctx.moveTo(x + half, y);
        else ctx.lineTo(x + half, y);
      }
      for (let i = segments; i >= 0; i--) {
        const p = i / segments;
        const y = p * h;
        const sway =
          Math.sin(t * 2.5 + p * 6 + lane + (side === "left" ? 0 : 2)) * (10 + lane * 3) +
          Math.sin(t * 1.4 + p * 3) * 4;
        const x = base + (side === "left" ? sway : -sway);
        const half = sheetW * (1 - p * 0.4) * 0.5;
        ctx.lineTo(x - half, y);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(255,255,255,0.85)");
      grad.addColorStop(0.2, "rgba(186,230,253,0.55)");
      grad.addColorStop(0.6, "rgba(56,189,248,0.28)");
      grad.addColorStop(1, "rgba(14,165,233,0.05)");
      ctx.fillStyle = grad;
      ctx.fill();
    };

    const draw = (ts: number) => {
      t = ts * 0.001;
      ctx.clearRect(0, 0, w, h);

      for (let lane = 0; lane < 5; lane++) {
        drawSheet("left", lane);
        drawSheet("right", lane);
      }

      // Gotas a cair
      for (let i = 0; i < 18; i++) {
        const side = i % 2 === 0 ? "left" : "right";
        const xBase = side === "left" ? w * 0.06 : w * 0.94;
        const y = ((t * 180 + i * 47) % (h + 40)) - 20;
        const x = xBase + Math.sin(t * 3 + i) * 12;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
        g.addColorStop(0, "rgba(255,255,255,0.9)");
        g.addColorStop(1, "rgba(56,189,248,0)");
        ctx.beginPath();
        ctx.ellipse(x, y, 2, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (prefersReducedMotion()) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[2] opacity-40"
      aria-hidden="true"
    />
  );
}
