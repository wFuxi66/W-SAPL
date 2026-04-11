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

client.login(process.env.DISCORD_TOKEN);

// Add a dummy Express server to pass Render's health checks for Free Web Services
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('W SAPL Discord Bot is running!'));
app.listen(port, () => console.log(`Web server listening on port ${port}!`));
