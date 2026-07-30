"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { buildGuiWhatsAppUrl } from "@/lib/config";
import { GuiAvatar } from "@/components/ui/GuiAvatar";
import { cn } from "@/lib/utils";

type GuiIntent = "quote-home" | "quote-business" | "visit" | "analysis" | "human";
type GuiStep =
  | "welcome"
  | "intent"
  | "faq-hardness"
  | "faq-ro"
  | "faq-visit"
  | "closing";

interface ChatMessage {
  id: string;
  from: "gui" | "user";
  text: string;
}

interface QuickOption {
  id: string;
  label: string;
  step?: GuiStep;
  intent?: GuiIntent;
  userText?: string;
}

export function GuiAssistant() {
  const t = useTranslations("gui");
  const locale = useLocale() as "pt" | "en";
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [step, setStep] = useState<GuiStep>("welcome");
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

  const addGuiMessage = useCallback(
    (text: string, delay = 600) => {
      setTyping(true);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: nextId(), from: "gui", text }]);
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
    if (messages.length === 0) {
      await addGuiMessage(t("welcome"), 400);
      setStep("intent");
    }
  }, [addGuiMessage, messages.length, t]);

  useEffect(() => {
    const handler = () => openChat();
    window.addEventListener("open-gui", handler);
    return () => window.removeEventListener("open-gui", handler);
  }, [openChat]);

  const handleOption = async (option: QuickOption) => {
    addUserMessage(option.userText || option.label);

    if (option.step) {
      setStep(option.step);
      await addGuiMessage(t(`steps.${option.step}`));
      return;
    }

    if (option.intent) {
      setStep("closing");
      await addGuiMessage(t("redirecting"));
      window.open(buildGuiWhatsAppUrl(option.intent, locale), "_blank", "noopener,noreferrer");
    }
  };

  const getOptions = (): QuickOption[] => {
    switch (step) {
      case "welcome":
      case "intent":
        return [
          { id: "quote-home", label: t("options.quoteHome"), intent: "quote-home", userText: t("options.quoteHome") },
          { id: "quote-business", label: t("options.quoteBusiness"), intent: "quote-business", userText: t("options.quoteBusiness") },
          { id: "visit", label: t("options.visit"), intent: "visit", userText: t("options.visit") },
          { id: "analysis", label: t("options.analysis"), intent: "analysis", userText: t("options.analysis") },
          { id: "faq-hardness", label: t("options.faqHardness"), step: "faq-hardness", userText: t("options.faqHardness") },
          { id: "faq-ro", label: t("options.faqRo"), step: "faq-ro", userText: t("options.faqRo") },
          { id: "human", label: t("options.human"), intent: "human", userText: t("options.human") },
        ];
      case "faq-hardness":
      case "faq-ro":
      case "faq-visit":
        return [
          { id: "visit", label: t("options.visit"), intent: "visit", userText: t("options.visit") },
          { id: "human", label: t("options.human"), intent: "human", userText: t("options.human") },
          { id: "back", label: t("options.back"), step: "intent", userText: t("options.back") },
        ];
      case "closing":
        return [
          { id: "restart", label: t("options.restart"), step: "intent", userText: t("options.restart") },
        ];
      default:
        return [];
    }
  };

  const handleBackToIntent = async () => {
    setStep("intent");
    await addGuiMessage(t("steps.intent"), 300);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
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
            <GuiAvatar size="lg" />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-sm font-medium text-ink transition-all duration-300 ease-out",
                showLabel ? "max-w-[160px] opacity-100 pr-4 pl-1" : "max-w-0 opacity-0"
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
          <GuiAvatar size="md" />
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
                msg.from === "gui"
                  ? "self-start rounded-bl-md bg-white text-ink shadow-sm ring-1 ring-slate-line"
                  : "self-end rounded-br-md bg-azure text-white"
              )}
            >
              {msg.text}
            </div>
          ))}
          {typing && (
            <div className="self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-ink-muted shadow-sm ring-1 ring-slate-line">
              {t("typing")}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-line bg-white p-4">
          {getOptions().map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (option.id === "back") {
                  addUserMessage(option.label);
                  handleBackToIntent();
                  return;
                }
                if (option.id === "restart") {
                  reset();
                  openChat();
                  return;
                }
                handleOption(option);
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
