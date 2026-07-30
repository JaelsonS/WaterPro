import type { EnterpriseApplication, EnterpriseCategory } from "./types";

export const enterpriseCategoryLabels: Record<
  EnterpriseCategory,
  { pt: string; en: string }
> = {
  "fontes-de-agua": { pt: "Fontes de Água", en: "Water Fountains" },
  purificadores: { pt: "Purificadores", en: "Purifiers" },
  "sistemas-profissionais": { pt: "Sistemas Profissionais", en: "Professional Systems" },
  "agua-fria": { pt: "Água Fria", en: "Cold Water" },
  "agua-natural": { pt: "Água Natural", en: "Ambient Water" },
  "agua-quente": { pt: "Água Quente", en: "Hot Water" },
  "agua-com-gas": { pt: "Água com Gás", en: "Sparkling Water" },
  "equipamentos-premium": { pt: "Equipamentos Premium", en: "Premium Equipment" },
  acessorios: { pt: "Acessórios", en: "Accessories" },
};

export const enterpriseApplicationLabels: Record<
  EnterpriseApplication,
  { pt: string; en: string }
> = {
  escritorios: { pt: "Escritórios", en: "Offices" },
  hoteis: { pt: "Hotéis", en: "Hotels" },
  restaurantes: { pt: "Restaurantes", en: "Restaurants" },
  clinicas: { pt: "Clínicas", en: "Clinics" },
  hospitais: { pt: "Hospitais", en: "Hospitals" },
  ginasios: { pt: "Ginásios", en: "Gyms" },
  escolas: { pt: "Escolas", en: "Schools" },
  industria: { pt: "Indústria", en: "Industry" },
  comercio: { pt: "Comércio", en: "Retail" },
  "espacos-publicos": { pt: "Espaços Públicos", en: "Public Spaces" },
};

export const allEnterpriseCategories: EnterpriseCategory[] = [
  "fontes-de-agua",
  "purificadores",
  "sistemas-profissionais",
  "agua-fria",
  "agua-natural",
  "agua-quente",
  "agua-com-gas",
  "equipamentos-premium",
  "acessorios",
];

export const allEnterpriseApplications: EnterpriseApplication[] = [
  "escritorios",
  "hoteis",
  "restaurantes",
  "clinicas",
  "ginasios",
  "escolas",
  "industria",
  "comercio",
  "espacos-publicos",
];
