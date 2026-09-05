const { jsonResponse } = require('../utils');
const stripeKey = process.env.STRIPE_SECRET_KEY;

exports.handler = async function(event){
  if (!stripeKey) return jsonResponse(501, { error: 'Stripe not configured' });
  const Stripe = require('stripe');
  const stripe = Stripe(stripeKey);
  try{
    const body = JSON.parse(event.body||'{}');
    const { priceId, successUrl, cancelUrl } = body;
    if (!priceId) return jsonResponse(400, { error: 'priceId required' });
    const session = await stripe.checkout.sessions.create({ payment_method_types: ['card'], mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }], success_url: successUrl || (process.env.APP_ORIGIN + '/payments.html?success=1'), cancel_url: cancelUrl || (process.env.APP_ORIGIN + '/payments.html?canceled=1') });
    return jsonResponse(200, { id: session.id, url: session.url });
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
