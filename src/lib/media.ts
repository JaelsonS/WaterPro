/** Curated media URLs — produtos reais WaterPro + vídeos de água verificados */

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Imagens reais dos produtos WaterPro (waterpro.pt) */
const productImages = {
  coralPulse: "https://waterpro.pt/wp-content/uploads/2025/06/Coral-Wai-Pulse-2.webp",
  eco15: "https://waterpro.pt/wp-content/uploads/2026/07/eco-15-.webp",
  cosmos: "https://waterpro.pt/wp-content/uploads/2026/07/cosmos.webp",
  blueOcean: "https://waterpro.pt/wp-content/uploads/2026/07/blue_ocean.webp",
  hydronik: "https://waterpro.pt/wp-content/uploads/2025/06/HYDRONIK-H2-LIVE-4.webp",
  ice80: "https://waterpro.pt/wp-content/uploads/2026/07/ice80-g-.webp",
  residentialHero:
    "https://waterpro.pt/wp-content/uploads/2026/06/Captura-de-ecra-2026-06-19-181241.png",
  enterpriseHero:
    "https://waterpro.pt/wp-content/uploads/2026/06/Captura-de-ecra-2026-06-19-182019.png",
  faucetStill:
    "https://waterpro.pt/wp-content/uploads/2026/07/blue-river.webp",
} as const;

export const media = {
  hero: {
    water: u("photo-1559827260-dc66d52bef19", 1920),
    /** Só fotos atmosféricas (nunca produtos em fundo branco — ficam invisíveis no hero). */
    slides: [
      { src: u("photo-1559827260-dc66d52bef19", 1920), alt: "Água cristalina — WaterPro" },
      { src: u("photo-1548839140-29a749e1cf4d", 1920), alt: "Gotas de água pura" },
      { src: u("photo-1476673160081-cf065607f449", 1920), alt: "Natureza e pureza" },
      { src: u("photo-1600566753190-17f0baa2a6c3", 1920), alt: "Ambiente de bem-estar em casa" },
      { src: u("photo-1600585154340-be6161a56a0c", 1920), alt: "Espaço moderno e luminoso" },
      { src: u("photo-1497366216548-37526070297c", 1920), alt: "Ambiente profissional" },
      { src: productImages.faucetStill, alt: "Blue River — água pura WaterPro" },
    ],
  },
  residential: {
    hero: productImages.residentialHero,
    kitchen: productImages.coralPulse,
  },
  enterprise: {
    hero: productImages.enterpriseHero,
    office: productImages.eco15,
  },
  solutions: {
    residential: productImages.cosmos,
    commercial: productImages.blueOcean,
  },
  families: [
    {
      src: productImages.coralPulse,
      caption: { pt: "Tecnologia Coral Wai para a sua casa", en: "Coral Wai technology for your home" },
      href: "/para-sua-casa/coral-wai-pulse",
    },
    {
      src: productImages.eco15,
      caption: { pt: "Soluções eco para água pura", en: "Eco solutions for pure water" },
      href: "/para-a-sua-empresa/eco-15",
    },
    {
      src: productImages.cosmos,
      caption: { pt: "Design premium WaterPro", en: "Premium WaterPro design" },
      href: "/para-sua-casa/mizu",
    },
    {
      src: productImages.blueOcean,
      caption: { pt: "Água cristalina todos os dias", en: "Crystal-clear water every day" },
      href: "/para-a-sua-empresa/waterline-flow",
    },
    {
      src: productImages.hydronik,
      caption: { pt: "Inovação em cada gota", en: "Innovation in every drop" },
      href: "/para-sua-casa/hydronik-h2-live",
    },
    {
      src: productImages.ice80,
      caption: { pt: "Gelo e água na perfeição", en: "Ice and water in perfection" },
      href: "/para-a-sua-empresa/ice-80-2-bicas",
    },
  ],
  consequences: [
    u("photo-1556228578-0d85b1a4d571", 800),
    u("photo-1584622650111-993a426fbf0a", 800),
    u("photo-1581578731548-c64695cc6952", 800),
  ],
  video: {
    /** Gotas de água cristalina — Pexels verificado HTTP 200 */
    waterDrops:
      "https://videos.pexels.com/video-files/854084/854084-hd_1920_1080_25fps.mp4",
    /** Água a correr / fluxo puro */
    waterFlow:
      "https://videos.pexels.com/video-files/3254066/3254066-hd_1920_1080_25fps.mp4",
    /** Torneira — água limpa (substituído: vídeo anterior era conteúdo errado) */
    faucet:
      "https://videos.pexels.com/video-files/6981411/6981411-hd_1920_1080_25fps.mp4",
    faucetPoster: productImages.faucetStill,
    poster: u("photo-1559827260-dc66d52bef19", 1920),
  },
  productFallback: productImages.eco15,
} as const;
