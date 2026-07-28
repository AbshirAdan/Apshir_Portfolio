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

  console.log('1) Contact submit…');
  const email = `msg_${Date.now()}@example.com`;
  const contact = await req('POST', '/contact', {
    full_name: 'Messaging Tester',
    email,
    subject: 'Hello Admin',
    message: 'This is a test message for the messaging system.',
  });
  console.log(contact.status, contact.json.message);
  if (contact.status !== 201) process.exit(1);
  const messageId = contact.json.data.id;

  console.log('2) Register + login user with same email…');
  const password = 'Visitor@12345';
  await req('POST', '/auth/register', {
    full_name: 'Messaging Tester',
    email,
    password,
    confirmPassword: password,
  });
  const userLogin = await req('POST', '/auth/signin', { email, password });
  const userToken = userLogin.json.data?.token;
  console.log('user login', userLogin.status);

  console.log('3) Admin login…');
  const admin = await req('POST', '/auth/signin', { email: adminEmail, password: adminPassword });
  const adminToken = admin.json.data.token;

  console.log('4) Admin list messages…');
  const list = await req('GET', '/admin/messages?search=Hello', null, adminToken);
  console.log(list.status, 'total', list.json.data?.pagination?.total);

  console.log('5) Admin open message…');
  const detail = await req('GET', `/admin/messages/${messageId}`, null, adminToken);
  console.log(detail.status, detail.json.data?.status);

  console.log('6) Admin reply…');
  const reply = await req(
    'POST',
    `/admin/messages/${messageId}/reply`,
    { reply: 'Thanks for your message! We will follow up soon.' },
    adminToken
  );
  console.log(reply.status, reply.json.data?.status, 'email', reply.json.data?.email);

  console.log('7) User messages…');
  const userMsgs = await req('GET', '/user/messages', null, userToken);
  console.log(userMsgs.status, 'items', userMsgs.json.data?.items?.length, 'unread', userMsgs.json.data?.unreadReplies);

  console.log('8) User open message (marks reply read)…');
  const userMsg = await req('GET', `/user/messages/${messageId}`, null, userToken);
  console.log(userMsg.status, 'replies', userMsg.json.data?.replies?.length);

  console.log('9) User cannot access admin messages…');
  const blocked = await req('GET', '/admin/messages', null, userToken);
  console.log(blocked.status);

  console.log('OK — messaging smoke passed');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
