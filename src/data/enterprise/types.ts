export type EnterpriseCategory =
  | "fontes-de-agua"
  | "purificadores"
  | "sistemas-profissionais"
  | "agua-fria"
  | "agua-natural"
  | "agua-quente"
  | "agua-com-gas"
  | "equipamentos-premium"
  | "acessorios";

export type EnterpriseApplication =
  | "escritorios"
  | "hoteis"
  | "restaurantes"
  | "clinicas"
  | "hospitais"
  | "ginasios"
  | "escolas"
  | "industria"
  | "comercio"
  | "espacos-publicos";

export interface EnterpriseProduct {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  categories: EnterpriseCategory[];
  applications: EnterpriseApplication[];
  images: string[];
  mainBenefit: string;
  benefits: Array<{ icon: string; title: string; description: string }>;
  specs: Array<{ label: string; value: string }>;
  technologies: string[];
  idealFor: string[];
  warranty: string;
  certifications: string[];
  faq: Array<{ question: string; answer: string }>;
  relatedSlugs: string[];
  compareWith?: string[];
  featured?: boolean;
}
