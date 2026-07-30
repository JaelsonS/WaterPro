import type { EnterpriseApplication, EnterpriseCategory, EnterpriseProduct } from "./types";
import rawProducts from "./raw-products.json";

const categoryMap: Record<string, EnterpriseCategory[]> = {
  "columbia-aqua-juman-sparkling-4-em-1": [
    "fontes-de-agua",
    "sistemas-profissionais",
    "agua-fria",
    "agua-natural",
    "agua-quente",
    "agua-com-gas",
    "equipamentos-premium",
  ],
  "eco-15": ["fontes-de-agua", "agua-fria", "agua-natural", "agua-com-gas"],
  "fonte-com-osmose-de-pe": [
    "fontes-de-agua",
    "purificadores",
    "agua-fria",
    "agua-natural",
    "agua-quente",
  ],
  "fonte-ultrafiltracao-desk": ["fontes-de-agua", "purificadores", "agua-natural"],
  "fontes-coral-wai-blue-mountain": ["fontes-de-agua", "equipamentos-premium", "agua-natural"],
  "ice-40-2-bicas": ["fontes-de-agua", "sistemas-profissionais", "agua-fria"],
  "ice-80-2-bicas": ["fontes-de-agua", "sistemas-profissionais", "agua-fria"],
  "ice-80-3-bicas": ["fontes-de-agua", "sistemas-profissionais", "agua-fria"],
  "ice-110-3-bicas": ["fontes-de-agua", "sistemas-profissionais", "agua-fria", "equipamentos-premium"],
  luma: ["fontes-de-agua", "equipamentos-premium", "agua-natural"],
  "mac-200-f5-osmose": ["purificadores", "sistemas-profissionais"],
  "pedal-mac-200-f3-1-em-aco-inoxidavel": ["acessorios"],
  "pedais-mac-200-f3-2-em-aco-inoxidavel": ["acessorios"],
  "plus-home-purificador-de-agua-fria-e-natural": [
    "fontes-de-agua",
    "purificadores",
    "agua-fria",
    "agua-natural",
  ],
  "plus-home-purificador-de-agua-fria-natural-e-quente": [
    "fontes-de-agua",
    "purificadores",
    "agua-fria",
    "agua-natural",
    "agua-quente",
  ],
  "plus-home-puricador-de-agua-fria-natural-e-com-gas": [
    "fontes-de-agua",
    "purificadores",
    "agua-fria",
    "agua-natural",
    "agua-com-gas",
  ],
  "porta-copos-branco-p101": ["acessorios"],
};

function getCategories(slug: string): EnterpriseCategory[] {
  if (categoryMap[slug]) return categoryMap[slug];
  if (slug.startsWith("waterline-")) {
    return ["fontes-de-agua", "sistemas-profissionais", "equipamentos-premium", "agua-fria", "agua-natural"];
  }
  return ["fontes-de-agua", "sistemas-profissionais"];
}

function getApplications(slug: string, categories: EnterpriseCategory[]): EnterpriseApplication[] {
  if (categories.includes("acessorios")) return ["escritorios", "restaurantes", "hoteis"];
  if (slug.includes("ice") || slug.includes("waterline")) {
    return ["escritorios", "hoteis", "restaurantes", "ginasios", "escolas"];
  }
  if (slug.includes("plus-home") || slug.includes("eco")) {
    return ["escritorios", "restaurantes", "clinicas", "comercio"];
  }
  return ["escritorios", "hoteis", "restaurantes", "clinicas", "industria"];
}

function getMainBenefit(categories: EnterpriseCategory[]): string {
  if (categories.includes("acessorios")) return "Complemento profissional para fontes de água";
  if (categories.includes("agua-com-gas")) return "Água com gás premium para o seu negócio";
  if (categories.includes("equipamentos-premium")) return "Tecnologia de ponta para ambientes exigentes";
  return "Água de qualidade superior para colaboradores e clientes";
}

function getBenefits() {
  return [
    {
      icon: "droplet",
      title: "Água filtrada de elevada qualidade",
      description: "Pureza consistente para clientes, colaboradores e visitantes.",
    },
    {
      icon: "users",
      title: "Melhor experiência no local",
      description: "Reforça conforto, imagem e satisfação no seu espaço.",
    },
    {
      icon: "leaf",
      title: "Solução sustentável",
      description: "Reduz garrafas de plástico e o desperdício operacional.",
    },
    {
      icon: "coins",
      title: "Eficiência operacional",
      description: "Menos logística, mais controlo e previsibilidade de custos.",
    },
  ];
}

function getSpecs(slug: string, categories: EnterpriseCategory[]) {
  const base = [
    { label: "Instalação", value: "Profissional WaterPro" },
    { label: "Manutenção", value: "Plano preventivo disponível" },
    { label: "Garantia", value: "Até 5 anos (conforme modelo)" },
    { label: "Certificações", value: "Conformidade europeia" },
  ];

  if (categories.includes("acessorios")) {
    return [
      { label: "Material", value: "Aço inoxidável / componentes premium" },
      { label: "Compatibilidade", value: "Sistemas WaterPro profissionais" },
      ...base,
    ];
  }

  if (slug.startsWith("waterline-")) {
    return [
      { label: "Capacidade", value: "Alta utilização contínua" },
      { label: "Filtragem", value: "Multicamada profissional" },
      { label: "Temperaturas", value: "Fria e natural (conforme modelo)" },
      { label: "Alimentação", value: "220V" },
      ...base,
    ];
  }

  if (slug.includes("ice")) {
    return [
      { label: "Bicas", value: slug.includes("3-bicas") ? "3 bicas" : "2 bicas" },
      { label: "Produção", value: "Uso intensivo profissional" },
      { label: "Temperaturas", value: "Água fria" },
      ...base,
    ];
  }

  return [
    { label: "Tecnologia", value: "Purificação profissional avançada" },
    { label: "Filtragem", value: "Osmose / ultrafiltração / UV" },
    ...base,
  ];
}

function getTechnologies(categories: EnterpriseCategory[]): string[] {
  if (categories.includes("purificadores")) {
    return ["Osmose inversa", "Ultrafiltração", "Carvão ativado", "UV"];
  }
  if (categories.includes("sistemas-profissionais")) {
    return ["Refrigeração eficiente", "Dispensação inteligente", "Filtração multicamada"];
  }
  return ["Tecnologia WaterPro", "Filtração profissional", "Design corporativo"];
}

function getCompareWith(slug: string): string[] | undefined {
  const comparisons: Record<string, string[]> = {
    "waterline-pro": ["waterline-prime", "waterline-max"],
    "waterline-prime": ["waterline-pro", "waterline-smart"],
    "ice-40-2-bicas": ["ice-80-2-bicas", "ice-110-3-bicas"],
    "ice-80-2-bicas": ["ice-40-2-bicas", "ice-80-3-bicas"],
    "ice-80-3-bicas": ["ice-80-2-bicas", "ice-110-3-bicas"],
    "ice-110-3-bicas": ["ice-80-3-bicas"],
    "plus-home-purificador-de-agua-fria-e-natural": [
      "plus-home-purificador-de-agua-fria-natural-e-quente",
      "plus-home-puricador-de-agua-fria-natural-e-com-gas",
    ],
    "plus-home-purificador-de-agua-fria-natural-e-quente": [
      "plus-home-purificador-de-agua-fria-e-natural",
      "plus-home-puricador-de-agua-fria-natural-e-com-gas",
    ],
    "plus-home-puricador-de-agua-fria-natural-e-com-gas": [
      "plus-home-purificador-de-agua-fria-e-natural",
      "plus-home-purificador-de-agua-fria-natural-e-quente",
    ],
    "waterline-touch": ["waterline-touch-compact", "waterline-smart"],
    "waterline-touch-compact": ["waterline-touch", "waterline-go"],
  };
  return comparisons[slug];
}

function enrichProduct(raw: (typeof rawProducts)[number]): EnterpriseProduct {
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
    benefits: getBenefits(),
    specs: getSpecs(raw.slug, categories),
    technologies: getTechnologies(categories),
    idealFor: applications.map((a) => {
      const labels: Record<EnterpriseApplication, string> = {
        escritorios: "Escritórios e coworkings",
        hoteis: "Hotéis e alojamento",
        restaurantes: "Restaurantes e cafés",
        clinicas: "Clínicas e consultórios",
        hospitais: "Hospitais e saúde",
        ginasios: "Ginásios e wellness",
        escolas: "Escolas e universidades",
        industria: "Indústria e produção",
        comercio: "Comércio e retalho",
        "espacos-publicos": "Espaços públicos",
      };
      return labels[a];
    }),
    warranty: "Garantia WaterPro até 5 anos",
    certifications: ["ISO 9001", "Conformidade CE", "Certificação DGAV"],
    faq: [
      {
        question: "A instalação está incluída?",
        answer:
          "A instalação profissional é realizada pela equipa técnica WaterPro. Solicite orçamento para condições específicas ao seu espaço.",
      },
      {
        question: "Qual a capacidade ideal para a minha empresa?",
        answer:
          "Depende do número de utilizadores e do tipo de negócio. A nossa equipa recomenda o modelo ideal após análise técnica.",
      },
      {
        question: "Existe plano de manutenção?",
        answer:
          "Sim. Oferecemos planos preventivos para garantir desempenho, higiene e continuidade operacional.",
      },
    ],
    relatedSlugs: [],
    compareWith: getCompareWith(raw.slug),
    featured: [
      "waterline-pro",
      "waterline-touch",
      "ice-110-3-bicas",
      "columbia-aqua-juman-sparkling-4-em-1",
      "plus-home-purificador-de-agua-fria-natural-e-quente",
    ].includes(raw.slug),
  };
}

export const enterpriseProducts: EnterpriseProduct[] = (
  rawProducts as (typeof rawProducts)
).map(enrichProduct);

enterpriseProducts.forEach((product) => {
  product.relatedSlugs = enterpriseProducts
    .filter(
      (p) =>
        p.slug !== product.slug &&
        p.categories.some((c) => product.categories.includes(c))
    )
    .slice(0, 4)
    .map((p) => p.slug);
});

export function getEnterpriseProductBySlug(slug: string): EnterpriseProduct | undefined {
  return enterpriseProducts.find((p) => p.slug === slug);
}

export function getAllEnterpriseSlugs(): string[] {
  return enterpriseProducts.map((p) => p.slug);
}

export function filterEnterpriseProducts({
  category,
  application,
  search,
  sort,
}: {
  category?: EnterpriseCategory | "all";
  application?: EnterpriseApplication | "all";
  search?: string;
  sort?: "name" | "featured";
}): EnterpriseProduct[] {
  let result = [...enterpriseProducts];

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
        p.categories.some((c) => c.includes(q))
    );
  }

  if (sort === "featured") {
    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  } else {
    result.sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }

  return result;
}
