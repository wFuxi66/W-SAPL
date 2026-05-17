# W SAPL Bot

Replies `W SAPL` to any message containing `w sapl` (case-insensitive), or when the bot is mentioned.

## Setup

### 1. Create the Discord bot

1. Go to https://discord.com/developers/applications
2. Create a new application named `W SAPL`
3. Left sidebar: **Bot** -> scroll to **Privileged Gateway Intents** -> enable **MESSAGE CONTENT INTENT**
4. **Reset Token** -> copy the token

### 2. Invite the bot to your server

1. Left sidebar: **OAuth2** -> **URL Generator**
2. Scopes: check `bot`
3. Bot permissions: check `Send Messages` and `Read Message History`
4. Copy the generated URL, open it in your browser, and authorize

### 3. Deploy to Discloud

1. Create or open the bot app in Discloud
2. Zip the project folder without `node_modules/`, `.env`, `discloud/`, or `*.log`
3. Upload the zip with `discloud.config`
4. In the app settings, add an environment variable:
   - Key: `DISCORD_TOKEN`
   - Value: the token from step 1
5. Start or restart the app

The console should show `Logged in as W SAPL#xxxx`.

`discloud.config` sets `AUTORESTART=true`, so Discloud should restart the process if Node crashes. If the app is still stopped by the free host itself, move the bot to a paid always-on host/VPS or a free provider that explicitly promises no suspension.

## Local test

Requires Node.js 18+.

```bash
cp .env.example .env
# edit .env and paste your token
npm install
npm start
```
