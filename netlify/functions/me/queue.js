const { parseCookies, verifySession, jsonResponse } = require('../utils');
const { readStore, writeStore } = require('../data-store');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  try {
    const cookies = parseCookies(event.headers.cookie || '');
    const token = cookies.liftly_session;
    if (!token) return jsonResponse(401, { error: 'Not authenticated' });
    const session = verifySession(token);
    if (!session || !session.userId) return jsonResponse(401, { error: 'Not authenticated' });
    const body = JSON.parse(event.body || '{}');
    const { productId } = body;
    if (!productId) return jsonResponse(400, { error: 'productId required' });
    const store = readStore();
    const user = (store.users || []).find(u => u.id === session.userId);
    if (!user) return jsonResponse(404, { error: 'User not found' });
    const product = (store.products || []).find(p => p.id === productId);
    if (!product) return jsonResponse(404, { error: 'Product not found' });
    if (!user.saved) user.saved = [];
    if (!user.saved.some(p => p.id === product.id)) user.saved.push({ id: product.id, title: product.title, addedAt: new Date().toISOString() });
    writeStore(store);
    return jsonResponse(201, { message: 'Saved', product: { id: product.id, title: product.title } });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { error: 'Server error' });
  }
};
