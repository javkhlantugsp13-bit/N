const { readStore, writeStore } = require('../data-store');
const { jsonResponse } = require('../utils');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, {error:'Method not allowed'});
  try {
    const body = JSON.parse(event.body || '{}');
    const store = readStore();
    const product = (store.products || []).find(item => item.id === body.productId);
    if (!product) return jsonResponse(404, {error:'Product not found'});
    if (!store.queue) store.queue = [];
    if (!store.queue.some(item => item.id === product.id)) store.queue.push({...product, addedAt:new Date().toISOString()});
    writeStore(store);
    return jsonResponse(201, {message:`${product.title} added to your queue.`, product});
  } catch (err) {
    console.error(err);
    return jsonResponse(500, {error:'Server error'});
  }
};
