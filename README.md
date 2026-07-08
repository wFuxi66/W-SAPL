# W SAPL Bot

Replies `W SAPL` to any message containing `w <someone>` (case-insensitive), or when the bot is mentioned.

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

### 3. Deploy to Coolify

1. Push the repo to your Git provider
2. In Coolify, create a new resource and select the repo
3. Coolify auto-detects the `Dockerfile` — build pack stays as **Dockerfile**
4. Add an environment variable:
   - Key: `DISCORD_TOKEN`
   - Value: the token from step 1
5. No ports to expose (the bot connects outbound, it doesn't listen for HTTP)
6. **Deploy**

Coolify automatically restarts the container on crash — no external watchdog needed.

## Local test

Requires Node.js 18+.

```bash
cp .env.example .env
# edit .env and paste your token
npm install
npm start
```
