const { readStore, writeStore } = require('../data-store');
const { jsonResponse } = require('../utils');
const { v4: uuidv4 } = require('uuid');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, {error:'Method not allowed'});
  try {
    const body = JSON.parse(event.body || '{}');
    const { email } = body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonResponse(400, {error:'Please enter a valid email address.'});
    const store = readStore();
    const user = (store.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      // For Phase 0, return a token but do not mark as signed in (we don't send email)
      return jsonResponse(200, {message:'Sign-in link prepared.', token: uuidv4()});
    }
    let request = (store.accessRequests || []).find(item => item.email.toLowerCase() === email.toLowerCase());
    if (request?.status === 'approved') return jsonResponse(200, {message:'Your access is approved. Sign-in link prepared.', token: uuidv4()});
    if (!request) {
      request = { id: uuidv4(), name: email.split('@')[0], email, requestedAt: (new Date()).toISOString(), status:'pending' };
      store.accessRequests = [...(store.accessRequests || []), request];
      writeStore(store);
    }
    return jsonResponse(202, {message:'Your access request is waiting for admin approval.'});
  } catch (err) {
    console.error(err);
    return jsonResponse(500, {error:'Server error'});
  }
};
