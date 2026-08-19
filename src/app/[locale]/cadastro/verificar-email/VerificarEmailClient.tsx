"use client";

import { useSearchParams } from "next/navigation";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen";
import { Link } from "@/i18n/routing";

export function VerificarEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice p-4">
        <div className="max-w-md rounded-2xl border border-slate-line bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-ink-muted">Email não encontrado. Conclua o cadastro primeiro.</p>
          <Link href="/cadastro" className="mt-4 inline-block text-sm font-medium text-azure hover:underline">
            Ir para cadastro
          </Link>
        </div>
      </div>
    );
  }

  return <VerifyEmailScreen email={email} />;
}
