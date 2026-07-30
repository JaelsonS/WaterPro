import type { Product, ProductApplication, ProductCategory } from "./types";
import rawProducts from "./raw-products.json";

const categoryMap: Record<string, ProductCategory[]> = {
  "coral-wai-pulse": ["descalcificadores", "sistemas-inteligentes"],
  "descalcificadores-coral-wai-modelos-8-e-11": ["descalcificadores"],
  "filtros-de-agua-big-blue-10p": ["filtros"],
  "filtros-de-agua-big-blue-20p": ["filtros"],
  "hydronic-pure": ["agua-alcalina", "sistemas-inteligentes"],
  "hydronic-pure-plus": ["agua-alcalina", "sistemas-inteligentes"],
  "hydronik-h2-live": ["agua-alcalina", "acessorios"],
  "hydrowater-nature-cyclone": ["agua-alcalina"],
  "kit-de-limpeza-o3": ["acessorios"],
  "mizu": ["purificadores"],
  "oko-ozean-pacific": ["acessorios", "sistemas-inteligentes"],
  "osmose-com-lampada-uv-wake": ["purificadores", "sistemas-inteligentes"],
  "osmose-com-torneira-inteligente-zeya": ["purificadores", "sistemas-inteligentes"],
  "osmose-edesign-premium": ["purificadores"],
  "osmose-h600": ["purificadores"],
  "osmose-maui": ["purificadores"],
  "osmose-monoi": ["purificadores"],
  "silurus": ["purificadores"],
  "water-alkaline-800": ["purificadores", "agua-alcalina"],
  "waterline-600ph": ["purificadores", "sistemas-inteligentes", "agua-alcalina"],
};

function getCategories(slug: string): ProductCategory[] {
  if (slug.startsWith("torneira-")) return ["torneiras"];
  return categoryMap[slug] || ["purificadores"];
}

function getApplications(slug: string, categories: ProductCategory[]): ProductApplication[] {
  if (categories.includes("torneiras")) return ["cozinha"];
  if (categories.includes("acessorios")) return ["limpeza", "bem-estar"];
  if (categories.includes("descalcificadores")) return ["casa-completa"];
  if (categories.includes("agua-alcalina")) return ["beber", "bem-estar"];
  return ["beber", "cozinha"];
}

function getMainBenefit(categories: ProductCategory[]): string {
  if (categories.includes("torneiras")) return "Design premium com água pura na cozinha";
  if (categories.includes("descalcificadores")) return "Proteção total contra calcário";
  if (categories.includes("filtros")) return "Filtração multicamada avançada";
  if (categories.includes("agua-alcalina")) return "Hidratação antioxidante diária";
  if (categories.includes("acessorios")) return "Limpeza ecológica sem químicos";
  if (categories.includes("sistemas-inteligentes")) return "Tecnologia inteligente de ponta";
  return "Água pura para toda a família";
}

function getBenefits(categories: ProductCategory[]) {
  const base = [
    { icon: "droplet", title: "Água mais pura", description: "Remove impurezas e melhora sabor e odor." },
    { icon: "shield", title: "Proteção da família", description: "Água segura para beber, cozinhar e banhar." },
    { icon: "sparkles", title: "Mais conforto", description: "Experiência diária de qualidade superior." },
    { icon: "leaf", title: "Sustentabilidade", description: "Reduz o consumo de garrafas de plástico." },
  ];
  if (categories.includes("descalcificadores")) {
    return [
      { icon: "shield", title: "Proteção do calcário", description: "Prolonga a vida dos eletrodomésticos." },
      { icon: "coins", title: "Economia", description: "Reduz contas de energia e manutenção." },
      { icon: "sparkles", title: "Pele e cabelo", description: "Água mais suave no dia a dia." },
      { icon: "leaf", title: "Ecológico", description: "Menos detergentes e produtos químicos." },
    ];
  }
  if (categories.includes("torneiras")) {
    return [
      { icon: "design", title: "Design premium", description: "Acabamentos elegantes para cozinhas modernas." },
      { icon: "droplet", title: "Água pura direta", description: "Acesso imediato a água filtrada." },
      { icon: "settings", title: "Instalação simples", description: "Compatível com sistemas de osmose." },
      { icon: "coins", title: "Economia de água", description: "Arejadores economizadores integrados." },
    ];
  }
  return base;
}

function getSpecs(slug: string, categories: ProductCategory[]) {
  const base = [
    { label: "Instalação", value: "Profissional WaterPro" },
    { label: "Manutenção", value: "Plano preventivo disponível" },
    { label: "Garantia", value: "Até 5 anos (conforme modelo)" },
    { label: "Certificações", value: "Conformidade europeia" },
  ];
  if (categories.includes("purificadores")) {
    return [
      { label: "Tecnologia", value: "Osmose inversa avançada" },
      { label: "Filtragem", value: "Multicamada com membrana premium" },
      ...base,
    ];
  }
  if (categories.includes("descalcificadores")) {
    return [
      { label: "Tecnologia", value: "Troca iónica / Magnética" },
      { label: "Aplicação", value: "Toda a habitação" },
      ...base,
    ];
  }
  if (categories.includes("torneiras")) {
    return [
      { label: "Material", value: "Aço inoxidável premium" },
      { label: "Vias", value: slug.includes("5-vias") ? "5 vias" : slug.includes("4-vias") ? "4 vias" : "3 vias" },
      { label: "Compatibilidade", value: "Sistemas de osmose inversa" },
      ...base,
    ];
  }
  return base;
}

function getTechnologies(categories: ProductCategory[]): string[] {
  if (categories.includes("purificadores")) return ["Osmose inversa", "Filtração UV", "Carvão ativado", "Ultrafiltração"];
  if (categories.includes("descalcificadores")) return ["Troca iónica", "Tecnologia magnética", "Regeneração automática"];
  if (categories.includes("torneiras")) return ["Válvulas cerâmicas", "Arejador economizador", "Circuito independente"];
  if (categories.includes("agua-alcalina")) return ["Enriquecimento com hidrogénio", "Antioxidantes", "Mineralização"];
  if (categories.includes("filtros")) return ["Sedimentos", "Carvão CTO", "ScaleArmor™"];
  return ["Tecnologia WaterPro"];
}

function getRelated(slug: string, categories: ProductCategory[]): string[] {
  const sameCategory = products
    .filter((p) => p.slug !== slug && p.categories.some((c) => categories.includes(c)))
    .slice(0, 4)
    .map((p) => p.slug);
  return sameCategory;
}

function getCompareWith(slug: string): string[] | undefined {
  const comparisons: Record<string, string[]> = {
    "hydronic-pure": ["hydronic-pure-plus"],
    "hydronic-pure-plus": ["hydronic-pure"],
    "osmose-maui": ["osmose-monoi"],
    "osmose-monoi": ["osmose-maui"],
    "filtros-de-agua-big-blue-10p": ["filtros-de-agua-big-blue-20p"],
    "filtros-de-agua-big-blue-20p": ["filtros-de-agua-big-blue-10p"],
    "water-alkaline-800": ["waterline-600ph"],
    "waterline-600ph": ["water-alkaline-800"],
    "torneira-paris-de-3-vias": ["torneira-paris-lite-de-3-vias", "torneira-paris-matte-de-3-vias"],
  };
  return comparisons[slug];
}

function enrichProduct(raw: (typeof rawProducts)[number]): Product {
  const categories = getCategories(raw.slug);
  const applications = getApplications(raw.slug, categories);
  const images = raw.images.filter((img) => !img.match(/600x\d+/));

  return {
    slug: raw.slug,
    name: raw.title,
    shortDescription: raw.shortDesc,
    longDescription: raw.longDesc || raw.shortDesc,
    categories,
    applications,
    images: images.length > 0 ? images : raw.images.slice(0, 1),
    mainBenefit: getMainBenefit(categories),
    benefits: getBenefits(categories),
    specs: getSpecs(raw.slug, categories),
    technologies: getTechnologies(categories),
    idealFor: categories.includes("torneiras")
      ? ["Cozinhas modernas", "Sistemas de osmose", "Renovação de cozinha"]
      : ["Famílias", "Casas com água dura", "Quem valoriza saúde e bem-estar"],
    warranty: "Garantia WaterPro até 5 anos",
    certifications: ["ISO 9001", "Conformidade CE", "Certificação DGAV"],
    faq: [
      {
        question: "A instalação está incluída?",
        answer: "A instalação profissional é realizada pela equipa técnica WaterPro. Solicite orçamento para condições específicas.",
      },
      {
        question: "Qual a periodicidade de manutenção?",
        answer: "Depende do equipamento e da qualidade da água. A nossa equipa indica o plano ideal após análise técnica.",
      },
      {
        question: "É compatível com a minha instalação?",
        answer: "Sim. Realizamos visita técnica gratuita para garantir compatibilidade total com a sua casa.",
      },
    ],
    relatedSlugs: [],
    compareWith: getCompareWith(raw.slug),
    featured: ["osmose-maui", "water-alkaline-800", "coral-wai-pulse", "torneira-paris-de-3-vias"].includes(raw.slug),
  };
}

export const products: Product[] = (rawProducts as (typeof rawProducts)).map(enrichProduct);

products.forEach((product) => {
  product.relatedSlugs = getRelated(product.slug, product.categories);
});

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

export function filterProducts({
  category,
  application,
  search,
  sort,
}: {
  category?: ProductCategory | "all";
  application?: ProductApplication | "all";
  search?: string;
  sort?: "name" | "featured";
}): Product[] {
  let result = [...products];

  if (category && category !== "all") {
    result = result.filter((p) => p.categories.includes(category));
  }

  if (application && application !== "all") {
    result = result.filter((p) => p.applications.includes(application));
  }

  if (search?.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.categories.some((c) => c.includes(q)) ||
        p.applications.some((a) => a.includes(q))
    );
  }

  if (sort === "featured") {
    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  } else {
    result.sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }

  return result;
}
