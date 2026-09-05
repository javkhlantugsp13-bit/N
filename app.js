const $ = (s) => document.querySelector(s);
const toast = $('#toast');
function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); }
function completeStep(step) { const el = document.querySelector(`.start-step[data-step="${step}"]`); if (!el) return; el.classList.add('done'); el.querySelector('b').textContent = '✓'; }

function setProduct(card) {
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  const title = card.dataset.title || '';
  const price = card.dataset.price || '0.00';
  const tag = card.dataset.tag || '';
  const sales = card.dataset.sales || '';
  const revenue = card.dataset.revenue || '';
  const growth = card.dataset.growth || '';
  const views = card.dataset.views || '';
  document.getElementById('listingTitle').textContent = title;
  document.getElementById('listingPrice').textContent = `$${price}`;
  document.getElementById('listingCopy').textContent = `${tag} — ready to turn attention into orders.`;
  const thumb = document.getElementById('listingThumb');
  thumb.className = `listing-thumb ${card.querySelector('.card-image').classList[1]}`;
  document.getElementById('listingStatus').textContent = 'READY TO EXPORT';
  document.getElementById('sales').textContent = sales;
  document.getElementById('revenue').textContent = revenue;
  document.getElementById('growth').textContent = growth;
  document.getElementById('views').textContent = views;
}
document.querySelectorAll('.product-card').forEach(card => card.addEventListener('click', () => setProduct(card)));

let activeCard = null, startX, startY, originalX, originalY;
document.querySelectorAll('.draggable').forEach(card => {
  card.addEventListener('pointerdown', e => { activeCard = card; startX = e.clientX; startY = e.clientY; originalX = card.offsetLeft; originalY = card.offsetTop; card.setPointerCapture(e.pointerId); card.style.zIndex = 999; });
  card.addEventListener('pointermove', e => { if (!activeCard || activeCard !== card) return; card.style.left = `${originalX + e.clientX - startX}px`; card.style.top = `${originalY + e.clientY - startY}px`; });
  card.addEventListener('pointerup', () => { if (activeCard === card) { activeCard = null; card.style.zIndex = ''; } });
});

function youtubeId(url) { const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/); return match?.[1]; }
function loadVideo() {
  const id = youtubeId(document.getElementById('youtubeUrl').value.trim());
  if (!id) { document.getElementById('inputHelp').textContent = 'Please paste a valid YouTube video URL.'; document.getElementById('inputHelp').style.color = '#ff9ca0'; return; }
  if (location.protocol === 'file:') { document.getElementById('inputHelp').innerHTML = `To preview YouTube videos, open Liftly through the local server at <b>http://localhost:3000</b>. This lets YouTube verify the player. <a href="https://www.youtube.com/watch?v=${id}" target="_blank">Open on YouTube</a>`; document.getElementById('inputHelp').style.color = '#c4ff63'; return; }
  document.getElementById('youtubeFrame').src = `https://www.youtube.com/embed/${id}?rel=0&origin=${encodeURIComponent(location.origin)}&widget_referrer=${encodeURIComponent(location.origin)}`;
  document.getElementById('youtubeFrame').style.display = 'block'; document.getElementById('videoPlaceholder').style.display = 'none';
  document.getElementById('inputHelp').textContent = 'Video loaded. Your product story is ready.'; document.getElementById('inputHelp').style.color = '#c4ff63';
  document.getElementById('listingStatus').textContent = 'VIDEO ATTACHED';
  completeStep('video');
}
document.getElementById('loadVideo').addEventListener('click', loadVideo);
document.getElementById('youtubeUrl').addEventListener('keydown', e => { if (e.key === 'Enter') loadVideo(); });
function scrollToStudio(){ document.getElementById('how').scrollIntoView({behavior:'smooth'}); }
document.getElementById('startButton').addEventListener('click', scrollToStudio); document.getElementById('closingStart').addEventListener('click', scrollToStudio); document.getElementById('watchButton').addEventListener('click', scrollToStudio);

document.getElementById('copyListing').addEventListener('click', async () => { const text = `${document.getElementById('listingTitle').textContent}\n${document.getElementById('listingCopy').textContent}\nPrice: ${document.getElementById('listingPrice').textContent}`; try { await navigator.clipboard.writeText(text); showToast('Listing copied to clipboard'); } catch { showToast('Copy failed — try manually'); } });

document.getElementById('shopifyButton').addEventListener('click', async () => {
  const title = document.getElementById('listingTitle').textContent;
  const price = document.getElementById('listingPrice').textContent.replace('$', '');
  const video = document.getElementById('youtubeUrl').value.trim();
  const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const description = `${document.getElementById('listingCopy').textContent}${video ? ` Watch the product video: ${video}` : ''}`;
  const quote = value => `"${String(value).replace(/"/g,'""')}"`;
  const csv = [["Handle","Title","Body (HTML)","Vendor","Variant Price","Status"], [handle, title, `<p>${description}</p>`, "Liftly", price, "draft"]].map(row => row.map(quote).join(',')).join('\n');
  let download = new Blob([csv], {type:'text/csv'});
  try { const response = await fetch('/api/shopify/export', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title, price, description:document.getElementById('listingCopy').textContent, video})}); if (response.ok) { const blob = await response.blob(); download = blob; } } catch(e){ console.error(e); }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(download);
  link.download = `${handle}-shopify.csv`; link.click(); URL.revokeObjectURL(link.href);
  showToast('Shopify-ready CSV downloaded — upload it in Products → Import.');
  completeStep('store');
});

document.getElementById('navConnect').addEventListener('click', () => showToast('Shopify connection opens here in the live product.'));
document.getElementById('payoutButton').addEventListener('click', () => showToast('Payout details will appear after your Shopify store is connected.'));

document.querySelectorAll('.import-button').forEach(button => button.addEventListener('click', async () => {
  const name = button.dataset.product;
  const productId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  try { const response = await fetch('/api/queue', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({productId})}); if (!response.ok) throw new Error(); } catch { showToast('Unable to add to queue'); return; }
  button.textContent = 'Added ✓'; button.disabled = true; showToast(`${name} was added to your store research queue.`);
}));

document.querySelectorAll('.start-step').forEach(step => step.addEventListener('click', () => {
  const destination = step.dataset.step === 'video' ? '#how' : step.dataset.step === 'store' ? '#how' : '#catalog';
  document.querySelector(destination).scrollIntoView({behavior:'smooth'});
}));

const loginOverlay = document.getElementById('loginOverlay');
function closeLogin() { loginOverlay.classList.remove('open'); loginOverlay.setAttribute('aria-hidden', 'true'); }
document.getElementById('openLogin').addEventListener('click', () => { loginOverlay.classList.add('open'); loginOverlay.setAttribute('aria-hidden', 'false'); });
document.getElementById('closeLogin').addEventListener('click', closeLogin);
loginOverlay.addEventListener('click', event => { if (event.target === loginOverlay) closeLogin(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLogin(); });

document.querySelectorAll('.social-login').forEach(button => button.addEventListener('click', async () => {
  try { const response = await fetch('/api/auth/provider', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({provider:button.dataset.provider})}); const result = await response.json(); if (!response.ok) return showToast(result.error||'Provider not configured'); if (result.url) window.location.href = result.url; } catch(e){ console.error(e); showToast('Unable to start provider auth'); }
}));

document.getElementById('emailLoginButton').addEventListener('click', async () => {
  const email = document.getElementById('emailLogin').value.trim();
  const password = document.getElementById('passwordLogin').value || '';
  if (!email || !document.getElementById('emailLogin').checkValidity()) return showToast('Please enter a valid email address.');
  try {
    // If password provided, call login; otherwise attempt magic-email flow
    if (password) {
      const response = await fetch('/api/auth/login', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
      const result = await response.json(); if (!response.ok) return showToast(result.error || 'Login failed'); showToast('Signed in'); closeLogin();
    } else {
      const response = await fetch('/api/auth/email', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
      const result = await response.json(); if (!response.ok) return showToast(result.error || 'Email sign-in not available'); showToast('Check your email for a sign-in link');
    }
  } catch(e){ console.error(e); showToast('Sign-in failed'); }
});

