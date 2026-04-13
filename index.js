require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Exit on unhandled errors so Render/the host will restart the process
process.on('unhandledRejection', (reason) => {
    console.error('[Unhandled Rejection]', reason);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]', err);
    // Attempt to cleanly disconnect before exiting so the host can restart
    client.destroy();
    process.exit(1);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Log Discord client errors without crashing (discord.js handles reconnection internally)
client.on('error', (err) => {
    console.error('[Discord Error]', err);
});

client.on('warn', (info) => {
    console.warn('[Discord Warn]', info);
});

client.on('shardDisconnect', (event, shardId) => {
    console.warn(`[Discord] Shard ${shardId} disconnected (code ${event.code})`);
});

client.on('shardReconnecting', (shardId) => {
    console.log(`[Discord] Shard ${shardId} reconnecting...`);
});

client.on('messageCreate', (message) => {
    // Ignore messages from the bot itself
    if (message.author.bot) return;

    if (message.content.toLowerCase() === 'w sapl') {
        message.reply('W SAPL');
    }
});

const token = process.env.DISCORD_TOKEN;
console.log(`[Debug] Token found: ${!!token}, Length: ${token?.length || 0}`);

if (token) {
    client.login(token).catch(err => {
        console.error('[Login Error]', err.message);
        // Exit so the host process manager (Render) restarts the service.
        // If the token is invalid, correct DISCORD_TOKEN in the environment variables.
        process.exit(1);
    });
} else {
    console.error('[Error] DISCORD_TOKEN is missing in environment variables!');
    process.exit(1);
}

// Add a dummy Express server to pass Render's health checks for Free Web Services
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('W SAPL Discord Bot is running!'));
app.get('/ping', (req, res) => res.send('OK'));

app.listen(port, () => console.log(`Web server listening on port ${port}!`));

// Self-ping to keep Render free tier alive
// Pings itself every 5 minutes to prevent the 15-min sleep
setInterval(async () => {
    try {
        const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
        await fetch(`${baseUrl}/ping`);
        console.log('[Keep-alive] Self-ping sent');
    } catch (err) {
        // localhost pings fail on Render before deployment, that's fine
    }
}, 5 * 60 * 1000);
