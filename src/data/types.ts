export type ProductCategory =
  | "purificadores"
  | "descalcificadores"
  | "torneiras"
  | "filtros"
  | "agua-alcalina"
  | "sistemas-inteligentes"
  | "acessorios";

export type ProductApplication =
  | "cozinha"
  | "casa-completa"
  | "beber"
  | "limpeza"
  | "bem-estar";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  categories: ProductCategory[];
  applications: ProductApplication[];
  images: string[];
  mainBenefit: string;
  benefits: ProductBenefit[];
  specs: ProductSpec[];
  technologies: string[];
  idealFor: string[];
  warranty: string;
  certifications: string[];
  faq: ProductFAQ[];
  relatedSlugs: string[];
  compareWith?: string[];
  featured?: boolean;
}

export interface ScrapedProduct {
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  images: string[];
}
