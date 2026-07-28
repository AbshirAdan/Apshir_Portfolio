require('dotenv').config();

const API = process.env.API_URL || 'http://localhost:5000/api';

async function req(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  console.log('1) Unified signin as admin…');
  const admin = await req('POST', '/auth/signin', { email: adminEmail, password: adminPassword, remember: true });
  console.log(admin.status, admin.json.data?.user?.role);
  if (admin.status !== 200 || admin.json.data?.user?.role !== 'admin') process.exit(1);

  const adminToken = admin.json.data.token;
  const dash = await req('GET', '/dashboard/stats', null, adminToken);
  console.log('2) Admin dashboard API', dash.status);

  console.log('3) Register user…');
  const email = `role_${Date.now()}@example.com`;
  const password = 'Visitor@12345';
  const reg = await req('POST', '/auth/register', {
    full_name: 'Role Test',
    email,
    password,
    confirmPassword: password,
  });
  console.log('register', reg.status);

  console.log('4) Unified signin as user…');
  const user = await req('POST', '/auth/signin', { email, password });
  console.log(user.status, user.json.data?.user?.role);
  const userToken = user.json.data?.token;

  const blocked = await req('GET', '/dashboard/stats', null, userToken);
  console.log('5) User blocked from admin API', blocked.status, blocked.json.message);

  console.log('6) Admin login alias /auth/login…');
  const alias = await req('POST', '/auth/login', { email: adminEmail, password: adminPassword });
  console.log(alias.status, alias.json.data?.user?.role);

  console.log('OK — role-based auth smoke passed');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
