"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "fade";
}

/**
 * Reveal seguro para App Router: anima uma vez e limpa estilos ao desmontar,
 * para a navegação SPA nunca ficar com conteúdo invisível.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { clearProps: "all", opacity: 1, x: 0, y: 0 });
      return;
    }

    const from: gsap.TweenVars = { opacity: 0 };
    if (direction === "up") from.y = 36;
    if (direction === "left") from.x = -36;
    if (direction === "right") from.x = 36;

    gsap.set(el, from);

    const play = () => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.85,
        delay,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: play,
    });

    // Client navigation: se já está no viewport, anima de imediato
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
      if (inView) play();
    });

    return () => {
      st.kill();
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "all", opacity: 1, x: 0, y: 0 });
    };
  }, [delay, direction]);

  return (
    <div ref={ref} className={className} style={{ opacity: 1 }}>
      {children}
    </div>
  );
}
