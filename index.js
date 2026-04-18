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

client.once('ready', (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!TRIGGER.test(msg.content)) return;
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

client.login(token);
