(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const Store = window.UrbanStore;
    const UI = window.UrbanUI;
    const PASSCODE = 'urban123';
    const gate = UI.$('#admin-gate');
    const app = UI.$('#admin-app');
    const form = UI.$('#product-form');
    const tbody = UI.$('#product-rows');
    const ordersEl = UI.$('#orders-panel');
    const settingsForm = UI.$('#settings-form');
    let editingId = '';
    function authed(){ return sessionStorage.getItem('urbantogs.admin') === 'yes'; }
    function showApp(){ gate?.classList.add('hidden'); app?.classList.remove('hidden'); renderProducts(); renderDashboard(); renderOrders(); fillSettings(); }
    function showGate(){ gate?.classList.remove('hidden'); app?.classList.add('hidden'); }
    UI.$('#login-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const code = new FormData(e.currentTarget).get('code');
      if(code === PASSCODE){ sessionStorage.setItem('urbantogs.admin','yes'); UI.toast('Welcome to Urban Togs admin.'); showApp(); }
      else UI.toast('Wrong admin code.', 'error');
    });
    UI.$('#logout')?.addEventListener('click', () => { sessionStorage.removeItem('urbantogs.admin'); showGate(); });
    function renderDashboard(){
      const products = Store.products();
      const orders = Store.orders();
      const inventory = products.reduce((sum,p) => sum + Number(p.stock || 0), 0);
      const revenue = orders.reduce((sum,o) => sum + Number(o.amounts?.total || 0), 0);
      const stats = UI.$('#dashboard-stats');
      if(stats) stats.innerHTML = [
        ['Products', products.length, 'Catalog pieces'],
        ['Inventory', inventory, 'Units in stock'],
        ['Orders', orders.length, 'Saved demo orders'],
        ['Revenue', Store.formatMoney(revenue), 'Demo order value']
      ].map(card => `<div class="rounded-[2rem] border border-black/10 bg-white/65 p-5 shadow-xl shadow-black/5"><p class="text-xs font-black uppercase tracking-[.18em] text-stone-500">${card[0]}</p><h3 class="mt-3 text-3xl font-black">${card[1]}</h3><p class="mt-1 text-sm text-stone-500">${card[2]}</p></div>`).join('');
      const low = UI.$('#low-stock');
      if(low) low.innerHTML = products.filter(p => p.stock <= 5).slice(0,6).map(p => `<div class="flex items-center justify-between rounded-2xl bg-white/60 p-3"><span class="font-bold">${UI.escapeHtml(p.name)}</span><span class="badge badge-gold">${p.stock} left</span></div>`).join('') || '<p class="text-stone-500">No low-stock products.</p>';
    }
    function renderProducts(){
      if(!tbody) return;
      const rows = Store.products().map(p => `<tr><td><div class="flex items-center gap-3"><img class="h-14 w-14 rounded-2xl bg-stone-100 object-contain" src="${p.image}" alt=""><div><strong>${UI.escapeHtml(p.name)}</strong><p class="text-xs text-stone-500">${UI.escapeHtml(p.sku || '')}</p></div></div></td><td>${UI.escapeHtml(p.category)}</td><td><strong>${UI.money(p.price)}</strong><p class="text-xs text-stone-500">Compare ${p.compareAt ? UI.money(p.compareAt) : '—'}</p></td><td><span class="badge ${p.stock <= 5 ? 'badge-gold' : ''}">${p.stock}</span></td><td>${p.status === 'draft' ? '<span class="badge">Draft</span>' : '<span class="badge badge-dark">Active</span>'}</td><td><div class="flex gap-2"><button class="btn btn-light !min-h-10 !px-4" data-edit="${p.id}">Edit</button><button class="btn btn-outline !min-h-10 !px-4" data-delete-product="${p.id}">Delete</button></div></td></tr>`).join('');
      tbody.innerHTML = rows;
    }
    function fillForm(p){
      editingId = p?.id || '';
      form.id.value = p?.id || '';
      form.name.value = p?.name || '';
      form.sku.value = p?.sku || '';
      form.category.value = p?.category || '';
      form.price.value = p?.price || '';
      form.compareAt.value = p?.compareAt || '';
      form.stock.value = p?.stock ?? '';
      form.badge.value = p?.badge || '';
      form.tags.value = (p?.tags || []).join(', ');
      form.description.value = p?.description || '';
      form.status.value = p?.status || 'active';
      form.featured.checked = !!p?.featured;
      form.rating.value = p?.rating || 4.8;
      form.reviews.value = p?.reviews || 0;
      form.image.value = p?.image || '';
      UI.$('#product-preview').src = p?.image || 'assets/img/products/tote-mood-charm.svg';
      UI.$('#form-title').textContent = p ? `Editing ${p.name}` : 'Add a new product';
      UI.$('#cancel-edit')?.classList.toggle('hidden', !p);
      window.scrollTo({top:0, behavior:'smooth'});
    }
    UI.$('#product-image-file')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if(!file) return;
      if(file.size > 900000){ UI.toast('Use an image under 900 KB for fast loading.', 'error'); return; }
      const reader = new FileReader();
      reader.onload = () => { form.image.value = reader.result; UI.$('#product-preview').src = reader.result; };
      reader.readAsDataURL(file);
    });
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      Store.upsertProduct({
        id: fd.get('id') || editingId,
        name: fd.get('name'), sku: fd.get('sku'), category: fd.get('category'),
        price: fd.get('price'), compareAt: fd.get('compareAt'), stock: fd.get('stock'),
        badge: fd.get('badge'), tags: fd.get('tags'), description: fd.get('description'),
        status: fd.get('status'), featured: fd.get('featured') === 'on',
        rating: fd.get('rating'), reviews: fd.get('reviews'), image: fd.get('image')
      });
      UI.toast(editingId ? 'Product updated.' : 'Product added.');
      form.reset(); fillForm(null); renderProducts(); renderDashboard();
    });
    UI.$('#cancel-edit')?.addEventListener('click', () => { form.reset(); fillForm(null); });
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-admin-tab]');
      if(tab){
        UI.$$('[data-admin-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        UI.$$('.tab-panel').forEach(p => p.classList.remove('active'));
        UI.$(`#${tab.dataset.adminTab}`).classList.add('active');
      }
      const edit = e.target.closest('[data-edit]'); if(edit) fillForm(Store.product(edit.dataset.edit));
      const del = e.target.closest('[data-delete-product]'); if(del && confirm('Delete this product?')){ Store.deleteProduct(del.dataset.deleteProduct); renderProducts(); renderDashboard(); UI.toast('Product deleted.'); }
      if(e.target.closest('#reset-products') && confirm('Reset catalog to the launch products?')){ Store.resetProducts(); renderProducts(); renderDashboard(); UI.toast('Catalog reset.'); }
      if(e.target.closest('#export-products')) UI.download('urbantogs-products.json', JSON.stringify(Store.products(), null, 2));
      if(e.target.closest('#export-orders')) UI.download('urbantogs-orders.csv', Store.exportOrdersCsv(), 'text/csv');
      if(e.target.closest('#clear-orders') && confirm('Clear saved demo orders?')){ localStorage.setItem('urbantogs.orders.v3', '[]'); renderOrders(); renderDashboard(); UI.toast('Orders cleared.'); }
    });
    UI.$('#import-products-file')?.addEventListener('change', e => {
      const file = e.target.files?.[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = () => { try{ const count = Store.importProducts(reader.result); renderProducts(); renderDashboard(); UI.toast(`${count} products imported.`); }catch(err){ UI.toast(err.message, 'error'); } };
      reader.readAsText(file);
    });
    function renderOrders(){
      if(!ordersEl) return;
      const orders = Store.orders();
      ordersEl.innerHTML = orders.length ? `<div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Total</th><th>Items</th><th>Date</th></tr></thead><tbody>${orders.map(o => `<tr><td><strong>${o.id}</strong><p class="text-xs text-stone-500">${o.status || 'New'}</p></td><td><strong>${UI.escapeHtml(o.customer?.name || '')}</strong><p class="text-xs text-stone-500">${UI.escapeHtml(o.customer?.phone || '')}</p></td><td>${UI.escapeHtml(o.paymentMethod || '')}</td><td><strong>${UI.money(o.amounts?.total || 0)}</strong></td><td>${(o.items || []).map(i => `${UI.escapeHtml(i.name)} × ${i.qty}`).join('<br>')}</td><td>${new Date(o.createdAt).toLocaleString()}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><h3 class="serif text-3xl font-black">No orders yet.</h3><p class="mt-2 text-stone-600">Orders from checkout will appear here on this browser.</p></div>`;
    }
    function fillSettings(){
      if(!settingsForm) return;
      const s = Store.settings();
      Object.keys(s).forEach(key => { if(settingsForm[key]) settingsForm[key].value = s[key]; });
    }
    settingsForm?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(settingsForm);
      Store.saveSettings({
        storeName: fd.get('storeName'), currency: fd.get('currency'), freeShippingThreshold:Number(fd.get('freeShippingThreshold') || 0), standardShipping:Number(fd.get('standardShipping') || 0), whatsappNumber:fd.get('whatsappNumber'), esewaLink:fd.get('esewaLink'), khaltiLink:fd.get('khaltiLink'), stripeLink:fd.get('stripeLink'), announcement:fd.get('announcement'), deliveryNote:fd.get('deliveryNote')
      });
      UI.toast('Settings saved.');
    });
    if(authed()) showApp(); else showGate();
  });
})();
