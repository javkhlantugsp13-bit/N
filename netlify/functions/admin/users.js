const { readStore } = require('../data-store');
const { parseCookies, verifySession, jsonResponse } = require('../utils');

exports.handler = async function(event){
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });
  try{
    const cookies = parseCookies(event.headers.cookie || '');
    const token = cookies.liftly_session;
    const session = token ? verifySession(token) : null;
    const isDev = session && session.devAdmin;
    const isAdmin = session && session.isAdmin;
    if (!isDev && !isAdmin) return jsonResponse(403, { error: 'Not authorized' });
    const store = readStore();
    const users = (store.users||[]).map(u => ({ id: u.id, name: u.name, email: u.email, signupAt: u.signupAt, lastLogin: u.lastLogin||null, status: u.status||'Active', code: u.code||null, plan: u.plan||'Starter' }));
    return jsonResponse(200, users);
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
