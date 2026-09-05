// Shopify connect stub for Phase 0.
// If SHOPIFY_API_KEY/SECRET are not provided we return "Not configured".
// When configured, full OAuth install flow must be implemented here.

const { jsonResponse } = require('../utils');

exports.handler = async function(event) {
  if (process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET) {
    return jsonResponse(200, {message:'Shopify credentials present. Implement OAuth flow to redirect to Shopify approval URL.'});
  } else {
    return jsonResponse(501, {error:'Shopify not configured. Add SHOPIFY_API_KEY and SHOPIFY_API_SECRET in environment variables.'});
  }
};
