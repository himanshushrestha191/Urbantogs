(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const Store = window.UrbanStore;
    const UI = window.UrbanUI;
    const list = UI.$('#cart-list');
    const summary = UI.$('#cart-summary');
    const coupon = UI.$('#coupon-input');
    const recommendations = UI.$('#recommendations');
    if(coupon) coupon.value = localStorage.getItem('urbantogs.coupon') || '';
    function line(item){
      const p = item.product;
      return `<div class="grid gap-4 rounded-[2rem] border border-black/10 bg-white/55 p-4 sm:grid-cols-[140px_1fr_auto] sm:p-5">
        <img class="h-36 w-full rounded-3xl bg-stone-100 object-contain sm:h-full" src="${p.image}" alt="${UI.escapeHtml(p.name)}">
        <div><span class="badge badge-gold">${UI.escapeHtml(p.category)}</span><h3 class="serif mt-3 text-2xl font-black">${UI.escapeHtml(p.name)}</h3><p class="mt-2 max-w-xl text-sm leading-6 text-stone-600">${UI.escapeHtml(p.description)}</p><div class="mt-4 flex flex-wrap items-center gap-3"><div class="qty"><button data-cart-dec="${p.id}">−</button><span>${item.qty}</span><button data-cart-inc="${p.id}">+</button></div><button class="font-black text-red-800" data-cart-remove="${p.id}">Remove</button><span class="text-sm font-bold text-stone-500">${p.stock} in stock</span></div></div>
        <div class="text-left sm:text-right"><strong class="text-2xl">${UI.money(item.lineTotal)}</strong><p class="mt-1 text-sm text-stone-500">${UI.money(p.price)} each</p></div>
      </div>`;
    }
    function render(){
      const t = Store.totals(coupon?.value || '');
      if(list) list.innerHTML = t.items.length ? t.items.map(line).join('') : `<div class="empty-state"><h2 class="serif text-3xl font-black">Your bag is empty.</h2><p class="mt-2 text-stone-600">Start with one bold detail. The rest of the outfit follows.</p><a class="btn btn-dark mt-6" href="shop.html">Shop accessories</a></div>`;
      if(summary){
        const threshold = Store.settings().freeShippingThreshold;
        const remaining = Math.max(0, threshold - t.subtotal);
        const progress = threshold ? Math.min(100, t.subtotal / threshold * 100) : 100;
        summary.innerHTML = `<div class="rounded-[2rem] border border-black/10 bg-white/60 p-5 shadow-xl shadow-black/5"><p class="text-xs font-black uppercase tracking-[.18em] text-stone-500">Order summary</p><h2 class="serif mt-2 text-3xl font-black">Bag total</h2>
          <div class="mt-5 rounded-3xl bg-black p-4 text-[#fffaf0]"><p class="text-sm font-bold">${remaining > 0 ? `${UI.money(remaining)} away from free delivery` : 'Free delivery unlocked'}</p><div class="progress-bar mt-3 bg-white/15"><div class="progress-fill" style="width:${progress}%"></div></div></div>
          <div class="mt-5 grid gap-3 text-sm"><div class="flex justify-between"><span>Subtotal</span><strong>${UI.money(t.subtotal)}</strong></div><div class="flex justify-between"><span>Discount</span><strong>${t.discount.amount ? `− ${UI.money(t.discount.amount)}` : '—'}</strong></div><div class="flex justify-between"><span>Shipping</span><strong>${t.shipping ? UI.money(t.shipping) : 'Free'}</strong></div><div class="flex justify-between border-t border-black/10 pt-4 text-xl"><span class="font-black">Total</span><strong>${UI.money(t.total)}</strong></div>${t.savings ? `<div class="rounded-2xl bg-green-50 p-3 font-bold text-green-800">You save ${UI.money(t.savings)} today.</div>` : ''}</div>
          <a class="btn btn-dark mt-6 w-full" href="checkout.html">Continue to checkout</a><a class="btn btn-outline mt-3 w-full" href="shop.html">Keep shopping</a></div>`;
      }
      if(recommendations){
        const ids = t.items.map(i => i.id);
        recommendations.innerHTML = Store.activeProducts().filter(p => !ids.includes(p.id)).slice(0,3).map(p => UI.productCard(p)).join('');
        UI.$$('.reveal', recommendations).forEach(el => el.classList.add('show'));
      }
      UI.updateCartCount();
    }
    UI.$('#apply-coupon')?.addEventListener('click', () => { localStorage.setItem('urbantogs.coupon', coupon.value.trim().toUpperCase()); const d = Store.couponValue(coupon.value, Store.totals('').subtotal); UI.toast(d.invalid ? 'That code is not active.' : d.label || 'Coupon cleared.', d.invalid ? 'error' : 'success'); render(); });
    document.addEventListener('click', e => {
      const inc = e.target.closest('[data-cart-inc]'); if(inc){ const item = Store.cart().find(i => i.id === inc.dataset.cartInc); Store.updateQty(inc.dataset.cartInc, (item?.qty || 0) + 1); render(); }
      const dec = e.target.closest('[data-cart-dec]'); if(dec){ const item = Store.cart().find(i => i.id === dec.dataset.cartDec); Store.updateQty(dec.dataset.cartDec, (item?.qty || 0) - 1); render(); }
      const rem = e.target.closest('[data-cart-remove]'); if(rem){ Store.removeFromCart(rem.dataset.cartRemove); UI.toast('Product removed.'); render(); }
    });
    window.addEventListener('urban:cart', render);
    render();
  });
})();
