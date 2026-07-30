"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(
  () => import("@/components/ui/CustomCursor").then((m) => m.CustomCursor),
  { ssr: false }
);
const CrystalWaterScroll = dynamic(
  () =>
    import("@/components/ui/CrystalWaterScroll").then((m) => m.CrystalWaterScroll),
  { ssr: false }
);
const WaterParticles = dynamic(
  () => import("@/components/ui/WaterParticles").then((m) => m.WaterParticles),
  { ssr: false }
);
const GuiAssistant = dynamic(
  () => import("@/components/ui/GuiAssistant").then((m) => m.GuiAssistant),
  { ssr: false }
);

/** Efeitos client-only — não bloqueiam o HTML inicial (SEO / LCP). */
export function ClientEffects() {
  return (
    <>
      <CustomCursor />
      <CrystalWaterScroll />
      <WaterParticles />
      <GuiAssistant />
    </>
  );
}
