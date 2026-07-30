import type { ProductApplication, ProductCategory } from "./types";

export const categoryLabels: Record<ProductCategory, { pt: string; en: string }> = {
  purificadores: { pt: "Purificadores", en: "Purifiers" },
  descalcificadores: { pt: "Descalcificadores", en: "Water Softeners" },
  torneiras: { pt: "Torneiras", en: "Taps" },
  filtros: { pt: "Filtros", en: "Filters" },
  "agua-alcalina": { pt: "Água Alcalina", en: "Alkaline Water" },
  "sistemas-inteligentes": { pt: "Sistemas Inteligentes", en: "Smart Systems" },
  acessorios: { pt: "Acessórios", en: "Accessories" },
};

export const applicationLabels: Record<ProductApplication, { pt: string; en: string }> = {
  cozinha: { pt: "Cozinha", en: "Kitchen" },
  "casa-completa": { pt: "Casa completa", en: "Whole home" },
  beber: { pt: "Beber", en: "Drinking" },
  limpeza: { pt: "Limpeza", en: "Cleaning" },
  "bem-estar": { pt: "Bem-estar", en: "Wellbeing" },
};

export const allApplications: ProductApplication[] = [
  "beber",
  "cozinha",
  "casa-completa",
  "bem-estar",
  "limpeza",
];

export const allCategories: ProductCategory[] = [
  "purificadores",
  "descalcificadores",
  "torneiras",
  "filtros",
  "agua-alcalina",
  "sistemas-inteligentes",
  "acessorios",
];

export const categoryMeta: Record<
  ProductCategory,
  { pt: string; en: string }
> = {
  purificadores: {
    pt: "Osmose inversa e purificação avançada para água de excelência.",
    en: "Reverse osmosis and advanced purification for excellent water.",
  },
  descalcificadores: {
    pt: "Proteção total contra calcário em toda a habitação.",
    en: "Complete limescale protection throughout your home.",
  },
  torneiras: {
    pt: "Design premium com acesso a água pura na cozinha.",
    en: "Premium design with access to pure water in the kitchen.",
  },
  filtros: {
    pt: "Filtração multicamada para água mais limpa e segura.",
    en: "Multi-stage filtration for cleaner, safer water.",
  },
  "agua-alcalina": {
    pt: "Água enriquecida para hidratação e bem-estar diário.",
    en: "Enriched water for daily hydration and wellbeing.",
  },
  "sistemas-inteligentes": {
    pt: "Tecnologia conectada para máximo conforto e eficiência.",
    en: "Connected technology for maximum comfort and efficiency.",
  },
  acessorios: {
    pt: "Complementos essenciais para o seu sistema de água.",
    en: "Essential complements for your water system.",
  },
};
