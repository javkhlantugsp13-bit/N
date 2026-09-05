const { jsonResponse } = require('../utils');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

exports.handler = async function(event){
  if (!process.env.STRIPE_SECRET_KEY) return jsonResponse(501, { error: 'Stripe not configured' });
  // webhook processing stub (production must verify signatures)
  try{
    const body = JSON.parse(event.body || '{}');
    console.log('Stripe webhook received', body.type || 'unknown');
    return jsonResponse(200, { received: true });
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
