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

### 3. Deploy to Discloud

1. Create or open the bot app in Discloud
2. Zip the project folder without `node_modules/`, `.env`, `discloud/`, or `*.log`
3. Upload the zip with `discloud.config`
4. In the app settings, add an environment variable:
   - Key: `DISCORD_TOKEN`
   - Value: the token from step 1
5. Start or restart the app

The console should show `Logged in as W SAPL#xxxx`.

`discloud.config` sets `AUTORESTART=true`, but Discloud only applies automatic crash restart on supported paid plans. You can verify the deployed value with:

```bash
discloud app info 1776506693689
```

If Discloud reports `autoRestart=false`, the setting is not active for the deployed app. A free Discloud bot can still be suspended by host policy, so true 24/7 uptime requires a paid Discloud plan that enables auto-restart, or moving the bot to an always-on VPS/process host.

## Watchdog

The primary watchdog is a Cloudflare Worker in `workers/discloud-watchdog`. It runs every minute, checks the Discloud app status, and requests a restart when the container is not `Online`.

It also uses Workers KV as a 5-minute cooldown lock so Discloud is not spammed while the app is starting.

### Deploy the Cloudflare watchdog

Requires Node.js 18+ and a Cloudflare account.

```bash
cd workers/discloud-watchdog
npx wrangler login
npx wrangler kv namespace create WATCHDOG_STATE
```

Copy the returned namespace `id` into `wrangler.toml`, replacing `REPLACE_WITH_KV_NAMESPACE_ID`.

Then add the Discloud API token as a Cloudflare Worker secret:

```bash
npx wrangler secret put DISCLOUD_TOKEN
```

Finally deploy:

```bash
npx wrangler deploy
```

The old GitHub Actions watchdog is kept as a manual fallback in `.github/workflows/discloud-watchdog.yml`, but GitHub scheduled workflows are not reliable enough for the primary wake-up loop.

## Local test

Requires Node.js 18+.

```bash
cp .env.example .env
# edit .env and paste your token
npm install
npm start
```
