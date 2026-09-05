const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret';

function signSession(payload, opts={}){
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: opts.expiresIn || '7d' });
}
function verifySession(token){
  try { return jwt.verify(token, SESSION_SECRET); } catch(e) { return null; }
}

function parseCookies(header){
  const out = {};
  if (!header) return out;
  header.split(';').forEach(pair=>{
    const [k,v] = pair.split('='); if (k) out[k.trim()] = decodeURIComponent((v||'').trim());
  });
  return out;
}

function cookieHeader(name, value, opts={}){
  const parts = [];
  parts.push(`${name}=${value}`);
  parts.push('Path=/');
  parts.push('HttpOnly');
  if (opts.secure) parts.push('Secure');
  if (opts.maxAge) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join('; ');
}

function jsonResponse(status, payload){
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
}

module.exports = { signSession, verifySession, parseCookies, cookieHeader, jsonResponse, uuidv4 };
