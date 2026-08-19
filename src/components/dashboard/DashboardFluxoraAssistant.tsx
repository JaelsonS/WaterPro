"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type AssistantStep = "welcome" | "menu" | "gettingStarted" | "mfa" | "whatsapp" | "sellers";

interface ChatMessage {
  id: string;
  from: "assistant" | "user";
  text: string;
}

interface QuickOption {
  id: string;
  label: string;
  userText?: string;
  step?: AssistantStep;
  href?: string;
}

function FluxoraAvatar({ size = "lg" }: { size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-14 w-14" : "h-10 w-10";
  const text = size === "lg" ? "text-lg" : "text-sm";
  return (
    <div
      className={cn(
        dim,
        text,
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-azure to-sky font-semibold text-white shadow-inner"
      )}
      aria-hidden
    >
      F
    </div>
  );
}

function contextStep(pathname: string | null): AssistantStep {
  if (!pathname) return "welcome";
  if (pathname.includes("/dashboard/whatsapp")) return "whatsapp";
  if (pathname.includes("/dashboard/vendedores")) return "sellers";
  if (pathname.includes("/dashboard/definicoes")) return "mfa";
  return "welcome";
}

export function DashboardFluxoraAssistant() {
  const t = useTranslations("fluxoraAssistant");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [step, setStep] = useState<AssistantStep>("welcome");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const showLabel = (hovered || focused) && !open;

  const nextId = () => {
    idRef.current += 1;
    return String(idRef.current);
  };

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const addAssistantMessage = useCallback(
    (text: string, delay = 500) => {
      setTyping(true);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: nextId(), from: "assistant", text }]);
          setTyping(false);
          scrollToBottom();
          resolve();
        }, delay);
      });
    },
    [scrollToBottom]
  );

  const addUserMessage = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { id: nextId(), from: "user", text }]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const reset = useCallback(() => {
    setStep("welcome");
    setMessages([]);
    idRef.current = 0;
  }, []);

  const openChat = useCallback(async () => {
    setOpen(true);
    if (messages.length > 0) return;

    const initial = contextStep(pathname);
    if (initial === "welcome") {
      await addAssistantMessage(t("welcome"), 350);
    } else {
      await addAssistantMessage(t(`context.${initial}`), 350);
    }
    setStep("menu");
    await addAssistantMessage(t("steps.menu"), 300);
  }, [addAssistantMessage, messages.length, pathname, t]);

  const showStep = useCallback(
    async (next: AssistantStep, href?: string) => {
      setStep(next);
      await addAssistantMessage(t(`steps.${next}`));
      if (href) {
        router.push(href);
      }
    },
    [addAssistantMessage, router, t]
  );

  const handleOption = async (option: QuickOption) => {
    addUserMessage(option.userText || option.label);

    if (option.href && option.step) {
      await showStep(option.step, option.href);
      return;
    }

    if (option.step) {
      await showStep(option.step);
    }
  };

  const getOptions = (): QuickOption[] => {
    if (step === "menu" || step === "welcome") {
      return [
        {
          id: "gettingStarted",
          label: t("options.gettingStarted"),
          step: "gettingStarted",
          userText: t("options.gettingStarted"),
        },
        {
          id: "mfa",
          label: t("options.mfa"),
          step: "mfa",
          href: "/dashboard/definicoes",
          userText: t("options.mfa"),
        },
        {
          id: "whatsapp",
          label: t("options.whatsapp"),
          step: "whatsapp",
          href: "/dashboard/whatsapp",
          userText: t("options.whatsapp"),
        },
        {
          id: "sellers",
          label: t("options.sellers"),
          step: "sellers",
          href: "/dashboard/vendedores",
          userText: t("options.sellers"),
        },
      ];
    }

    return [
      {
        id: "menu",
        label: t("options.back"),
        step: "menu",
        userText: t("options.back"),
      },
      {
        id: "restart",
        label: t("options.restart"),
        step: "welcome",
        userText: t("options.restart"),
      },
    ];
  };

    <>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : void openChat())}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "fixed bottom-6 right-6 z-[90] flex items-center rounded-full transition-all duration-500",
          "shadow-[0_8px_32px_rgba(26,127,184,0.2)] hover:shadow-[0_12px_40px_rgba(26,127,184,0.28)] hover:scale-105",
          open
            ? "bg-white p-3 text-ink-muted ring-1 ring-slate-line"
            : "bg-white p-1.5 ring-1 ring-slate-line"
        )}
        aria-label={open ? t("close") : t("open")}
        aria-expanded={open}
      >
        {!open ? (
          <>
            <FluxoraAvatar size="lg" />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-sm font-medium text-ink transition-all duration-300 ease-out",
                showLabel ? "max-w-[180px] opacity-100 pr-4 pl-1" : "max-w-0 opacity-0"
              )}
              aria-hidden={!showLabel}
            >
              {t("fab")}
            </span>
          </>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-[90] flex w-[min(100vw-3rem,400px)] flex-col overflow-hidden rounded-3xl border border-slate-line bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition-all duration-500",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
        )}
        role="dialog"
        aria-label={t("title")}
        aria-hidden={!open}
      >
        <div className="flex items-center gap-3 border-b border-slate-line bg-gradient-to-r from-sky/50 to-mist-blue/30 px-5 py-4">
          <FluxoraAvatar size="md" />
          <div>
            <p className="font-medium text-ink">{t("name")}</p>
            <p className="text-xs text-azure">{t("role")}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-xs text-ink-muted hover:text-ink"
          >
            {t("reset")}
          </button>
        </div>

        <div ref={listRef} className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto bg-ice/50 p-4" data-lenis-prevent>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.from === "assistant"
                  ? "self-start rounded-bl-md bg-white text-ink shadow-sm ring-1 ring-slate-line"
                  : "self-end rounded-br-md bg-azure text-white"
              )}
            >
              <span className="whitespace-pre-line">{msg.text}</span>
            </div>
          ))}
          {typing ? (
            <div className="self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-ink-muted shadow-sm ring-1 ring-slate-line">
              {t("typing")}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-line bg-white p-4">
          {getOptions().map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (option.id === "restart") {
                  reset();
                  void openChat();
                  return;
                }
                if (option.id === "menu") {
                  addUserMessage(option.label);
                  setStep("menu");
                  void addAssistantMessage(t("steps.menu"), 200);
                  return;
                }
                void handleOption(option);
              }}
              className="rounded-full border border-slate-line bg-ice px-3 py-2 text-left text-xs text-ink-soft transition-colors hover:border-azure/40 hover:bg-sky hover:text-azure"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
