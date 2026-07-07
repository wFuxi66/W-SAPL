require('dotenv').config();
const WebSocket = require('ws');

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error('DISCORD_TOKEN env var is missing');
  process.exit(1);
}

const GATEWAY = 'wss://gateway.discord.gg/?v=10&encoding=json';
const REST = 'https://discord.com/api/v10';
const INTENTS = 1 << 0 | 1 << 9 | 1 << 12 | 1 << 15;

let ws;
let heartbeatTimer;
let seq;
let sessionId;
let botId;
let reconnectAttempts = 0;

async function send(channelId, content, replyId) {
  const body = { content };
  if (replyId) body.message_reference = { message_id: replyId };
  const res = await fetch(`${REST}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('send failed:', res.status, await res.text().catch(() => ''));
}

function connect() {
  ws = new WebSocket(GATEWAY);

  ws.on('open', () => {
    console.log('connected to gateway');
  });

  ws.on('message', (raw) => {
    const { op, d, s, t } = JSON.parse(raw.toString());
    if (s) seq = s;

    switch (op) {
      case 10:
        heartbeatTimer = setInterval(() => ws.send(JSON.stringify({ op: 1, d: seq })), d.heartbeat_interval);
        ws.send(JSON.stringify({
          op: 2,
          d: {
            token: TOKEN,
            intents: INTENTS,
            properties: { os: 'linux', browser: 'w-sapl', device: 'w-sapl' },
          },
        }));
        reconnectAttempts = 0;
        break;

      case 0:
        if (t === 'READY') {
          sessionId = d.session_id;
          botId = d.user.id;
          console.log(`logged in as ${d.user.username}`);
        } else if (t === 'MESSAGE_CREATE') {
          onMessage(d);
        }
        break;

      case 7:
      case 9:
        cleanup();
        setTimeout(connect, 1000);
        break;
    }
  });

  ws.on('close', () => {
    cleanup();
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
    reconnectAttempts++;
    setTimeout(connect, delay);
  });

  ws.on('error', (err) => {
    console.error('gateway error:', err.message);
  });
}

function cleanup() {
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

const TRIGGER = /\bw\s+\S+/i;

function onMessage(d) {
  if (d.author?.bot) return;
  const isPinged = botId && d.mentions?.some((m) => m.id === botId);
  if (!isPinged && !TRIGGER.test(d.content)) return;
  send(d.channel_id, 'W SAPL', d.id).catch((err) => console.error('reply failed:', err.message));
}

process.on('unhandledRejection', (err) => {
  console.error('unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('uncaught exception:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  cleanup();
  ws?.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  cleanup();
  ws?.close();
  process.exit(0);
});

connect();
