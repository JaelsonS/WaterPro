"use client";

import { useState, type FormEvent } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";

type MfaSetupPanelProps = {
  qrCode?: string | null;
  secret?: string | null;
  loading?: boolean;
  error?: string | null;
  onStart: () => Promise<void>;
  onConfirm: (code: string) => Promise<void>;
  enrolled?: boolean;
};

function MfaQrCode({ qrCode }: { qrCode: string }) {
  if (qrCode.startsWith("data:")) {
    return (
      <img
        src={qrCode}
        alt="Código QR para autenticação de dois fatores"
        className="mx-auto h-48 w-48"
      />
    );
  }

  return (
    <div
      className="mx-auto flex max-w-xs items-center justify-center rounded-xl border border-slate-line bg-white p-4"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: qrCode }}
    />
  );
}

export function MfaSetupPanel({
  qrCode,
  secret,
  loading,
  error,
  onStart,
  onConfirm,
  enrolled,
}: MfaSetupPanelProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm(code.trim());
      setCode("");
    } finally {
      setSubmitting(false);
    }
  }

  if (enrolled) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-medium">Autenticação de dois fatores ativa</p>
        <p className="mt-1 text-emerald-800/90">
          A sua conta administrativa está protegida com verificação adicional.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-medium">Proteja a sua conta</p>
        <p className="mt-1">
          Para aceder a configurações administrativas sensíveis da Fluxora, configure a autenticação de
          dois fatores.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      {!qrCode ? (
        <MagneticButton className="!px-4 !py-2" disabled={loading} onClick={() => void onStart()}>
          Configurar MFA
        </MagneticButton>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Escaneie o código QR com a sua app autenticadora e introduza o código gerado.
          </p>
          {qrCode ? <MfaQrCode qrCode={qrCode} /> : null}
          {secret ? (
            <p className="text-center text-xs text-ink-muted">
              Chave manual: <code className="rounded bg-ice px-1 py-0.5">{secret}</code>
            </p>
          ) : null}
          <form onSubmit={(e) => void handleConfirm(e)} className="space-y-3">
            <label className="block text-sm font-medium text-ink" htmlFor="mfa-setup-code">
              Código do autenticador
            </label>
            <input
              id="mfa-setup-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="w-full rounded-xl border border-slate-line px-3 py-2 text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
            />
            <MagneticButton type="submit" className="!px-4 !py-2" disabled={submitting || code.trim().length < 6}>
              Ativar MFA
            </MagneticButton>
          </form>
        </div>
      )}
    </div>
  );
}
