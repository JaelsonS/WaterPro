"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

export function MagneticButton({
  variant = "primary",
  children,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.4, ease: "power2.out" });
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const variants = {
    primary:
      "bg-gradient-to-r from-azure to-ocean text-white shadow-[0_4px_20px_rgba(26,127,184,0.25)] hover:shadow-[0_8px_32px_rgba(26,127,184,0.35)]",
    secondary:
      "bg-white text-ink border border-slate-line shadow-sm hover:border-azure/30 hover:bg-sky/50 hover:shadow-md",
    ghost: "text-ink-muted hover:text-azure underline-offset-4 hover:underline",
  };

  return (
    <button
      ref={ref}
      data-magnetic
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium tracking-wide transition-all duration-300",
        variant !== "ghost" && "overflow-hidden",
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-r from-cyan/0 via-white/25 to-cyan/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
