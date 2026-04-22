import fs from "node:fs";
import path from "node:path";

const negativeWordsPath = path.join(process.cwd(), "data", "negative-words.json");
const negativeWordsRaw = fs.readFileSync(negativeWordsPath, "utf8");
const config = JSON.parse(negativeWordsRaw);

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

const guildSettingsPath = path.join(process.cwd(), "data", "guild-settings.json");
const guildSettingsRaw = fs.readFileSync(guildSettingsPath, "utf8");
const guildSettings = JSON.parse(guildSettingsRaw);

if (!guildSettings || typeof guildSettings !== "object") {
  throw new Error("Guild settings must be a JSON object.");
}

if (!guildSettings.guilds || typeof guildSettings.guilds !== "object") {
  throw new Error("Guild settings must contain a guilds object.");
}

for (const [guildId, value] of Object.entries(guildSettings.guilds)) {
  if (!value || typeof value !== "object") {
    throw new Error(`Guild settings for ${guildId} must be an object.`);
  }

  if (!Array.isArray(value.approvedChannelIds)) {
    throw new Error(`Guild settings for ${guildId} must include approvedChannelIds array.`);
  }

  for (const channelId of value.approvedChannelIds) {
    if (typeof channelId !== "string" || channelId.trim().length === 0) {
      throw new Error(`Guild ${guildId} has invalid channel id entries.`);
    }
  }
}

console.log("[check-config] guild-settings.json is valid.");
