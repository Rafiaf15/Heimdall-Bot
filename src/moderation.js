export function normalizeToken(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function extractTokens(text) {
  const chunks = String(text || "")
    .toLowerCase()
    .normalize("NFKC")
    .split(/\s+/);

  return chunks
    .map((chunk) => normalizeToken(chunk))
    .filter(Boolean);
}

export function buildBlockedSet(config, selectedLanguages) {
  const languages = config.languages || {};
  const fallbacks = [config.defaultLanguage].filter(Boolean);
  const activeLanguages = [...new Set([...(selectedLanguages || []), ...fallbacks])];

  const blocked = new Set();
  for (const lang of activeLanguages) {
    const categories = languages[lang] || {};
    for (const words of Object.values(categories)) {
      if (!Array.isArray(words)) {
        continue;
      }

      for (const word of words) {
        const normalized = normalizeToken(word);
        if (normalized) {
          blocked.add(normalized);
        }
      }
    }
  }

  return blocked;
}

export function findMatchedBlockedWords(text, blockedSet, allowSet = new Set()) {
  const tokens = extractTokens(text);
  const matched = new Set();

  for (const token of tokens) {
    if (allowSet.has(token)) {
      continue;
    }

    if (blockedSet.has(token)) {
      matched.add(token);
    }
  }

  return [...matched];
}
