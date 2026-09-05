// Utility helpers for functions: cookie parsing, JWT, id/code generation, responses.

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret';

function parseCookies(cookieHeader) {
  const res = {};
  if (!cookieHeader) return res;
  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const [k, ...rest] = p.split('=');
    res[k.trim()] = decodeURIComponent(rest.join('=')).trim();
  }
  return res;
}

function signSession(payload, opts = {}) {
  // Short expiry for dev Phase 0
  const token = jwt.sign(payload, SESSION_SECRET, { expiresIn: opts.expiresIn || '7d' });
  return token;
}

function verifySession(token) {
  try { return jwt.verify(token, SESSION_SECRET); } catch { return null; }
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

function createUserId(name) {
  // create snake-case id from name + uuid segment
  const base = (name || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base}-${uuidv4().split('-')[0]}`;
}

function createUserCode(name) {
  // user code: first 5 upper chars from name + random
  const namePart = (name || 'USER').toUpperCase().replace(/[^A-Z]/g, '').slice(0,5) || 'USER';
  const rand = Math.random().toString(36).slice(2,6).toUpperCase();
  return `${namePart}${rand}`;
}

function cookieHeaderForToken(token, opts = {}) {
  const parts = [];
  parts.push(`liftly_session=${token}`);
  parts.push('Path=/');
  parts.push('HttpOnly');
  // don't set Secure by default so it works with http://localhost in netlify dev
  if (opts.secure) parts.push('Secure');
  if (opts.maxAge) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join('; ');
}

module.exports = {
  parseCookies,
  signSession,
  verifySession,
  jsonResponse,
  createUserId,
  createUserCode,
  cookieHeaderForToken
};
