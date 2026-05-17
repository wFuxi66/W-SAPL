require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const TRIGGER = /\bw sapl\b/i;

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

client.login(token).catch((err) => {
  console.error('discord login failed:', err);
  process.exit(1);
});
