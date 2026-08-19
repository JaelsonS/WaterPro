import { Suspense } from "react";
import { VerificarEmailClient } from "./VerificarEmailClient";

export default function VerificarEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ice text-sm text-ink-muted">
          A carregar…
        </div>
      }
    >
      <VerificarEmailClient />
    </Suspense>
  );
}
