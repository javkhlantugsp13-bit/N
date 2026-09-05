const bcrypt = require('bcryptjs');
const { readStore, writeStore } = require('../data-store');
const { signSession, cookieHeader, jsonResponse, uuidv4 } = require('../utils');

exports.handler = async function(event){
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  try{
    const body = JSON.parse(event.body || '{}');
    const { name, email, password } = body;
    if (!name || !email || !password) return jsonResponse(400, { error: 'name,email,password required' });
    const store = readStore();
    if (!store.users) store.users = [];
    if (store.users.find(u => u.email.toLowerCase() === email.toLowerCase())) return jsonResponse(409, { error: 'Email already exists' });
    const hash = bcrypt.hashSync(password, 10);
    const id = `${email.split('@')[0].replace(/[^a-z0-9]/gi,'').toLowerCase()}-${uuidv4().split('-')[0]}`;
    const code = (name.replace(/[^A-Z]/ig,'').toUpperCase().slice(0,5) || 'USER') + Math.random().toString(36).slice(2,6).toUpperCase();
    const now = new Date().toISOString();
    const user = { id, name, email, passwordHash: hash, signupAt: now, lastLogin: now, status: 'Active', plan: 'Starter', code, saved: [] };
    store.users.push(user);
    writeStore(store);
    const session = { userId: id, email, name };
    const token = signSession(session);
    const cookie = cookieHeader('liftly_session', token, { maxAge: 60*60*24*7 });
    return { statusCode: 201, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Account created', user: { id, name, email, signupAt: now, status: 'Active', code } }) };
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
