const { readStore, writeStore } = require('../data-store');
const { jsonResponse } = require('../utils');
const bcrypt = require('bcryptjs');

exports.handler = async function(event){
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  try{
    const body = JSON.parse(event.body || '{}');
    const { token, password } = body;
    if (!token || !password) return jsonResponse(400, { error: 'token and password required' });
    const store = readStore();
    const req = (store.passwordResetRequests||[]).find(r => r.id === token && !r.used);
    if (!req) return jsonResponse(400, { error: 'Invalid or expired token' });
    const user = (store.users || []).find(u => u.email.toLowerCase() === req.email.toLowerCase());
    if (!user) return jsonResponse(404, { error: 'User not found' });
    user.passwordHash = bcrypt.hashSync(password, 10);
    req.used = true;
    writeStore(store);
    return jsonResponse(200, { message: 'Password updated' });
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
