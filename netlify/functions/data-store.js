// Simple store.json wrapper for serverless functions (local/dev).
// Uses synchronous filesystem operations for simplicity.
// In production you should replace with a DB-backed implementation.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const initialData = {
  dashboard: { storeName:'Northstar Goods', netSales:12480, orders:186, conversion:3.8, profit:4990, payout:2180.40 },
  queue: [],
  users: [
    {id:'alex-chen', name:'Alex Chen', email:'alex@northstargoods.com', plan:'Growth', revenue:12480, views:6800000, purchases:186, status:'Active', signupAt:'2026-01-01T09:00:00.000Z', lastLogin:null, code:'ALEXC'},
    {id:'maya-singh', name:'Maya Singh', email:'maya@oceanroom.com', plan:'Starter', revenue:4360, views:1200000, purchases:73, status:'Active', signupAt:'2026-02-12T10:00:00.000Z', lastLogin:null, code:'MAYAS'},
    {id:'jordan-lee', name:'Jordan Lee', email:'jordan@northmarket.com', plan:'Growth', revenue:21890, views:9100000, purchases:312, status:'Active', signupAt:'2026-03-10T11:00:00.000Z', lastLogin:null, code:'JORDL'}
  ],
  accessRequests: [
    {id:'request-sam-rivera', name:'Sam Rivera', email:'sam@rivera.store', requestedAt:'2026-09-05T09:30:00.000Z', status:'pending'}
  ],
  plans: [{id:'starter', name:'Starter', price:19, description:'For your first product tests.', features:['10 product saves','Basic sales signals','CSV exports']},{id:'growth', name:'Growth', price:49, description:'For stores ready to move faster.', features:['Unlimited product saves','Viral product intel','Store performance']},{id:'scale', name:'Scale', price:99, description:'For teams building a portfolio.', features:['Everything in Growth','Team access','Priority support']}],
  products: [
    {id:'magnetic-phone-mount', title:'Magnetic Phone Mount', cost:3.82, rating:4.8, supplierOrders:'2,000+'},
    {id:'pet-hair-remover', title:'Pet Hair Remover', cost:4.25, rating:4.9, supplierOrders:'1,000+'},
    {id:'portable-blender', title:'Portable Blender', cost:8.90, rating:4.7, supplierOrders:'500+'}
  ]
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try { return JSON.parse(raw); } catch { return initialData; }
}

function writeStore(value) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(value, null, 2));
}

module.exports = {
  readStore,
  writeStore,
  DATA_FILE,
  DATA_DIR
};
