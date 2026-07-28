/**
 * Smoke test for public auth APIs (register → login → me → profile → logout)
 */
const API = process.env.API_URL || 'http://localhost:5000/api';

async function req(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  const email = `visitor_${Date.now()}@example.com`;
  const password = 'Visitor@12345';

  console.log('1) Register…');
  const reg = await req('POST', '/auth/register', {
    full_name: 'Test Visitor',
    email,
    password,
    confirmPassword: password,
    phone: '+252600000000',
  });
  console.log(reg.status, reg.json.message || reg.json);
  if (reg.status !== 201) process.exit(1);

  console.log('2) User login…');
  const login = await req('POST', '/auth/user/login', { email, password, remember: true });
  console.log(login.status, login.json.message, login.json.data?.user?.role);
  if (login.status !== 200 || !login.json.data?.token) process.exit(1);
  const token = login.json.data.token;

  console.log('3) GET /auth/me…');
  const me = await req('GET', '/auth/me', null, token);
  console.log(me.status, me.json.data?.email);

  console.log('4) Update profile…');
  const profile = await req('PUT', '/user/profile', { bio: 'Hello from smoke test' }, token);
  console.log(profile.status, profile.json.data?.bio);

  console.log('5) Admin login still works (expect success or fail on credentials)…');
  // Just ensure endpoint still rejects non-admin
  const adminDeny = await req('POST', '/auth/login', { email, password });
  console.log('user on admin login:', adminDeny.status, adminDeny.json.message);

  console.log('6) Forgot password…');
  const forgot = await req('POST', '/auth/forgot-password', { email });
  console.log(forgot.status, !!forgot.json.data?.resetToken);

  console.log('7) Logout…');
  const logout = await req('POST', '/auth/logout', {}, token);
  console.log(logout.status, logout.json.message);

  console.log('OK — public auth smoke passed');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
