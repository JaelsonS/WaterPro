"use client";

import { useState, type FormEvent } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";

type MfaStepUpModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  onGoToSetup?: () => void;
  enrollmentRequired?: boolean;
};

export function MfaStepUpModal({
  open,
  title = "Verificação de segurança necessária",
  description = "Esta ação altera uma configuração sensível da sua conta.",
  loading,
  error,
  onClose,
  onVerify,
  onGoToSetup,
  enrollmentRequired,
}: MfaStepUpModalProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onVerify(code.trim());
      setCode("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-line bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mfa-step-up-title"
      >
        <h2 id="mfa-step-up-title" className="text-lg font-medium text-ink">
          {enrollmentRequired ? "Configure MFA primeiro" : title}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {enrollmentRequired
            ? "Para executar esta ação, configure a autenticação de dois fatores nas definições de segurança."
            : description}
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        ) : null}

        {enrollmentRequired ? (
          <div className="mt-6 flex justify-end gap-2">
            <MagneticButton variant="secondary" className="!px-4 !py-2" onClick={onClose}>
              Cancelar
            </MagneticButton>
            {onGoToSetup ? (
              <MagneticButton className="!px-4 !py-2" onClick={onGoToSetup}>
                Configurar MFA
              </MagneticButton>
            ) : null}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink" htmlFor="mfa-step-up-code">
                Digite o código do seu autenticador
              </label>
              <input
                id="mfa-step-up-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="mt-2 w-full rounded-xl border border-slate-line px-3 py-2 text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
              />
            </div>
            <div className="flex justify-end gap-2">
              <MagneticButton variant="secondary" className="!px-4 !py-2" type="button" onClick={onClose}>
                Cancelar
              </MagneticButton>
              <MagneticButton
                className="!px-4 !py-2"
                type="submit"
                disabled={loading || submitting || code.trim().length < 6}
              >
                Verificar identidade
              </MagneticButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
