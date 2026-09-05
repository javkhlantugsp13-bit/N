// Provider start - returns "Not configured" unless env vars present.
// Clients should call /api/auth/provider with { provider } via POST.
const { jsonResponse } = require('../utils');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, {error:'Method not allowed'});
  try {
    const body = JSON.parse(event.body || '{}');
    const { provider } = body;
    if (!provider) return jsonResponse(400, {error:'provider required'});
    const p = provider.toLowerCase();

    // Check relevant env var set for allowed providers:
    const enabled = {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      facebook: !!(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
      apple: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
      tiktok: !!(process.env.TIKTOK_CLIENT_ID && process.env.TIKTOK_CLIENT_SECRET),
      x: !!(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET)
    }[p];

    if (!enabled) {
      return jsonResponse(501, {error:`${provider} auth not configured. Add ${provider.toUpperCase()} client ID/SECRET to environment variables.`});
    }

    // When configured, you should implement a real OAuth start redirect.
    // For Phase 0 we return a message instructing how to configure it.
    return jsonResponse(200, {message:`${provider} appears configured. Complete the OAuth flow on the server to redirect to ${provider}.`});
  } catch (err) {
    console.error(err);
    return jsonResponse(500, {error:'Server error'});
  }
};
