export const SITE_URL = "https://waterpro.pt";

/** Número WhatsApp (sem + ou espaços) — usado em wa.me links */
export const WHATSAPP_NUMBER = "351910643181";

/** Telefone principal da WaterPro */
export const COMPANY_PHONE = "+351 910 643 181";
export const COMPANY_PHONE_RAW = "+351910643181";

export const COMPANY_EMAIL = "geral@waterpro.pt";
export const COMPANY_NIF = "123 456 789";

export const INSTAGRAM_HANDLE = "waterproeuropa";

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/waterpro",
  instagram: "https://www.instagram.com/waterproeuropa",
  linkedin: "https://www.linkedin.com/company/waterpro",
  youtube: "https://www.youtube.com/@waterpro",
} as const;

export const COMPANY_NAME = "Water Pro";

/** Morada / localização — alinhado com waterpro.pt */
export const COMPANY_ADDRESS = {
  street: "Leiria",
  city: "Leiria",
  region: "Distrito de Leiria",
  country: "Portugal",
  mapQuery: "Leiria, Portugal",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Leiria%2C+Portugal",
} as const;

export const COMPANY_ADDRESS_LINE = `${COMPANY_ADDRESS.street}, ${COMPANY_ADDRESS.country}`;
export const COMPANY_TAGLINE_PT = "Pureza e saúde em cada gota de água!";
export const COMPANY_TAGLINE_EN = "Purity and health in every drop of water!";

export const COMPANY_DESCRIPTION_PT =
  "A Water Pro é uma empresa especializada em soluções de purificação, bem-estar e sustentabilidade. Atendemos clientes residenciais e empresariais em todo o território nacional.";

export const COMPANY_DESCRIPTION_EN =
  "Water Pro specialises in purification, wellbeing and sustainability solutions. We serve residential and commercial clients across Portugal.";

export function buildWhatsAppUrl({
  productName,
  productUrl,
  productImage,
  locale = "pt",
}: {
  productName: string;
  productUrl: string;
  productImage?: string;
  locale?: "pt" | "en";
}) {
  const message =
    locale === "en"
      ? `Hello!

I'm interested in the product:
*${productName}*

I saw this equipment on the new WaterPro website.
${productUrl}
${productImage ? `\nMain image: ${productImage}` : ""}

I would like to receive:
• Updated price
• Availability
• Technical information
• Installation conditions

Could you send me more information?

Thank you very much.`
      : `Olá!

Tenho interesse no produto:
*${productName}*

Vi este equipamento no novo website da WaterPro.
${productUrl}
${productImage ? `\nImagem principal: ${productImage}` : ""}

Gostaria de receber:
• Valor atualizado
• Disponibilidade
• Informações técnicas
• Condições de instalação

Podem enviar mais informações?

Muito obrigado.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildEnterpriseWhatsAppUrl({
  productName,
  productUrl,
  productImage,
  locale = "pt",
}: {
  productName: string;
  productUrl: string;
  productImage?: string;
  locale?: "pt" | "en";
}) {
  const message =
    locale === "en"
      ? `Hello!

I'm interested in the following business equipment:
*${productName}*

I saw this product on the new WaterPro website.
${productUrl}
${productImage ? `\nMain image: ${productImage}` : ""}

I would like to receive:
• Updated price
• Availability
• Technical information
• Installation conditions
• Recommendation for my business

Thank you.`
      : `Olá!

Tenho interesse no seguinte equipamento empresarial:
*${productName}*

Vi este produto no novo website da WaterPro.
${productUrl}
${productImage ? `\nImagem principal: ${productImage}` : ""}

Gostaria de receber:
• Valor atualizado
• Disponibilidade
• Informações técnicas
• Condições de instalação
• Recomendação para a minha empresa

Fico a aguardar.

Muito obrigado.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppUrl(locale: "pt" | "en" = "pt") {
  const message =
    locale === "en"
      ? `Hello! I would like to know more about Water Pro water treatment solutions.`
      : `Olá! Gostaria de saber mais sobre as soluções de tratamento de água da Water Pro.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildGuiWhatsAppUrl(
  intent: "quote-home" | "quote-business" | "visit" | "analysis" | "human",
  locale: "pt" | "en" = "pt"
) {
  const messages: Record<typeof intent, { pt: string; en: string }> = {
    "quote-home": {
      pt: `Olá! Sou o Gui, assistente virtual da WaterPro. Gostaria de solicitar um orçamento para soluções residenciais (Para Sua Casa). Podem ajudar-me?`,
      en: `Hello! I'm Gui, WaterPro's virtual assistant. I'd like to request a quote for residential solutions (For Your Home). Can you help me?`,
    },
    "quote-business": {
      pt: `Olá! Sou o Gui, assistente virtual da WaterPro. Gostaria de solicitar um orçamento para soluções empresariais (Para a Sua Empresa). Podem ajudar-me?`,
      en: `Hello! I'm Gui, WaterPro's virtual assistant. I'd like to request a quote for business solutions (For Your Business). Can you help me?`,
    },
    visit: {
      pt: `Olá! Gostaria de marcar uma visita técnica da WaterPro para avaliar a qualidade da água e receber uma proposta personalizada.`,
      en: `Hello! I'd like to schedule a WaterPro technical visit to assess water quality and receive a personalised proposal.`,
    },
    analysis: {
      pt: `Olá! Gostaria de agendar uma análise gratuita da água da minha casa/empresa com a WaterPro.`,
      en: `Hello! I'd like to book a free water analysis for my home/business with WaterPro.`,
    },
    human: {
      pt: `Olá! Falei com o Gui no website e gostaria de falar diretamente com um especialista da WaterPro.`,
      en: `Hello! I spoke with Gui on the website and would like to speak directly with a WaterPro specialist.`,
    },
  };

  const message = messages[intent][locale];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
