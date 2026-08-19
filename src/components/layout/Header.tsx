"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { buildGeneralWhatsAppUrl } from "@/lib/config";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");
  const locale = useLocale() as "pt" | "en";
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [immersive, setImmersive] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const hero = document.querySelector("[data-hero-section]") as HTMLElement | null;
      const heroHeight = hero?.offsetHeight ?? window.innerHeight;
      const inHero = scrollTop < heroHeight - 80;

      setImmersive(inHero);
      setScrolled(scrollTop > 20);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const navItems = [
    { href: "/", label: t("start"), isPage: true },
    { href: "/para-sua-casa", label: t("home"), isPage: true },
    { href: "/para-a-sua-empresa", label: t("business"), isPage: true },
    { href: "/sobre", label: t("about"), isPage: true },
    { href: "/#contact", label: t("contact"), isPage: false },
  ];

  const isHome = pathname === "/";

  const handleCta = () => {
    if (isHome) {
      window.open(buildGeneralWhatsAppUrl(locale), "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = "/#contact";
  };

  const linkClass = (href: string) =>
    cn(
      "text-sm font-medium transition-colors duration-300",
      immersive && "drop-shadow-[0_1px_10px_rgba(255,255,255,0.75)]",
      pathname === href || (href === "/" && isHome)
        ? "text-azure"
        : immersive
          ? "text-ink hover:text-azure"
          : "text-ink-soft hover:text-azure"
    );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 isolate transition-all duration-700 ease-out",
        immersive ? "header-immersive py-6" : "header-glass py-3"
      )}
      style={{ transform: "translateZ(0)" }}
    >
      <div
        ref={progressRef}
        className={cn(
          "absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-azure via-cyan to-azure transition-[width,opacity] duration-150",
          scrolled && !immersive ? "opacity-100" : "opacity-0"
        )}
        style={{ width: "0%" }}
        role="progressbar"
        aria-hidden={immersive || !scrolled}
        aria-label={tA11y("scrollProgress")}
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="WaterPro">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-azure/20 to-cyan/20 group-hover:from-azure/30 group-hover:to-cyan/30 transition-opacity" />
            <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a7fb8" />
                  <stop offset="100%" stopColor="#4ecdc4" />
                </linearGradient>
              </defs>
              <path
                d="M20 4C20 4 8 18 8 26C8 32.627 13.373 38 20 38C26.627 38 32 32.627 32 26C32 18 20 4 20 4Z"
                fill="url(#logoGrad)"
              />
              <ellipse cx="16" cy="24" rx="3" ry="5" fill="white" opacity="0.4" />
            </svg>
          </div>
          <span
            className={cn(
              "font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink transition-all",
              immersive && "drop-shadow-[0_1px_12px_rgba(255,255,255,0.85)]"
            )}
          >
            Water<span className="text-azure">Pro</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:gap-7 lg:flex" aria-label="Main navigation">
          {navItems.map((item) =>
            item.isPage ? (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ) : (
              <a key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher variant={immersive ? "light" : "default"} />
          <MagneticButton variant="primary" className="!px-6 !py-3 !text-xs" onClick={handleCta}>
            {t("cta")}
          </MagneticButton>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? tA11y("menuClose") : tA11y("menuOpen")}
          aria-expanded={menuOpen}
        >
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "block h-0.5 w-6 bg-ink transition-all duration-300",
                  menuOpen && i === 0 && "translate-y-2 rotate-45",
                  menuOpen && i === 1 && "opacity-0",
                  menuOpen && i === 2 && "-translate-y-2 -rotate-45"
                )}
              />
            ))}
          </div>
        </button>
      </div>

      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-500",
          menuOpen ? "max-h-[560px] opacity-100 border-t border-slate-line bg-white/95 backdrop-blur-xl" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-4 px-6 py-6" aria-label="Mobile navigation">
          {navItems.map((item) =>
            item.isPage ? (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-ink-soft transition-colors hover:text-azure"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-ink-soft transition-colors hover:text-azure"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            )
          )}
          <LanguageSwitcher className="px-2" />
          <MagneticButton
            variant="primary"
            className="w-full"
            onClick={() => {
              setMenuOpen(false);
              handleCta();
            }}
          >
            {t("cta")}
          </MagneticButton>
        </nav>
      </div>
    </header>
  );
}
