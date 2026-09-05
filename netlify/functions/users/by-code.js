const { readStore } = require('../../data-store');
const { jsonResponse } = require('../../utils');

exports.handler = async function(event) {
  try {
    const qs = event.queryStringParameters || {};
    const code = qs.code || '';
    if (!code) return jsonResponse(400, { error: 'code query parameter required' });
    const store = readStore();
    const user = (store.users || []).find(u => (u.code || '').toUpperCase() === code.toUpperCase());
    if (!user) return jsonResponse(404, { error: 'User not found' });
    // return saved list or empty
    return jsonResponse(200, { id: user.id, name: user.name, code: user.code, saved: user.saved || [] });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { error: 'Server error' });
  }
};
