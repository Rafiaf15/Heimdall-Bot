import {
  ChannelType,
  Client,
  GatewayIntentBits,
  Partials,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";
import { getBotConfig } from "./config.js";
import { getApprovedChannelIds, upsertApprovedChannel } from "./guild-settings.js";
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

const moderationChannelCommand = new SlashCommandBuilder()
  .setName("moderation-channel")
  .setDescription("Atur channel yang diizinkan untuk moderasi kata negatif")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Aktifkan moderasi di channel ini")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Text channel target")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Nonaktifkan moderasi di channel ini")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("Text channel target")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("list")
      .setDescription("Lihat channel yang sudah disetujui untuk moderasi")
  );

async function registerModerationChannelCommand() {
  const payload = moderationChannelCommand.toJSON();
  const targetGuilds = config.guildId
    ? [client.guilds.cache.get(config.guildId)].filter(Boolean)
    : [...client.guilds.cache.values()];

  for (const guild of targetGuilds) {
    await guild.commands.set([payload]);
    console.log(`[setup] moderation command registered for guild ${guild.id}`);
  }
}

client.once("ready", async () => {
  console.log(`[bot] Logged in as ${client.user?.tag || "unknown"}`);
  console.log(`[bot] Languages: ${config.selectedLanguages.join(", ")}`);
  console.log(`[bot] Blocked words loaded: ${blockedSet.size}`);
  console.log(`[bot] Approval role override count: ${config.approverRoleIds.size}`);

  try {
    await registerModerationChannelCommand();
  } catch (error) {
    console.error("[setup] Failed to register moderation command", error);
  }
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

function canManageModeration(interaction) {
  const hasManageGuild = interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
  if (hasManageGuild) {
    return true;
  }

  if (!interaction.member || !interaction.member.roles || !interaction.member.roles.cache) {
    return false;
  }

  for (const roleId of interaction.member.roles.cache.keys()) {
    if (config.approverRoleIds.has(roleId)) {
      return true;
    }
  }

  return false;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (interaction.commandName !== "moderation-channel") {
    return;
  }

  if (!interaction.guildId) {
    await interaction.reply({
      content: "Command ini hanya bisa dipakai di server.",
      ephemeral: true
    });
    return;
  }

  if (!canManageModeration(interaction)) {
    await interaction.reply({
      content: "Kamu tidak punya izin untuk mengatur channel moderasi.",
      ephemeral: true
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();
  if (subcommand === "list") {
    const approved = [...getApprovedChannelIds(interaction.guildId)];
    if (approved.length === 0) {
      await interaction.reply({
        content: "Belum ada channel yang disetujui. Gunakan /moderation-channel add.",
        ephemeral: true
      });
      return;
    }

    await interaction.reply({
      content: `Channel moderasi aktif: ${approved.map((id) => `<#${id}>`).join(", ")}`,
      ephemeral: true
    });
    return;
  }

  const channel = interaction.options.getChannel("channel", true);
  const isAdd = subcommand === "add";
  const updated = [...upsertApprovedChannel(interaction.guildId, channel.id, isAdd)];

  await interaction.reply({
    content: isAdd
      ? `Moderasi diaktifkan untuk ${channel}. Total channel aktif: ${updated.length}.`
      : `Moderasi dinonaktifkan untuk ${channel}. Total channel aktif: ${updated.length}.`,
    ephemeral: true
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content || !message.guildId) {
    return;
  }

  const approvedChannels = getApprovedChannelIds(message.guildId);
  if (approvedChannels.size === 0 || !approvedChannels.has(message.channelId)) {
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
    }, Number.isNaN(config.noticeDeleteMs) ? 2000 : Math.max(config.noticeDeleteMs, 1000));

    console.log(
      `[moderation] Deleted message by ${message.author.tag}; matched=${matchedWords.join(",")}`
    );
  } catch (error) {
    console.error("[moderation] Failed to process violating message", error);
  }
});

client.login(config.token);
