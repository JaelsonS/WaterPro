export type KnowledgeSnippet = { title: string; content: string };

function tokenize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length >= 3);
}

export function findRelevantSnippets(params: {
  queryText: string;
  candidates: KnowledgeSnippet[];
  limit?: number;
}): KnowledgeSnippet[] {
  const limit = params.limit ?? 3;
  const qTokens = new Set(tokenize(params.queryText));
  if (qTokens.size === 0) return params.candidates.slice(0, limit);

  const scored = params.candidates.map((c) => {
    const hay = `${c.title} ${c.content}`;
    const tokens = tokenize(hay);
    let score = 0;
    for (const t of tokens) {
      if (qTokens.has(t)) score += 1;
    }
    return { item: c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).map((s) => s.item).slice(0, limit);
}

