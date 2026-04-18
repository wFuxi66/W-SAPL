# W SAPL Bot

Replies `W SAPL` to any message containing `w sapl` (case-insensitive).

## Setup

### 1. Create the Discord bot

1. Go to https://discord.com/developers/applications
2. **New Application** → name it `W SAPL`
3. Left sidebar: **Bot** → scroll to **Privileged Gateway Intents** → enable **MESSAGE CONTENT INTENT**
4. **Reset Token** → copy the token (you'll need it in step 3)

### 2. Invite the bot to your server

1. Left sidebar: **OAuth2** → **URL Generator**
2. Scopes: check `bot`
3. Bot permissions: check `Send Messages` + `Read Message History`
4. Copy the generated URL, open it in your browser, and authorize

### 3. Deploy to Bot-Hosting.net (free, no card)

1. Sign up at https://bot-hosting.net (email only)
2. Dashboard → **Create Bot** → choose **Node.js** runtime
3. Zip the project folder (without `node_modules/` and `.env`) and upload it
4. In the bot settings, add an environment variable:
   - Key: `DISCORD_TOKEN`
   - Value: *(the token from step 1)*
5. Click **Start**

The console should show `Logged in as W SAPL#xxxx`.

## Local test (optional)

Requires Node.js 18+.

```bash
cp .env.example .env
# edit .env and paste your token
npm install
npm start
```
