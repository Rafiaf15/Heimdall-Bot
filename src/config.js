import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseWordSet(value) {
  return new Set(parseCsv(value).map((item) => item.toLowerCase()));
}

function loadWordConfig() {
  const configPath = path.join(__dirname, "..", "data", "negative-words.json");
  const fileRaw = fs.readFileSync(configPath, "utf8");
  return JSON.parse(fileRaw);
}

export function getBotConfig() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error("Missing DISCORD_TOKEN. Set it in your .env file.");
  }

  const warningTemplate =
    process.env.WARNING_TEMPLATE ||
    "Pesan kamu dihapus karena mengandung kata negatif. Mohon gunakan bahasa yang sopan.";

  return {
    token,
    guildId: process.env.GUILD_ID || "",
    selectedLanguages: parseCsv(process.env.MOD_LANGUAGE || "id"),
    exemptChannelIds: new Set(parseCsv(process.env.EXEMPT_CHANNEL_IDS)),
    exemptRoleIds: new Set(parseCsv(process.env.EXEMPT_ROLE_IDS)),
    approverRoleIds: new Set(parseCsv(process.env.APPROVER_ROLE_IDS)),
    allowWords: parseWordSet(process.env.ALLOW_WORDS),
    noticeDeleteMs: Number.parseInt(process.env.NOTICE_DELETE_MS || "2000", 10),
    warningTemplate,
    wordConfig: loadWordConfig()
  };
}
