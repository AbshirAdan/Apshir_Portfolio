const fetch = globalThis.fetch;

async function verify() {
  console.log('--- Fullstack Verification ---');
  
  // 1. Vite Frontend HTML
  const viteRes = await fetch('http://localhost:5173');
  const html = await viteRes.text();
  console.log('1. Frontend Dev Server (5173):', viteRes.ok ? 'OK (HTML served)' : 'FAILED');

  // 2. Backend Health
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('2. Backend Health Endpoint (5000):', health);

  // 3. Public Profile API
  const profileRes = await fetch('http://localhost:5000/api/public/profile');
  const profile = await profileRes.json();
  console.log('3. Public Profile API:', profile.success ? 'OK' : 'FAILED', profile.data?.full_name);

  // 4. Admin Auth Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@portfolio.com', password: 'Admin@12345' }),
  });
  const login = await loginRes.json();
  console.log('4. Admin Login Auth:', login.success ? 'OK (JWT Token generated)' : 'FAILED');

  // 5. Proxy API via Vite (5173 -> 5000)
  const proxyRes = await fetch('http://localhost:5173/api/public/settings');
  const proxyData = await proxyRes.json();
  console.log('5. Vite Proxy /api/public/settings:', proxyData.success ? 'OK' : 'FAILED');

  console.log('--- Verification Complete ---');
}

verify().catch(console.error);
