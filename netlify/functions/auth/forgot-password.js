const { readStore, writeStore } = require('../data-store');
const { jsonResponse } = require('../utils');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

function getTransport(){
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, secure:false, auth:{ user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  }
  return null;
}

exports.handler = async function(event){
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });
  try{
    const body = JSON.parse(event.body || '{}');
    const { email } = body;
    if (!email) return jsonResponse(400, { error: 'email required' });
    const store = readStore();
    const user = (store.users || []).find(u=>u.email.toLowerCase()===email.toLowerCase());
    // Create token regardless (but only send email if configured)
    const token = uuidv4();
    if (!store.passwordResetRequests) store.passwordResetRequests = [];
    store.passwordResetRequests.push({ id: token, email, createdAt: new Date().toISOString(), used:false });
    writeStore(store);
    const transporter = getTransport();
    if (!transporter) return jsonResponse(501, { error: 'Email not configured. Set SMTP configuration.' });
    const resetUrl = `${process.env.APP_ORIGIN || 'http://localhost:8888'}/reset.html?token=${token}`;
    await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject: 'Reset your password', text: `Reset: ${resetUrl}`, html: `<p>Reset your password: <a href="${resetUrl}">Reset</a></p>` });
    return jsonResponse(200, { message: 'Password reset sent' });
  }catch(e){ console.error(e); return jsonResponse(500, { error: 'Server error' }); }
};
