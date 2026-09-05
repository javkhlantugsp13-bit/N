const { parseCookies, verifySession, jsonResponse } = require('../utils');
const { readStore } = require('../data-store');

exports.handler = async function(event) {
  try {
    const cookies = parseCookies(event.headers.cookie || '');
    const token = cookies.liftly_session;
    if (!token) return jsonResponse(401, { error: 'Not authenticated' });
    const session = verifySession(token);
    if (!session || !session.userId) return jsonResponse(401, { error: 'Not authenticated' });
    const store = readStore();
    const user = (store.users || []).find(u => u.id === session.userId);
    if (!user) return jsonResponse(404, { error: 'User not found' });
    const publicUser = { id:user.id, name:user.name, email:user.email, signupAt:user.signupAt, lastLogin:user.lastLogin || null, status:user.status || 'Active', code:user.code, plan:user.plan || 'Starter', saved: user.saved || [] };
    return jsonResponse(200, publicUser);
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { error: 'Server error' });
  }
};
