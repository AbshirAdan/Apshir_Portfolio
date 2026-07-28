/**
 * API smoke tests — run against a live server.
 * Usage: node scripts/api-smoke-test.js
 * Env:   API_BASE=http://localhost:5000/api (default)
 */
const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

let passed = 0;
let failed = 0;

async function request(method, path, { token, body, expectStatus } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  const ok = expectStatus ? res.status === expectStatus : res.ok;
  if (!ok) {
    throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json)}`);
  }

  if (json && typeof json.success === 'boolean' && !json.success && expectStatus !== 401 && expectStatus !== 422) {
    throw new Error(`${method} ${path} → success:false ${json.message}`);
  }

  return { status: res.status, json };
}

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

async function main() {
  console.log(`\nAPI Smoke Tests → ${API_BASE}\n`);

  let token = null;

  await test('GET /health', () => request('GET', '/health'));
  await test('GET /health/db', () => request('GET', '/health/db'));

  await test('GET /public/settings', () => request('GET', '/public/settings'));
  await test('GET /public/profile', () => request('GET', '/public/profile'));
  await test('GET /public/stats', () => request('GET', '/public/stats'));
  await test('GET /public/projects', () => request('GET', '/public/projects?page=1&limit=5'));
  await test('GET /public/skills', () => request('GET', '/public/skills'));
  await test('GET /public/resume (nullable)', () => request('GET', '/public/resume'));

  await test('POST /public/contact validation (422)', async () => {
    await request('POST', '/public/contact', { body: { full_name: '' }, expectStatus: 422 });
  });

  await test('POST /auth/login invalid (401)', async () => {
    await request('POST', '/auth/login', {
      body: { email: 'bad@test.com', password: 'wrong' },
      expectStatus: 401,
    });
  });

  await test('GET /projects unauthorized (401)', async () => {
    await request('GET', '/projects', { expectStatus: 401 });
  });

  await test('POST /auth/login valid', async () => {
    const { json } = await request('POST', '/auth/login', {
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    token = json.data.token;
    if (!token) throw new Error('No token returned');
  });

  const authed = (method, path, opts = {}) => request(method, path, { ...opts, token });

  await test('GET /auth/profile', () => authed('GET', '/auth/profile'));
  await test('GET /dashboard/stats', () => authed('GET', '/dashboard/stats'));
  await test('GET /projects', () => authed('GET', '/projects?page=1&limit=5'));
  await test('GET /skills', () => authed('GET', '/skills'));
  await test('GET /certificates', () => authed('GET', '/certificates'));
  await test('GET /education', () => authed('GET', '/education'));
  await test('GET /experience', () => authed('GET', '/experience'));
  await test('GET /blogs', () => authed('GET', '/blogs?page=1&limit=5'));
  await test('GET /messages', () => authed('GET', '/messages'));
  await test('GET /settings', () => authed('GET', '/settings'));
  await test('GET /social-links', () => authed('GET', '/social-links'));
  await test('GET /resume', () => authed('GET', '/resume'));

  await test('POST /skills validation (422)', async () => {
    await authed('POST', '/skills', { body: {}, expectStatus: 422 });
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Smoke test runner failed:', err.message);
  process.exit(1);
});
