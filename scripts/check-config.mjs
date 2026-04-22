import fs from "node:fs";
import path from "node:path";

const configPath = path.join(process.cwd(), "data", "negative-words.json");
const raw = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(raw);

if (!config || typeof config !== "object") {
  throw new Error("Config must be a JSON object.");
}

if (!config.languages || typeof config.languages !== "object") {
  throw new Error("Config must contain a languages object.");
}

for (const [language, categories] of Object.entries(config.languages)) {
  if (!categories || typeof categories !== "object") {
    throw new Error(`Language ${language} must be an object of categories.`);
  }

  for (const [category, words] of Object.entries(categories)) {
    if (!Array.isArray(words)) {
      throw new Error(`Category ${language}.${category} must be an array.`);
    }

    for (const word of words) {
      if (typeof word !== "string" || word.trim().length === 0) {
        throw new Error(`Category ${language}.${category} contains invalid word entries.`);
      }
    }
  }
}

console.log("[check-config] negative-words.json is valid.");
