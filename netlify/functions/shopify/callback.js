// Shopify callback should exist to complete OAuth. Implementation requires verifying HMAC, exchanging code for access token.
const { jsonResponse } = require('../utils');

exports.handler = async function(event){
  return jsonResponse(200, { message: 'Shopify callback endpoint (implement exchange when credentials are set)' });
};
