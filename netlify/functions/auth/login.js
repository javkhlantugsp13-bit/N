const bcrypt = require('bcryptjs');
const { readStore, writeStore } = require('../data-store');
const { signSession, cookieHeader, jsonResponse } = require('../utils');

exports.handler = async function(event){
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  try{
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;
    if (!email || !password) return jsonResponse(400, { error: 'email,password required' });
    const store = readStore();
    const user = (store.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.passwordHash) return jsonResponse(401, { error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) return jsonResponse(401, { error: 'Invalid credentials' });
    user.lastLogin = new Date().toISOString();
    writeStore(store);
    const session = { userId: user.id, email: user.email, name: user.name };
    const token = signSession(session);
    const cookie = cookieHeader('liftly_session', token, { maxAge: 60*60*24*7 });
    return { statusCode: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Signed in', user: { id: user.id, name: user.name, email: user.email, signupAt: user.signupAt, code: user.code } }) };
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
