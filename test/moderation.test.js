import test from "node:test";
import assert from "node:assert/strict";
import {
  buildBlockedSet,
  findMatchedBlockedWords,
  normalizeToken
} from "../src/moderation.js";

test("findMatchedBlockedWords matches slang and mixed languages", () => {
  const config = {
    defaultLanguage: "id",
    languages: {
      id: {
        insult: ["bodoh", "tolol", "anjing", "goblok", "asw", "bangsat"],
        slang: ["anjg", "ajg", "bgst", "kntl", "memek"]
      },
      en: {
        insult: ["idiot", "stupid", "bastard"],
        slang: ["stfu", "fck", "asshole"]
      }
    }
  };

  const blocked = buildBlockedSet(config, ["id", "en"]);
  
  // Test Bahasa Gaul Indo
  assert.deepEqual(findMatchedBlockedWords("dasar ajg lu", blocked), ["ajg"]);
  
  // Test Slang Inggris
  assert.deepEqual(findMatchedBlockedWords("hey stfu man", blocked), ["stfu"]);
});