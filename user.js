// user.js — client for user.html
(async function(){
  function qs(name){
    return new URLSearchParams(window.location.search).get(name);
  }
  const code = qs('code');
  const savedList = document.getElementById('savedList');
  const userName = document.getElementById('userName');
  const userCode = document.getElementById('userCode');
  const welcomeTitle = document.getElementById('welcomeTitle');

  async function loadByCode(c){
    try{
      const res = await fetch(`/api/users/by-code?code=${encodeURIComponent(c)}`);
      if (!res.ok){ const body = await res.json(); alert(body.error || 'Failed to load user'); return; }
      const data = await res.json();
      userName.textContent = data.name || 'User';
      userCode.textContent = `Code: ${data.code || ''}`;
      welcomeTitle.textContent = `${data.name || 'User'}'s page`;
      savedList.innerHTML = '';
      (data.saved||[]).forEach(s => {
        const li = document.createElement('li'); li.textContent = `${s.title} — saved ${new Date(s.addedAt).toLocaleString()}`; savedList.appendChild(li);
      });
    } catch(e){ console.error(e); alert('Unable to load user page'); }
  }

  async function loadMe(){
    try{
      const res = await fetch('/api/me');
      if (!res.ok) return false;
      const data = await res.json();
      userName.textContent = data.name || 'You';
      userCode.textContent = `Code: ${data.code || ''}`;
      welcomeTitle.textContent = `Welcome back, ${data.name || 'You'}`;
      savedList.innerHTML = '';
      (data.saved||[]).forEach(s => {
        const li = document.createElement('li'); li.textContent = `${s.title} — saved ${new Date(s.addedAt).toLocaleString()}`; savedList.appendChild(li);
      });
      return true;
    } catch(e){ return false; }
  }

  document.getElementById('refresh').addEventListener('click', ()=>{
    if (code) loadByCode(code); else loadMe();
  });

  if (code) loadByCode(code);
  else {
    const ok = await loadMe();
    if (!ok) {
      // not logged in; show message
      userName.textContent = 'Not signed in';
      userCode.textContent = '';
      welcomeTitle.textContent = 'Sign in to manage your page';
      savedList.innerHTML = '<li>Please sign in from the main app to manage your saved products.</li>';
    }
  }
})();
