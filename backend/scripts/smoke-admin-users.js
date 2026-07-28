require('dotenv').config();

const API = process.env.API_URL || 'http://localhost:5000/api';
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

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
  const login = await req('POST', '/auth/login', { email: adminEmail, password: adminPassword });
  if (login.status !== 200) {
    console.error('Admin login failed', login);
    process.exit(1);
  }
  const token = login.json.data.token;
  console.log('1) Admin login OK');

  const list = await req('GET', '/admin/users?page=1&limit=10', null, token);
  console.log('2) List users', list.status, 'total', list.json.data?.pagination?.total, 'stats', list.json.data?.stats);
  if (list.status !== 200) process.exit(1);

  const search = await req('GET', '/admin/users?search=admin&role=admin', null, token);
  console.log('3) Search/filter', search.status, search.json.data?.items?.length);

  // Create a disposable user via register
  const email = `mgmt_${Date.now()}@example.com`;
  const password = 'Visitor@12345';
  const reg = await req('POST', '/auth/register', {
    full_name: 'Mgmt Test',
    email,
    password,
    confirmPassword: password,
  });
  console.log('4) Register test user', reg.status);
  const userId = reg.json.data.id;

  const getOne = await req('GET', `/admin/users/${userId}`, null, token);
  console.log('5) Get user', getOne.status, getOne.json.data?.email);

  const upd = await req('PUT', `/admin/users/${userId}`, {
    full_name: 'Mgmt Updated',
    phone: '+252111',
    bio: 'Edited by admin',
    role: 'user',
    status: 'active',
  }, token);
  console.log('6) Update user', upd.status, upd.json.data?.full_name);

  const status = await req('PATCH', `/admin/users/${userId}/status`, { status: 'blocked' }, token);
  console.log('7) Block user', status.status, status.json.data?.status);

  const blockedLogin = await req('POST', '/auth/user/login', { email, password });
  console.log('8) Blocked login should fail', blockedLogin.status, blockedLogin.json.message);

  const activate = await req('PATCH', `/admin/users/${userId}/status`, { status: 'active' }, token);
  console.log('9) Activate', activate.status);

  const role = await req('PATCH', `/admin/users/${userId}/role`, { role: 'admin' }, token);
  console.log('10) Promote to admin', role.status, role.json.data?.role);

  const demote = await req('PATCH', `/admin/users/${userId}/role`, { role: 'user' }, token);
  console.log('11) Demote to user', demote.status);

  // Protect super admin delete
  const admins = list.json.data.items.filter((u) => u.role === 'admin');
  const superAdmin = admins.find((u) => u.email === adminEmail) || admins[0];
  if (superAdmin) {
    const deny = await req('DELETE', `/admin/users/${superAdmin.id}`, null, token);
    console.log('12) Super admin delete protected', deny.status, deny.json.message);
  }

  const del = await req('DELETE', `/admin/users/${userId}`, null, token);
  console.log('13) Delete test user', del.status);

  const noAuth = await req('GET', '/admin/users');
  console.log('14) No token blocked', noAuth.status);

  console.log('OK — admin user management smoke passed');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
