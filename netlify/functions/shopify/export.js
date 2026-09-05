const { readStore } = require('../data-store');
const { jsonResponse } = require('../utils');

exports.handler = async function(event){
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  try{
    const body = JSON.parse(event.body||'{}');
    const { title, price, description='', video='' } = body;
    if (!title || !price) return jsonResponse(400, { error: 'title and price required' });
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const rows = [["Handle","Title","Body (HTML)","Vendor","Variant Price","Status"], [handle, title, `<p>${description}${video?` Video: ${video}`:''}</p>`, 'Liftly', price, 'draft']];
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    return { statusCode: 200, headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${handle}-shopify.csv"` }, body: csv };
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
