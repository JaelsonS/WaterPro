"use client";

import { Link } from "@/i18n/routing";
import { MagneticButton } from "@/components/ui/MagneticButton";

type VerifyEmailScreenProps = {
  email: string;
};

export function VerifyEmailScreen({ email }: VerifyEmailScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ice p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-line bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-azure/10 text-azure">
          <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-center text-2xl font-light text-ink">Verifique o seu email</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-ink-muted">
          Enviámos um link de confirmação para{" "}
          <span className="font-medium text-ink">{email}</span>. Abra o email e clique no link para activar a sua
          conta Fluxora.
        </p>

        <div className="mt-6 space-y-3 rounded-xl border border-slate-line bg-ice/60 p-4 text-sm text-ink-soft">
          <p className="font-medium text-ink">Próximos passos</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Abra a caixa de entrada (verifique também spam).</li>
            <li>Clique em <strong>Confirmar email</strong> no email da Fluxora.</li>
            <li>Depois volte aqui e entre com o email e password que criou.</li>
            <li>Configure o MFA — só então acede ao painel.</li>
          </ol>
        </div>

        <div className="mt-8 space-y-3">
          <Link href="/dashboard?entrar=1" className="block">
            <MagneticButton variant="primary" className="w-full">
              Já confirmei — Entrar
            </MagneticButton>
          </Link>
          <Link href="/cadastro" className="block text-center text-sm text-ink-muted hover:text-ink">
            Voltar ao cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
