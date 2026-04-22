import { Client, GatewayIntentBits, Partials } from "discord.js";
import { getBotConfig } from "./config.js";
import { buildBlockedSet, findMatchedBlockedWords } from "./moderation.js";

const config = getBotConfig();
const blockedSet = buildBlockedSet(config.wordConfig, config.selectedLanguages);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`[bot] Logged in as ${client.user?.tag || "unknown"}`);
  console.log(`[bot] Languages: ${config.selectedLanguages.join(", ")}`);
  console.log(`[bot] Blocked words loaded: ${blockedSet.size}`);
});

function isExemptMessage(message) {
  if (config.exemptChannelIds.has(message.channelId)) {
    return true;
  }

  if (!message.member) {
    return false;
  }

  for (const roleId of message.member.roles.cache.keys()) {
    if (config.exemptRoleIds.has(roleId)) {
      return true;
    }
  }

  return false;
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content) {
    return;
  }

  if (isExemptMessage(message)) {
    return;
  }

  const matchedWords = findMatchedBlockedWords(message.content, blockedSet, config.allowWords);
  if (matchedWords.length === 0) {
    return;
  }

  try {
    await message.delete();

    const channelNotice = await message.channel.send({
      content: `<@${message.author.id}> pesanmu melanggar aturan dan sudah dihapus.`
    });

    setTimeout(() => {
      channelNotice.delete().catch(() => {});
    }, 2000);

    console.log(
      `[moderation] Deleted message by ${message.author.tag}; matched=${matchedWords.join(",")}`
    );
  } catch (error) {
    console.error("[moderation] Failed to process violating message", error);
  }
});

client.login(config.token);
