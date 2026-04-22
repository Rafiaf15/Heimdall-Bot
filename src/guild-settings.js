import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsPath = path.join(__dirname, "..", "data", "guild-settings.json");

function loadRawSettings() {
  try {
    const raw = fs.readFileSync(settingsPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { guilds: {} };
    }

    if (!parsed.guilds || typeof parsed.guilds !== "object") {
      return { guilds: {} };
    }

    return parsed;
  } catch {
    return { guilds: {} };
  }
}

function saveRawSettings(settings) {
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

export function getApprovedChannelIds(guildId) {
  const settings = loadRawSettings();
  const guildSettings = settings.guilds[guildId] || {};
  const channelIds = Array.isArray(guildSettings.approvedChannelIds)
    ? guildSettings.approvedChannelIds
    : [];

  return new Set(channelIds.map((item) => String(item)).filter(Boolean));
}

export function upsertApprovedChannel(guildId, channelId, shouldEnable) {
  const settings = loadRawSettings();
  const currentGuild = settings.guilds[guildId] || { approvedChannelIds: [] };
  const currentSet = new Set(
    (Array.isArray(currentGuild.approvedChannelIds) ? currentGuild.approvedChannelIds : [])
      .map((item) => String(item))
      .filter(Boolean)
  );

  if (shouldEnable) {
    currentSet.add(String(channelId));
  } else {
    currentSet.delete(String(channelId));
  }

  settings.guilds[guildId] = {
    approvedChannelIds: [...currentSet]
  };
  saveRawSettings(settings);

  return new Set(settings.guilds[guildId].approvedChannelIds);
}
