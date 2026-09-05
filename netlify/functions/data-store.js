// data-store abstraction: uses store.json in local dev, switch to DATABASE_URL for production
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ dashboard:{}, users:[], products:[], queue:[], plans:[] }, null, 2));
}

function readStore() {
  // Production adapter placeholder: if DATABASE_URL exists, throw to indicate DB mode
  if (process.env.DATABASE_URL) {
    throw new Error('Production DB adapter not implemented. Set DATABASE_URL and implement adapter.');
  }
  ensure();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try { return JSON.parse(raw); } catch (e) { return { dashboard:{}, users:[], products:[], queue:[], plans:[] }; }
}

function writeStore(obj) {
  if (process.env.DATABASE_URL) {
    throw new Error('Production DB adapter not implemented.');
  }
  ensure();
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

module.exports = { readStore, writeStore, DATA_FILE };
