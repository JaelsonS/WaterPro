"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type Side = "left" | "right";

interface Ribbon {
  side: Side;
  offset: number;
  width: number;
  phase: number;
  speed: number;
}

interface Drop {
  side: Side;
  x: number;
  y: number;
  vy: number;
  size: number;
  life: number;
}

/**
 * Cascata cristalina nas laterais — folhas de água largas, brilho e respingos.
 * Fica nas margens (não atravessa o centro / vídeos).
 */
export function CrystalWaterScroll() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let time = 0;
    const ribbons: Ribbon[] = [];
    const drops: Drop[] = [];

    const buildRibbons = () => {
      ribbons.length = 0;
      for (const side of ["left", "right"] as Side[]) {
        for (let i = 0; i < 7; i++) {
          ribbons.push({
            side,
            offset: 0.02 + i * 0.018,
            width: 10 + (i % 3) * 6,
            phase: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 0.6,
          });
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildRibbons();
    };

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    resize();
    window.addEventListener("resize", resize);

    const laneX = (side: Side, offset: number, y: number, t: number) => {
      const edge = side === "left" ? w * offset : w * (1 - offset);
      const sway =
        Math.sin(t * 2.2 + y * 0.012 + offset * 20) * 8 +
        Math.sin(t * 1.1 + y * 0.006) * 4;
      const x = edge + (side === "left" ? sway : -sway);
      const maxInner = side === "left" ? w * 0.18 : w * 0.82;
      return side === "left" ? Math.min(x, maxInner) : Math.max(x, maxInner);
    };

    const drawRibbon = (r: Ribbon, progress: number, t: number) => {
      const length = Math.min(h * 0.98, h * (0.35 + progress * 0.65));
      const segments = 48;
      const points: { x: number; y: number }[] = [];

      for (let i = 0; i <= segments; i++) {
        const p = i / segments;
        const y = p * length;
        const x = laneX(r.side, r.offset, y, t * r.speed + r.phase);
        points.push({ x, y });
      }

      const opacity = 0.28 + progress * 0.35;
      const grad = ctx.createLinearGradient(0, 0, 0, length);
      grad.addColorStop(0, `rgba(255,255,255,${0.95 * opacity})`);
      grad.addColorStop(0.15, `rgba(224,242,254,${0.75 * opacity})`);
      grad.addColorStop(0.5, `rgba(125,211,252,${0.45 * opacity})`);
      grad.addColorStop(0.85, `rgba(56,189,248,${0.22 * opacity})`);
      grad.addColorStop(1, `rgba(14,165,233,0)`);

      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const half = (r.width / 2) * (1 - (i / segments) * 0.35);
        const px = points[i].x + half;
        if (i === 0) ctx.moveTo(px, points[i].y);
        else ctx.lineTo(px, points[i].y);
      }
      for (let i = points.length - 1; i >= 0; i--) {
        const half = (r.width / 2) * (1 - (i / segments) * 0.35);
        ctx.lineTo(points[i].x - half, points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Brilho cristalino
      ctx.beginPath();
      ctx.moveTo(points[0].x - r.width * 0.15, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x - r.width * 0.15, points[i].y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.55 * opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const spawnDrops = (progress: number) => {
      if (drops.length > 80) return;
      if (Math.random() > 0.35 + progress * 0.3) return;
      const side: Side = Math.random() > 0.5 ? "left" : "right";
      const offset = 0.04 + Math.random() * 0.1;
      drops.push({
        side,
        x: laneX(side, offset, 0, time),
        y: -10,
        vy: 2.5 + Math.random() * 3.5,
        size: 1.5 + Math.random() * 2.5,
        life: 1,
      });
    };

    const drawDrops = () => {
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.vy;
        d.x += Math.sin(time * 3 + d.y * 0.02) * 0.4;
        d.life -= 0.004;
        if (d.y > h || d.life <= 0) {
          drops.splice(i, 1);
          continue;
        }
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 2);
        g.addColorStop(0, `rgba(255,255,255,${0.85 * d.life})`);
        g.addColorStop(0.5, `rgba(186,230,253,${0.45 * d.life})`);
        g.addColorStop(1, "rgba(56,189,248,0)");
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.size * 0.7, d.size * 1.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    };

    const drawMist = (side: Side, progress: number) => {
      const x0 = side === "left" ? 0 : w * 0.82;
      const mistW = w * 0.18;
      const mist = ctx.createLinearGradient(x0, 0, x0 + mistW, 0);
      if (side === "left") {
        mist.addColorStop(0, `rgba(186,230,253,${0.18 + progress * 0.12})`);
        mist.addColorStop(1, "rgba(186,230,253,0)");
      } else {
        mist.addColorStop(0, "rgba(186,230,253,0)");
        mist.addColorStop(1, `rgba(186,230,253,${0.18 + progress * 0.12})`);
      }
      ctx.fillStyle = mist;
      ctx.fillRect(x0, 0, mistW, h);
    };

    const draw = (ts: number) => {
      time = ts * 0.001;
      ctx.clearRect(0, 0, w, h);
      const progress = Math.max(0.25, progressRef.current);

      drawMist("left", progress);
      drawMist("right", progress);

      for (const r of ribbons) {
        drawRibbon(r, progress, time);
      }

      spawnDrops(progress);
      drawDrops();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      st.kill();
    };
  }, []);

  if (prefersReducedMotion()) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[3]"
      aria-hidden="true"
    />
  );
}
