require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Options } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    GuildMemberManager: 0,
    UserManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    VoiceStateManager: 0,
    GuildEmojiManager: 0,
    GuildStickerManager: 0,
    GuildBanManager: 0,
    GuildScheduledEventManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    GuildForumThreadManager: 0,
    GuildTextThreadManager: 0,
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: { interval: 60, lifetime: 120 },
    guildMembers: { interval: 120, lifetime: 300 },
  },
});

const TRIGGER = /\bw\s+\S+/i;

client.once('clientReady', (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on('error', (err) => {
  console.error('discord client error:', err);
});

client.on('warn', (message) => {
  console.warn('discord client warning:', message);
});

client.on('shardDisconnect', (event, shardId) => {
  console.warn(`discord shard ${shardId} disconnected: code=${event.code} reason=${event.reason || 'none'}`);
});

client.on('shardReconnecting', (shardId) => {
  console.warn(`discord shard ${shardId} reconnecting`);
});

client.on('shardResume', (shardId, replayedEvents) => {
  console.log(`discord shard ${shardId} resumed (${replayedEvents} replayed events)`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  const pinged = client.user && msg.mentions.has(client.user);
  if (!pinged && !TRIGGER.test(msg.content)) return;
  try {
    await msg.reply('W SAPL');
  } catch (err) {
    console.error('reply failed:', err.message);
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN env var is missing');
  process.exit(1);
}

process.on('unhandledRejection', (err) => {
  console.error('unhandled promise rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('uncaught exception:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.warn('received SIGTERM, destroying Discord client before shutdown');
  client.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.warn('received SIGINT, destroying Discord client before shutdown');
  client.destroy();
  process.exit(0);
});

async function loginWithRetry(maxAttempts = 10, delayMs = 15000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await client.login(token);
      return;
    } catch (err) {
      const retryable = err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.message?.includes('timeout') || err.message?.includes('ECONNREFUSED');
      if (!retryable || attempt === maxAttempts) {
        console.error(`discord login failed (attempt ${attempt}):`, err);
        process.exit(1);
      }
      console.warn(`discord login attempt ${attempt} timed out, retrying in ${delayMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

loginWithRetry();
