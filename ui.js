(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const Store = window.UrbanStore;

  function money(v){ return Store.formatMoney(v); }
  function toast(message, type='success'){
    let wrap = $('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = 'toast';
    const icon = type === 'error' ? '!' : type === 'info' ? 'i' : '✓';
    el.innerHTML = `<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full ${type === 'error' ? 'bg-red-900' : 'bg-[var(--gold)] text-black'} font-black">${icon}</span><div class="text-sm font-semibold leading-snug">${message}</div>`;
    wrap.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(10px)'; setTimeout(() => el.remove(), 220); }, 3200);
  }
  function updateCartCount(){
    const count = Store.cart().reduce((sum,item) => sum + Number(item.qty || 0), 0);
    $$('[data-cart-count]').forEach(el => el.textContent = count);
  }
  function productCard(product, options={}){
    const wish = Store.wishlist().includes(product.id);
    const lowStock = Number(product.stock) <= 5;
    const unavailable = Number(product.stock) <= 0;
    const savings = Math.max(0, Number(product.compareAt || 0) - Number(product.price || 0));
    return `
      <article class="product-card reveal" data-product-id="${product.id}" data-category="${product.category}">
        <div class="product-media">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">
          <span class="stock-pill">${unavailable ? 'Sold out' : lowStock ? `Only ${product.stock} left` : product.badge || 'In stock'}</span>
          <button class="heart ${wish ? 'active' : ''}" type="button" data-wishlist="${product.id}" aria-label="Save ${escapeHtml(product.name)}">♡</button>
          <div class="product-actions">
            <button class="btn btn-dark !min-h-11" type="button" data-add="${product.id}" ${unavailable ? 'disabled' : ''}>${unavailable ? 'Sold Out' : 'Add to Bag'}</button>
            <button class="icon-btn bg-white/90" type="button" data-quick="${product.id}" aria-label="Quick view">↗</button>
          </div>
        </div>
        <div class="p-5 sm:p-6">
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="badge badge-gold">${escapeHtml(product.category)}</span>
            <span class="rating text-sm">★ ${Number(product.rating || 4.8).toFixed(1)}</span>
          </div>
          <h3 class="serif text-2xl font-bold tracking-tight"><a href="product.html?id=${product.id}">${escapeHtml(product.name)}</a></h3>
          <p class="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">${escapeHtml(product.description || '')}</p>
          <div class="mt-4 flex items-end justify-between gap-3">
            <div>
              <div class="flex items-center gap-2"><span class="price text-xl">${money(product.price)}</span>${product.compareAt ? `<span class="compare">${money(product.compareAt)}</span>` : ''}</div>
              ${savings ? `<p class="mt-1 text-xs font-bold uppercase tracking-wide text-green-700">Save ${money(savings)}</p>` : ''}
            </div>
            <button class="icon-btn" data-add="${product.id}" title="Quick add" ${unavailable ? 'disabled' : ''}>＋</button>
          </div>
        </div>
      </article>`;
  }
  function quickView(id){
    const p = Store.product(id);
    if(!p) return;
    const modal = $('#quick-modal') || buildModal();
    modal.innerHTML = `
      <div class="modal-backdrop open" data-close-modal></div>
      <section class="fixed inset-x-3 top-1/2 z-[100] mx-auto max-h-[90vh] max-w-4xl -translate-y-1/2 overflow-auto rounded-[2rem] bg-[#fffaf0] p-4 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-label="Product quick view">
        <button class="icon-btn absolute right-4 top-4 z-10 bg-white" data-close-modal aria-label="Close">×</button>
        <div class="grid gap-6 md:grid-cols-[.95fr_1.05fr]">
          <div class="rounded-[1.6rem] bg-gradient-to-br from-[#fffaf0] to-[#dcc998] p-6"><img class="mx-auto max-h-[390px] object-contain drop-shadow-2xl" src="${p.image}" alt="${escapeHtml(p.name)}"></div>
          <div class="py-2 pr-1">
            <span class="badge badge-dark">${escapeHtml(p.badge || p.category)}</span>
            <h2 class="serif mt-4 text-4xl font-black tracking-tight">${escapeHtml(p.name)}</h2>
            <p class="mt-3 text-stone-600 leading-7">${escapeHtml(p.description || '')}</p>
            <div class="mt-4 flex items-center gap-3"><span class="rating">★ ${Number(p.rating || 4.8).toFixed(1)} / 5</span><span class="text-sm text-stone-500">${p.reviews || 0} customer reactions</span></div>
            <div class="mt-6 flex items-center gap-3"><span class="price text-3xl">${money(p.price)}</span>${p.compareAt ? `<span class="compare text-lg">${money(p.compareAt)}</span>` : ''}</div>
            <div class="mt-6 rounded-3xl border border-black/10 bg-white/50 p-4">
              <div class="flex items-center justify-between text-sm font-bold"><span>Stock confidence</span><span>${Number(p.stock || 0) > 0 ? `${p.stock} available` : 'Sold out'}</span></div>
              <div class="progress-bar mt-3"><div class="progress-fill" style="width:${Math.min(100, Math.max(8, Number(p.stock || 0) * 8))}%"></div></div>
              <p class="mt-3 text-sm text-stone-600">Limited accessories feel more personal. Add it now and decide at checkout.</p>
            </div>
            <div class="mt-6 grid gap-3 sm:grid-cols-2"><button class="btn btn-dark" data-add="${p.id}">Add to Bag</button><a class="btn btn-outline" href="product.html?id=${p.id}">Full Details</a></div>
          </div>
        </div>
      </section>`;
    modal.classList.remove('hidden');
    document.body.classList.add('nav-open');
  }
  function buildModal(){ const div = document.createElement('div'); div.id = 'quick-modal'; document.body.appendChild(div); return div; }
  function closeModal(){ const modal = $('#quick-modal'); if(modal){ modal.classList.add('hidden'); modal.innerHTML = ''; } document.body.classList.remove('nav-open'); }
  function miniCartItem(item){
    const p = item.product;
    return `<div class="flex gap-3 rounded-3xl border border-black/10 bg-white/50 p-3">
      <img class="h-20 w-20 rounded-2xl bg-stone-100 object-contain" src="${p.image}" alt="${escapeHtml(p.name)}">
      <div class="min-w-0 flex-1"><div class="flex justify-between gap-2"><h4 class="font-black leading-tight">${escapeHtml(p.name)}</h4><button data-remove="${p.id}" class="text-xl leading-none">×</button></div><p class="mt-1 text-sm text-stone-500">${money(p.price)}</p><div class="mt-3 flex items-center justify-between"><div class="qty"><button data-dec="${p.id}">−</button><span>${item.qty}</span><button data-inc="${p.id}">+</button></div><strong>${money(item.lineTotal)}</strong></div></div>
    </div>`;
  }
  function renderDrawer(){
    const drawer = $('#cart-drawer'); if(!drawer) return;
    const totals = Store.totals(localStorage.getItem('urbantogs.coupon') || '');
    const threshold = Store.settings().freeShippingThreshold;
    const remaining = Math.max(0, threshold - totals.subtotal);
    const progress = threshold ? Math.min(100, totals.subtotal / threshold * 100) : 100;
    drawer.innerHTML = `
      <div class="flex items-center justify-between border-b border-black/10 p-5"><div><p class="text-xs font-black uppercase tracking-[.2em] text-stone-500">Your bag</p><h3 class="serif text-3xl font-black">Urban picks</h3></div><button class="icon-btn" data-close-drawer>×</button></div>
      <div class="flex-1 overflow-auto p-5">
        ${totals.items.length ? `<p class="text-sm font-bold text-stone-600">${remaining > 0 ? `${money(remaining)} away from free delivery.` : 'You unlocked free delivery.'}</p><div class="progress-bar mt-3"><div class="progress-fill" style="width:${progress}%"></div></div><div class="mt-5 grid gap-3">${totals.items.map(miniCartItem).join('')}</div>` : `<div class="empty-state"><h4 class="serif text-2xl font-black">Your bag is waiting.</h4><p class="mt-2 text-stone-600">Add one standout accessory and the whole fit changes.</p><a class="btn btn-dark mt-5" href="shop.html">Start shopping</a></div>`}
      </div>
      <div class="border-t border-black/10 p-5">
        <div class="mb-4 grid gap-2 text-sm"><div class="flex justify-between"><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div><div class="flex justify-between"><span>Shipping</span><strong>${totals.shipping ? money(totals.shipping) : 'Free'}</strong></div><div class="flex justify-between text-lg"><span class="font-black">Total</span><strong>${money(totals.total)}</strong></div></div>
        <a class="btn btn-dark w-full" href="checkout.html">Checkout now</a><a class="btn btn-outline mt-3 w-full" href="cart.html">View full cart</a>
      </div>`;
  }
  function openDrawer(){ $('#drawer-backdrop')?.classList.add('open'); $('#cart-drawer')?.classList.add('open'); document.body.classList.add('nav-open'); renderDrawer(); }
  function closeDrawer(){ $('#drawer-backdrop')?.classList.remove('open'); $('#cart-drawer')?.classList.remove('open'); document.body.classList.remove('nav-open'); }
  function escapeHtml(str){ return String(str || '').replace(/[&<>'"]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag])); }
  function download(filename, text, type='application/json'){
    const blob = new Blob([text], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  const THEME_KEY = 'urbantogs.theme';
  function safeStorageGet(key){ try { return localStorage.getItem(key); } catch(e) { return null; } }
  function safeStorageSet(key, value){ try { localStorage.setItem(key, value); } catch(e) {} }
  function systemTheme(){ return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function currentTheme(){ return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
  function applyTheme(theme, persist=false){
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.style.colorScheme = next;
    if(persist) safeStorageSet(THEME_KEY, next);
    $$('[data-theme-toggle]').forEach(btn => {
      const dark = next === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.innerHTML = `<span class="theme-toggle-icon" aria-hidden="true">${dark ? '☀️' : '🌙'}</span><span class="theme-toggle-text">${dark ? 'Light' : 'Dark'}</span>`;
    });
  }
  function buildThemeButton(extraClass=''){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `theme-toggle ${extraClass}`.trim();
    btn.dataset.themeToggle = 'true';
    return btn;
  }
  function initTheme(){
    applyTheme(safeStorageGet(THEME_KEY) || currentTheme() || systemTheme(), false);
    const cartButton = $('[data-open-cart]');
    if(cartButton && !$('[data-theme-toggle]', cartButton.parentElement || document)){
      cartButton.insertAdjacentElement('beforebegin', buildThemeButton());
    }
    const adminSide = $('.admin-side');
    if(adminSide && !$('[data-theme-toggle]', adminSide)){
      const sideBtn = buildThemeButton('theme-toggle-admin mt-5 w-full');
      const logoRow = adminSide.firstElementChild;
      if(logoRow) logoRow.insertAdjacentElement('afterend', sideBtn); else adminSide.prepend(sideBtn);
    }
    const adminGateCard = $('#admin-gate .glass');
    if(adminGateCard && !$('[data-theme-toggle]', adminGateCard)){
      const gateBtn = buildThemeButton('mx-auto mt-5');
      const textBlock = adminGateCard.querySelector('p');
      if(textBlock) textBlock.insertAdjacentElement('afterend', gateBtn); else adminGateCard.prepend(gateBtn);
    }
    const floatingNeeded = !cartButton && !adminSide && !$('[data-theme-toggle]');
    if(floatingNeeded){
      const floating = buildThemeButton('theme-toggle-floating');
      document.body.appendChild(floating);
    }
    applyTheme(safeStorageGet(THEME_KEY) || currentTheme() || systemTheme(), false);
    document.addEventListener('click', e => {
      const toggle = e.target.closest('[data-theme-toggle]');
      if(!toggle) return;
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      toast(next === 'dark' ? 'Dark mode on — softer for late-night shopping.' : 'Light mode on — clean and bright for browsing.', 'info');
    });
    try{
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener?.('change', () => { if(!safeStorageGet(THEME_KEY)) applyTheme(systemTheme(), false); });
    }catch(e){}
  }
  function initGlobal(){
    initTheme();
    updateCartCount(); renderDrawer();
    $$('[data-announcement]').forEach(el => el.textContent = Store.settings().announcement);
    window.addEventListener('urban:cart', () => { updateCartCount(); renderDrawer(); });
    window.addEventListener('urban:products', () => { updateCartCount(); renderDrawer(); });
    window.addEventListener('scroll', () => $('.nav-shell')?.classList.toggle('is-scrolled', window.scrollY > 12), {passive:true});
    $('#mobile-menu-button')?.addEventListener('click', () => { $('#mobile-panel')?.classList.toggle('open'); document.body.classList.toggle('nav-open'); });
    document.addEventListener('click', e => {
      const add = e.target.closest('[data-add]');
      if(add){ const res = Store.addToCart(add.dataset.add, 1); toast(res.message, res.ok ? 'success' : 'error'); if(res.ok) openDrawer(); }
      const quick = e.target.closest('[data-quick]'); if(quick) quickView(quick.dataset.quick);
      const wish = e.target.closest('[data-wishlist]'); if(wish){ Store.toggleWishlist(wish.dataset.wishlist); wish.classList.toggle('active'); toast(wish.classList.contains('active') ? 'Saved to wishlist.' : 'Removed from wishlist.', 'info'); }
      if(e.target.closest('[data-open-cart]')){ e.preventDefault(); openDrawer(); }
      if(e.target.closest('[data-close-drawer]') || e.target.id === 'drawer-backdrop') closeDrawer();
      if(e.target.closest('[data-close-modal]')) closeModal();
      const inc = e.target.closest('[data-inc]'); if(inc){ const current = Store.cart().find(x => x.id === inc.dataset.inc); Store.updateQty(inc.dataset.inc, (current?.qty || 0) + 1); }
      const dec = e.target.closest('[data-dec]'); if(dec){ const current = Store.cart().find(x => x.id === dec.dataset.dec); Store.updateQty(dec.dataset.dec, (current?.qty || 0) - 1); }
      const remove = e.target.closest('[data-remove]'); if(remove){ Store.removeFromCart(remove.dataset.remove); toast('Removed from bag.', 'info'); }
    });
    document.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeDrawer(); closeModal(); } });
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('show'); observer.unobserve(entry.target); } }), {threshold:.12});
    $$('.reveal').forEach(el => observer.observe(el));
    const newsletter = $('#newsletter-form');
    newsletter?.addEventListener('submit', e => { e.preventDefault(); toast('You are on the Urban Togs early-access list.'); newsletter.reset(); });
  }
  window.UrbanUI = { $, $$, money, toast, updateCartCount, productCard, quickView, renderDrawer, openDrawer, closeDrawer, escapeHtml, download, applyTheme, currentTheme, initTheme, initGlobal };
  document.addEventListener('DOMContentLoaded', initGlobal);
})();
