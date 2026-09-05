// Stripe checkout stub for Phase 0.
// If STRIPE_SECRET_KEY is missing, returns Not configured.

const { jsonResponse } = require('../../utils');

exports.handler = async function(event) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return jsonResponse(501, {error:'Stripe not configured. Add STRIPE_SECRET_KEY in environment variables.'});
  }
  // Real implementation would create Checkout session server-side using stripe library.
  return jsonResponse(200, {message:'Stripe keys present. Implement create-checkout-session here.'});
};
