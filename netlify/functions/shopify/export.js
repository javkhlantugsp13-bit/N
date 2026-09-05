const { jsonResponse } = require('../utils');

function csvCell(value) { return `"${String(value).replace(/"/g, '""')}"`; }

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, {error:'Method not allowed'});
  try {
    const body = JSON.parse(event.body || '{}');
    const { title, price, description = '', video = '' } = body;
    if (!title || !price) return jsonResponse(400, {error:'Product title and price are required.'});
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const rows = [["Handle","Title","Body (HTML)","Vendor","Variant Price","Status"],[handle,title,`<p>${description}${video ? ` Video: ${video}` : ''}</p>`,'Liftly',price,'draft']];
    const csv = rows.map(row => row.map(csvCell).join(',')).join('\n');
    return {
      statusCode: 200,
      headers: {'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${handle}-shopify.csv"`},
      body: csv
    };
  } catch (err) {
    console.error(err);
    return jsonResponse(500, {error:'Server error'});
  }
};
