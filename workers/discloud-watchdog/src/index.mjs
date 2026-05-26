const APP_ID = '1776506693689';
const BASE_URL = 'https://api.discloud.app/v2';
const COOLDOWN_SECONDS = 300;
const RESTART_LOCK_KEY = `restart-lock:${APP_ID}`;

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runWatchdog(env));
  },
};

async function runWatchdog(env) {
  if (!env.DISCLOUD_TOKEN) {
    console.log('DISCLOUD_TOKEN secret is missing.');
    return;
  }

  const status = await discloud(env, `/app/${APP_ID}/status`);
  if (!status.ok) {
    console.log(`Discloud status check failed: ${status.status} ${status.text}`);
    return;
  }

  const container = getContainerStatus(status.body);
  console.log(`Discloud app ${APP_ID} container=${container || 'unknown'}`);

  if (container === 'Online') {
    return;
  }

  if (!container) {
    console.log(`Container status not found in response: ${JSON.stringify(status.body)}`);
    return;
  }

  const lock = await env.WATCHDOG_STATE.get(RESTART_LOCK_KEY);
  if (lock) {
    console.log('Restart skipped because cooldown lock is active.');
    return;
  }

  const restart = await discloud(env, `/app/${APP_ID}/restart`, { method: 'PUT' });
  if (!restart.ok) {
    console.log(`Discloud restart failed: ${restart.status} ${restart.text}`);
    return;
  }

  await env.WATCHDOG_STATE.put(RESTART_LOCK_KEY, String(Date.now()), {
    expirationTtl: COOLDOWN_SECONDS,
  });

  console.log(`Restart triggered for app ${APP_ID}.`);
}

async function discloud(env, path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'api-token': env.DISCLOUD_TOKEN,
      ...options.headers,
    },
  });

  const text = await response.text();
  const body = parseJson(text);

  return {
    ok: response.ok,
    status: response.status,
    text,
    body,
  };
}

function parseJson(text) {
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function getContainerStatus(body) {
  if (Array.isArray(body?.apps)) {
    return body.apps.find((app) => String(app.id) === APP_ID)?.container;
  }

  return (
    body?.apps?.container ??
    body?.app?.container ??
    body?.data?.container ??
    body?.container
  );
}
