const bcrypt = require('bcryptjs');
const { readStore, writeStore } = require('../data-store');
const { createUserId, createUserCode, signSession, cookieHeaderForToken, jsonResponse } = require('../utils');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, {error:'Method not allowed'});
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, password } = body;
    if (!email || !password || !name) return jsonResponse(400, {error:'name, email, and password are required.'});
    const store = readStore();
    const existing = (store.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return jsonResponse(409, {error:'A user with that email already exists.'});
    const hash = bcrypt.hashSync(password, 10);
    const id = createUserId(name);
    const code = createUserCode(name);
    const now = (new Date()).toISOString();
    const user = {
      id, name, email, passwordHash: hash, signupAt: now, lastLogin: now, status: 'Active', code, plan:'Starter', revenue:0, views:0, purchases:0
    };
    store.users = [...(store.users || []), user];
    writeStore(store);

    // create session token (do not include passwordHash)
    const session = { userId: user.id, email: user.email, name: user.name, isAdmin: false };
    const token = signSession(session);
    const cookie = cookieHeaderForToken(token, { maxAge: 60*60*24*7 });

    // respond with public user data only
    const publicUser = { id:user.id, name:user.name, email:user.email, signupAt:user.signupAt, status:user.status, code:user.code };
    return {
      statusCode: 201,
      headers: { 'Set-Cookie': cookie, 'Content-Type':'application/json' },
      body: JSON.stringify({ message:'Account created', user: publicUser })
    };
  } catch (err) {
    console.error(err);
    return jsonResponse(500, {error:'Server error'});
  }
};
