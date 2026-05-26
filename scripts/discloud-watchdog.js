const appId = process.env.DISCLOUD_APP_ID || '1776506693689';
const token = process.env.DISCLOUD_TOKEN;
const baseUrl = process.env.DISCLOUD_API_BASE_URL || 'https://api.discloud.app/v2';

if (!token) {
  console.error('DISCLOUD_TOKEN env var is missing');
  process.exitCode = 1;
  return;
}

async function discloud(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'api-token': token,
      ...options.headers,
    },
  });

  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    data = { raw: body };
  }

  if (!response.ok) {
    throw new Error(`Discloud ${response.status} ${response.statusText}: ${JSON.stringify(data)}`);
  }

  return data;
}

function getAppStatus(data) {
  if (Array.isArray(data.apps)) return data.apps.find((app) => app.id === appId);
  if (data.apps && typeof data.apps === 'object') return data.apps;
  return data;
}

async function main() {
  const data = await discloud(`/app/${appId}/status`);
  const app = getAppStatus(data);
  const container = app && app.container;

  if (!container) {
    throw new Error(`Could not read Discloud container status: ${JSON.stringify(data)}`);
  }

  console.log(`Discloud app ${appId} container=${container}`);

  if (container === 'Online') {
    console.log('No restart needed.');
    return;
  }

  console.warn(`App is ${container}; requesting restart.`);
  const restart = await discloud(`/app/${appId}/restart`, { method: 'PUT' });
  console.log(restart.message || 'Restart requested.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
