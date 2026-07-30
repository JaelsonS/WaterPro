import { writeFileSync } from "fs";

const slugs = [
  "columbia-aqua-juman-sparkling-4-em-1",
  "eco-15",
  "fonte-com-osmose-de-pe",
  "fonte-ultrafiltracao-desk",
  "fontes-coral-wai-blue-mountain",
  "ice-110-3-bicas",
  "ice-40-2-bicas",
  "ice-80-2-bicas",
  "ice-80-3-bicas",
  "luma",
  "mac-200-f5-osmose",
  "pedais-mac-200-f3-2-em-aco-inoxidavel",
  "pedal-mac-200-f3-1-em-aco-inoxidavel",
  "plus-home-puricador-de-agua-fria-natural-e-com-gas",
  "plus-home-purificador-de-agua-fria-e-natural",
  "plus-home-purificador-de-agua-fria-natural-e-quente",
  "porta-copos-branco-p101",
  "waterline-flow",
  "waterline-go",
  "waterline-hydra",
  "waterline-led",
  "waterline-max",
  "waterline-moon",
  "waterline-prime",
  "waterline-pro",
  "waterline-smart",
  "waterline-touch-compact",
  "waterline-touch",
];

function decodeHtml(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function scrape(slug) {
  const url = `https://waterpro.pt/loja/para-a-sua-empresa/${slug}/`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const html = await res.text();
  const title = decodeHtml(html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || "");
  const shortDesc = decodeHtml(
    html
      .match(/<div class="woocommerce-product-details__short-description"[^>]*>([\s\S]*?)<\/div>/)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() || ""
  );
  const longDesc = decodeHtml(
    html
      .match(
        /<div class="woocommerce-Tabs-panel[^"]*panel-description[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="woocommerce-Tabs-panel/
      )?.[1]
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || shortDesc
  );
  const images = [
    ...new Set(
      (html.match(/https:\/\/waterpro\.pt\/wp-content\/uploads\/[^"'\s]+\.(?:webp|jpg|jpeg|png)/g) || []).filter(
        (u) => !u.match(/100x100|150x150|300x300|LOGO/)
      )
    ),
  ].slice(0, 8);

  return { slug, title, shortDesc, longDesc: longDesc.slice(0, 2000), images };
}

const results = [];
for (const slug of slugs) {
  const r = await scrape(slug);
  if (r) results.push(r);
  await new Promise((r) => setTimeout(r, 150));
}

writeFileSync("src/data/enterprise/raw-products.json", JSON.stringify(results, null, 2));
console.log(`Scraped ${results.length} enterprise products`);
