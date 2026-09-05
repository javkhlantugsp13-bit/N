const { readStore, writeStore } = require('../data-store');
const { jsonResponse } = require('../utils');

exports.handler = async function(event){
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  try{
    const body = JSON.parse(event.body || '{}');
    const store = readStore();
    if (!store.queue) store.queue = [];
    const { productId } = body;
    const product = (store.products||[]).find(p=>p.id===productId);
    if (!product) return jsonResponse(404, { error: 'Product not found' });
    if (!store.queue.some(q => q.id === product.id)) store.queue.push({ ...product, addedAt: new Date().toISOString() });
    writeStore(store);
    return jsonResponse(201, { message: `${product.title} added to queue`, product });
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
