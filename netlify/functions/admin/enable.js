const { parseCookies, verifySession, signSession, cookieHeader, jsonResponse } = require('../utils');

exports.handler = async function(event){
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  if (process.env.NODE_ENV === 'production') return jsonResponse(403, { error: 'Admin shortcut disabled in production.' });
  try{
    const body = JSON.parse(event.body || '{}');
    const { username } = body;
    if (username !== 'Norway') return jsonResponse(401, { error: 'Invalid dev admin username.' });
    const cookies = parseCookies(event.headers.cookie || '');
    const existingToken = cookies.liftly_session;
    let payload = existingToken ? verifySession(existingToken) : null;
    if (!payload) payload = { userId: 'dev-admin', name: 'Developer', email: 'dev@local', isAdmin:true, devAdmin:true };
    else { payload.isAdmin = true; payload.devAdmin = true; }
    const token = signSession(payload);
    const cookie = cookieHeader('liftly_session', token, { maxAge: 60*60*2 });
    return { statusCode: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Dev admin enabled for this session.' }) };
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
