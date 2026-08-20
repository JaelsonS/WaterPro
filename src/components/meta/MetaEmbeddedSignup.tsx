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
let fbInitializedAppId: string | null = null;

function normalizeMetaAppId(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "");
}

function isValidMetaAppId(appId: string): boolean {
  return /^[0-9]{5,20}$/.test(appId);
}

function loadFacebookSdk(appId: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in browser"));

  const FB = (window as unknown as { FB?: { init: (opts: Record<string, unknown>) => void; login: (...args: unknown[]) => void } }).FB;
  if (FB && fbInitializedAppId === appId) return Promise.resolve();

  // App ID changed or first load — (re)initialize.
  if (FB && fbInitializedAppId !== appId) {
    FB.init({
      appId,
      autoLogAppEvents: false,
      xfbml: false,
      version: "v21.0",
    });
    fbInitializedAppId = appId;
    return Promise.resolve();
  }

  if (fbSdkPromise && fbInitializedAppId === appId) return fbSdkPromise;

  fbSdkPromise = new Promise<void>((resolve, reject) => {
    const finishInit = () => {
      try {
        const sdk = (window as unknown as { FB: { init: (opts: Record<string, unknown>) => void } }).FB;
        sdk.init({
          appId,
          autoLogAppEvents: false,
          xfbml: false,
          version: "v21.0",
        });
        fbInitializedAppId = appId;
        resolve();
      } catch (e) {
        fbSdkPromise = null;
        reject(e);
      }
    };

    if ((window as unknown as { FB?: unknown }).FB) {
      finishInit();
      return;
    }

    (window as unknown as { fbAsyncInit?: () => void }).fbAsyncInit = finishInit;

    if (!document.getElementById("waterpro-fb-sdk")) {
      const script = document.createElement("script");
      script.id = "waterpro-fb-sdk";
      script.async = true;
      script.defer = true;
      script.src = FB_SDK_URL;
      script.onerror = () => {
        fbSdkPromise = null;
        reject(new Error("Failed to load Facebook JS SDK"));
      };
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if ((window as unknown as { FB?: unknown }).FB) {
          clearInterval(interval);
          finishInit();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        if (!fbInitializedAppId) {
          fbSdkPromise = null;
          reject(new Error("Facebook JS SDK timeout"));
        }
      }, 15_000);
    }
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
  const [statusMessage, setStatusMessage] = useState("A preparar a janela do WhatsApp / Meta…");
  const doneRef = useRef(false);

  const appId = useMemo(
    () => normalizeMetaAppId(process.env.NEXT_PUBLIC_META_APP_ID ?? ""),
    [],
  );
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
        setStatusMessage("Meta App ID em falta na Vercel.");
        onErrorRef.current(
          "NEXT_PUBLIC_META_APP_ID não está no build. Defina na Vercel e faça Redeploy.",
        );
        return;
      }

      if (!isValidMetaAppId(appId)) {
        setStatusMessage("Meta App ID inválido no build.");
        onErrorRef.current(
          `NEXT_PUBLIC_META_APP_ID inválido ("${appId.slice(0, 24)}"). Use só o número do App ID (ex.: 108075992771681) e Redeploy.`,
        );
        return;
      }

      if (!configId || !/^[0-9]{5,20}$/.test(String(configId).trim())) {
        setStatusMessage("Config ID do Embedded Signup inválido.");
        onErrorRef.current(
          "embeddedSignupConfigId inválido. Confirme META_EMBEDDED_SIGNUP_CONFIG_ID no Render.",
        );
        return;
      }

      try {
        setStatusMessage(`A abrir Meta (App ID …${appId.slice(-4)})…`);
        await loadFacebookSdk(appId);
      } catch {
        onErrorRef.current("Falha ao carregar o Facebook JS SDK.");
        return;
      }

      if (cancelled || doneRef.current) return;

      const onMessage = (event: MessageEvent) => {
        if (!ALLOWED_MESSAGE_ORIGINS.has(event.origin)) return;

        let payload: unknown = event.data;
        if (typeof payload === "string") {
          try {
            payload = JSON.parse(payload);
          } catch {
            return;
          }
        }

        const message = payload as {
          type?: string;
          event?: string;
          data?: { waba_id?: string; phone_number_id?: string };
        };
        if (!message || message.type !== "WA_EMBEDDED_SIGNUP") return;

        const eventName = typeof message.event === "string" ? message.event.toUpperCase() : "";
        const data = message.data ?? {};

        if (typeof data.waba_id === "string") wabaIdRef.current = data.waba_id;
        if (typeof data.phone_number_id === "string") phoneNumberIdRef.current = data.phone_number_id;

        const currentCode = embeddedCodeRef.current;
        if (currentCode && eventName.includes("FINISH") && !doneRef.current) {
          doneRef.current = true;
          onCompleteRef.current({
            embeddedCode: currentCode,
            wabaId: data.waba_id,
            phoneNumberId: data.phone_number_id,
          });
        }
      };

      window.addEventListener("message", onMessage);

      const FB = (window as unknown as {
        FB: { login: (cb: (response: unknown) => void, opts: Record<string, unknown>) => void };
      }).FB;

      FB.login(
        (response: unknown) => {
          if (cancelled || doneRef.current) return;

          const authResponse = (response as { authResponse?: { code?: string } } | null)?.authResponse;
          const code = authResponse?.code;
          if (typeof code === "string" && code.length > 0) {
            embeddedCodeRef.current = code;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              if (cancelled || doneRef.current) return;
              doneRef.current = true;
              onCompleteRef.current({
                embeddedCode: code,
                wabaId: wabaIdRef.current,
                phoneNumberId: phoneNumberIdRef.current,
              });
            }, postMessageWaitMs);
            return;
          }

          doneRef.current = true;
          onCancelRef.current();
        },
        {
          config_id: String(configId).trim(),
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
          },
        },
      );

      return onMessage;
    }

    let onMessage: ((event: MessageEvent) => void) | undefined;
    void run().then((listener) => {
      onMessage = listener;
    });

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (onMessage) window.removeEventListener("message", onMessage);
    };
  }, [appId, configId, postMessageWaitMs]);

  return (
    <div className="mt-2 rounded-2xl border border-slate-line bg-ice/60 p-6 text-center">
      <p className="text-base text-ink">{statusMessage}</p>
      <p className="mt-2 text-xs text-ink-muted">
        App ID no build: {appId ? `…${appId.slice(-6)}` : "em falta"} · Config:{" "}
        {configId ? `…${String(configId).slice(-6)}` : "em falta"}
      </p>
      <p className="mt-2 text-sm text-ink-muted">
        Se aparecer “ID do app inválido”, o valor na Vercel não entrou no deploy — confirme e faça
        Redeploy.
      </p>
      <button
        type="button"
        className="mt-4 text-sm font-medium text-azure underline-offset-2 hover:underline"
        onClick={() => {
          if (doneRef.current) return;
          doneRef.current = true;
          onCancel();
        }}
      >
        Cancelar conexão
      </button>
    </div>
  );
}
