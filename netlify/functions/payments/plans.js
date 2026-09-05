const { readStore } = require('../data-store');
const { jsonResponse } = require('../utils');

exports.handler = async function(event){
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });
  try{
    const store = readStore();
    return jsonResponse(200, store.plans || []);
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
