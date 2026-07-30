import { writeFileSync } from "fs";

const slugs = [
  "coral-wai-pulse","descalcificadores-coral-wai-modelos-8-e-11","filtros-de-agua-big-blue-10p","filtros-de-agua-big-blue-20p","hydronic-pure","hydronic-pure-plus","hydronik-h2-live","hydrowater-nature-cyclone","kit-de-limpeza-o3","mizu","oko-ozean-pacific","osmose-com-lampada-uv-wake","osmose-com-torneira-inteligente-zeya","osmose-edesign-premium","osmose-h600","osmose-maui","osmose-monoi","silurus","torneira-bilbao-2-0-de-3-vias","torneira-burdeos-de-3-vias","torneira-de-3-vias-berlin-2-0","torneira-dobravel-zagreb-de-3-vias","torneira-dublin-2-0-de-3-vias","torneira-durban-2-0-de-3-vias","torneira-extensivel-de-3-vias-paris-matte","torneira-lisboa-de-4-vias","torneira-londres-de-3-vias","torneira-monaco-de-3-vias","torneira-odda-aco-polido","torneira-odda-anthracite","torneira-odda-copper","torneira-odda-gold","torneira-paris-de-3-vias","torneira-paris-lite-de-3-vias","torneira-paris-matte-de-3-vias","torneira-praga-de-5-vias","water-alkaline-800","waterline-600ph"
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
  const url = `https://waterpro.pt/loja/para-sua-casa/${slug}/`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const html = await res.text();
  const title = decodeHtml(html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || "");
  const shortDesc = decodeHtml(
    html.match(/<div class="woocommerce-product-details__short-description"[^>]*>([\s\S]*?)<\/div>/)?.[1]?.replace(/<[^>]+>/g, "").trim() || ""
  );
  const longDesc = decodeHtml(
    html.match(/<div class="woocommerce-Tabs-panel[^"]*panel-description[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="woocommerce-Tabs-panel/)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || shortDesc
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

writeFileSync("src/data/products-scraped.json", JSON.stringify(results, null, 2));
console.log(`Scraped ${results.length} products`);
