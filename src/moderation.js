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

export function normalizeFullText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, "");
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
  const normalizedText = normalizeFullText(text);

  const matched = new Set();

  // 1. token-level match (existing)
  for (const token of tokens) {
    if (allowSet.has(token)) continue;

    if (blockedSet.has(token)) {
      matched.add(token);
    }
  }

  // 2. phrase-level match (NEW)
  for (const blocked of blockedSet) {
    if (blocked.length < 4) continue; // optional filter biar hemat performa

    if (normalizedText.includes(blocked)) {
      matched.add(blocked);
    }
  }

  return [...matched];
}