const { jsonResponse } = require('../utils');
const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_SCOPES, SHOPIFY_APP_URL } = process.env;
const { Shopify } = require('@shopify/shopify-api');

exports.handler = async function(event){
  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) return jsonResponse(501, { error: 'Shopify not configured' });
  // Begin OAuth install flow
  try{
    const state = Math.random().toString(36).slice(2,10);
    const shop = (JSON.parse(event.body||'{}')).shop;
    if (!shop) return jsonResponse(400, { error: 'shop required' });
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${encodeURIComponent(SHOPIFY_SCOPES||'read_products')}&redirect_uri=${encodeURIComponent((SHOPIFY_APP_URL||'') + '/.netlify/functions/shopify/callback')}&state=${state}`;
    return jsonResponse(200, { url: installUrl });
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
