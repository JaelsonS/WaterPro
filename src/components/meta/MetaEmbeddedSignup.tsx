"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EmbeddedSignupResult = {
  embeddedCode: string;
  wabaId?: string;
  phoneNumberId?: string;
};

type Props = {
  configId: string;
  onComplete: (result: EmbeddedSignupResult) => void;
  onCancel: () => void;
  onError: (err: string) => void;
  postMessageWaitMs?: number;
};

const FB_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const ALLOWED_MESSAGE_ORIGINS = new Set(["https://www.facebook.com", "https://web.facebook.com"]);

let fbSdkPromise: Promise<void> | null = null;

function loadFacebookSdk(appId: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in browser"));
  if ((window as any).FB) return Promise.resolve();
  if (fbSdkPromise) return fbSdkPromise;

  fbSdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("waterpro-fb-sdk");
    if (existing) {
      // Se o script existir, ainda assim esperamos o init (o onload nem sempre é confiável).
      // Basta aguardar até FB.init ter sido feito.
      const interval = setInterval(() => {
        if ((window as any).FB) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
      return;
    }

    (window as any).fbAsyncInit = () => {
      try {
        (window as any).FB.init({
          appId,
          autoLogAppEvents: false,
          xfbml: false,
          version: "v21.0",
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    const script = document.createElement("script");
    script.id = "waterpro-fb-sdk";
    script.async = true;
    script.defer = true;
    script.src = FB_SDK_URL;
    script.onerror = () => reject(new Error("Failed to load Facebook JS SDK"));
    document.head.appendChild(script);
  });

  return fbSdkPromise;
}

export function MetaEmbeddedSignup({
  configId,
  onComplete,
  onCancel,
  onError,
  postMessageWaitMs = 20_000,
}: Props) {
  const [embeddedCode, setEmbeddedCode] = useState<string | null>(null);
  const [wabaId, setWabaId] = useState<string | undefined>(undefined);
  const [phoneNumberId, setPhoneNumberId] = useState<string | undefined>(undefined);
  const doneRef = useRef(false);

  const appId = useMemo(() => process.env.NEXT_PUBLIC_META_APP_ID ?? "", []);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const embeddedCodeRef = useRef<string | null>(null);
  const wabaIdRef = useRef<string | undefined>(undefined);
  const phoneNumberIdRef = useRef<string | undefined>(undefined);

  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onCancelRef.current = onCancel;
    onErrorRef.current = onError;
  }, [onComplete, onCancel, onError]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!appId) {
        onErrorRef.current("Meta não configurado (META_APP_ID ausente).");
        return;
      }

      try {
        await loadFacebookSdk(appId);
      } catch (e) {
        onErrorRef.current("Falha ao carregar o Facebook JS SDK.");
        return;
      }

      // postMessage listener: apenas origens permitidas
      const onMessage = (event: MessageEvent) => {
        if (!ALLOWED_MESSAGE_ORIGINS.has(event.origin)) return;

        let payload: any = event.data;
        if (typeof payload === "string") {
          try {
            payload = JSON.parse(payload);
          } catch {
            return;
          }
        }

        // Embedded Signup usa uma mensagem com tipo específico (defensivo).
        if (!payload || payload.type !== "WA_EMBEDDED_SIGNUP") return;

        const eventName = typeof payload.event === "string" ? payload.event.toUpperCase() : "";

        const data = payload.data ?? {};
        if (typeof data.waba_id === "string") {
          wabaIdRef.current = data.waba_id;
          setWabaId(data.waba_id);
        }
        if (typeof data.phone_number_id === "string") {
          phoneNumberIdRef.current = data.phone_number_id;
          setPhoneNumberId(data.phone_number_id);
        }

        // Alguns fluxos omitem phone_number_id; waba_id tende a existir.
        // Não confiamos em "event" totalmente; apenas avançamos quando o code chegar.
        const currentCode = embeddedCodeRef.current;
        const looksLikeFinish = eventName.includes("FINISH");
        if (currentCode && looksLikeFinish && !doneRef.current) {
          doneRef.current = true;
          onCompleteRef.current({ embeddedCode: currentCode, wabaId: data.waba_id, phoneNumberId: data.phone_number_id });
        }
      };

      window.addEventListener("message", onMessage);

      // Callback do FB.login: onde vem o exchangeable code (curto-lived).
      (window as any).FB.login(
        (response: any) => {
          if (cancelled || doneRef.current) return;

          const code = response?.authResponse?.code;
          if (typeof code === "string" && code.length > 0) {
            embeddedCodeRef.current = code;
            setEmbeddedCode(code);
            // Não finalizamos aqui ainda: esperamos postMessage com waba/phone quando possível.
            // Mas garantimos fallback por timeout.
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              if (cancelled || doneRef.current) return;
              doneRef.current = true;
              onCompleteRef.current({ embeddedCode: code, wabaId: wabaIdRef.current, phoneNumberId: phoneNumberIdRef.current });
            }, postMessageWaitMs);
            return;
          }

          // Cancelamento / bloqueio / erro no popup.
          doneRef.current = true;
          onCancelRef.current();
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
          },
        },
      );
    }

    void run();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [appId, configId, onCancelRef, onCompleteRef, onErrorRef, postMessageWaitMs]);

  return (
    <div className="glass-panel rounded-2xl p-8 text-center">
      <p className="text-lg text-ink">Abrindo conexão do WhatsApp…</p>
    </div>
  );
}

