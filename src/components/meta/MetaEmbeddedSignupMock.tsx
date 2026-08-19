"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";

type EmbeddedSignupResult = {
  embeddedCode: string;
  wabaId?: string;
  phoneNumberId?: string;
};

type Props = {
  configId: string; // ignored in mock
  onComplete: (result: EmbeddedSignupResult) => void;
  onCancel: () => void;
  onError: (err: string) => void;
};

export function MetaEmbeddedSignupMock({ onComplete }: Props) {
  const doneRef = useRef(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (doneRef.current) return;
    setStarted(true);

    const t = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;

      onComplete({
        embeddedCode: "mock-embedded-code",
        wabaId: "mock-waba-id",
        phoneNumberId: `pn-${Math.random().toString(16).slice(2, 8)}`,
      });
    }, 900);

    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="glass-panel rounded-2xl p-8 text-center">
      <p className="text-lg text-ink">{started ? "Simulando Embedded Signup…" : "Preparando…"}</p>
    </div>
  );
}

