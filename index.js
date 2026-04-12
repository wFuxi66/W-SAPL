require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

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
    });
} else {
    console.error('[Error] DISCORD_TOKEN is missing in environment variables!');
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
