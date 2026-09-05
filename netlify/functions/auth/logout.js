const { jsonResponse } = require('../utils');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, {error:'Method not allowed'});
  // Clear cookie by setting Max-Age=0
  return {
    statusCode: 200,
    headers: { 'Set-Cookie': 'liftly_session=; Path=/; HttpOnly; Max-Age=0', 'Content-Type':'application/json' },
    body: JSON.stringify({ message:'Signed out' })
  };
};
