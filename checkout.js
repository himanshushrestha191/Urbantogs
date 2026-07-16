(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const Store = window.UrbanStore;
    const UI = window.UrbanUI;
    const form = UI.$('#checkout-form');
    const summary = UI.$('#checkout-summary');
    const paymentDetails = UI.$('#payment-details');
    const couponCode = localStorage.getItem('urbantogs.coupon') || '';
    function renderSummary(){
      const t = Store.totals(couponCode);
      if(!summary) return;
      if(!t.items.length){
        summary.innerHTML = `<div class="empty-state"><h2 class="serif text-2xl font-black">Your bag is empty.</h2><a class="btn btn-dark mt-4" href="shop.html">Shop first</a></div>`;
        return;
      }
      summary.innerHTML = `<div class="rounded-[2rem] border border-black/10 bg-white/65 p-5 shadow-xl shadow-black/5"><p class="text-xs font-black uppercase tracking-[.18em] text-stone-500">Secure checkout</p><h2 class="serif mt-2 text-3xl font-black">Review order</h2><div class="mt-5 grid gap-3">${t.items.map(item => `<div class="flex gap-3"><img class="h-16 w-16 rounded-2xl bg-stone-100 object-contain" src="${item.product.image}" alt="${UI.escapeHtml(item.product.name)}"><div class="min-w-0 flex-1"><p class="font-black leading-tight">${UI.escapeHtml(item.product.name)}</p><p class="text-sm text-stone-500">Qty ${item.qty} · ${UI.money(item.product.price)}</p></div><strong>${UI.money(item.lineTotal)}</strong></div>`).join('')}</div><div class="mt-5 grid gap-3 border-t border-black/10 pt-5 text-sm"><div class="flex justify-between"><span>Subtotal</span><strong>${UI.money(t.subtotal)}</strong></div><div class="flex justify-between"><span>Discount</span><strong>${t.discount.amount ? `− ${UI.money(t.discount.amount)}` : '—'}</strong></div><div class="flex justify-between"><span>Shipping</span><strong>${t.shipping ? UI.money(t.shipping) : 'Free'}</strong></div><div class="flex justify-between text-xl"><span class="font-black">Total</span><strong>${UI.money(t.total)}</strong></div></div><div class="mt-5 rounded-3xl bg-black p-4 text-[#fffaf0]"><p class="font-black">Buyer confidence</p><p class="mt-1 text-sm text-white/70">Your checkout flow is clean, fast, and designed to reduce hesitation. Real payments need a gateway connection before accepting money.</p></div></div>`;
    }
    function renderPaymentDetails(){
      const selected = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'COD';
      if(!paymentDetails) return;
      const settings = Store.settings();
      const gatewayNote = (name, link) => link ? `<p class="text-sm text-stone-600">After placing the order, customers can continue to your configured ${name} payment link.</p>` : `<p class="text-sm text-amber-800">No ${name} payment link is configured yet. Add it from Admin → Settings.</p>`;
      const map = {
        COD: `<div class="rounded-3xl bg-white/60 p-4"><h3 class="font-black">Cash on delivery</h3><p class="mt-1 text-sm text-stone-600">Customer pays when the item is delivered. Best for local trust and first-time buyers.</p></div>`,
        Bank: `<div class="rounded-3xl bg-white/60 p-4"><h3 class="font-black">Bank transfer</h3><p class="mt-1 text-sm text-stone-600">Show your bank details after the order. You can replace this text in checkout.js or add your details in README.</p></div>`,
        eSewa: `<div class="rounded-3xl bg-white/60 p-4"><h3 class="font-black">eSewa payment</h3>${gatewayNote('eSewa', settings.esewaLink)}</div>`,
        Khalti: `<div class="rounded-3xl bg-white/60 p-4"><h3 class="font-black">Khalti payment</h3>${gatewayNote('Khalti', settings.khaltiLink)}</div>`,
        Card: `<div class="rounded-3xl bg-white/60 p-4"><h3 class="font-black">Card interface demo</h3><p class="mt-1 text-sm text-stone-600">This screen is a front-end demo only and does not process or store card numbers.</p><div class="mt-4 grid gap-3"><input class="input" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242"><div class="grid grid-cols-2 gap-3"><input class="input" placeholder="MM / YY"><input class="input" placeholder="CVC"></div></div></div>`
      };
      paymentDetails.innerHTML = map[selected] || map.COD;
    }
    document.querySelectorAll('input[name="paymentMethod"]').forEach(el => el.addEventListener('change', renderPaymentDetails));
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const t = Store.totals(couponCode);
      if(!t.items.length){ UI.toast('Your bag is empty.', 'error'); return; }
      const fd = new FormData(form);
      const order = Store.createOrder({
        customer:{ name:fd.get('name'), email:fd.get('email'), phone:fd.get('phone'), address:fd.get('address'), city:fd.get('city'), note:fd.get('note') },
        paymentMethod:fd.get('paymentMethod'),
        amounts:{ subtotal:t.subtotal, discount:t.discount.amount, shipping:t.shipping, total:t.total },
        coupon:couponCode,
        items:t.items.map(item => ({id:item.id, name:item.product.name, price:item.product.price, qty:item.qty, lineTotal:item.lineTotal}))
      });
      Store.clearCart();
      localStorage.removeItem('urbantogs.coupon');
      const selected = fd.get('paymentMethod');
      const settings = Store.settings();
      const link = selected === 'eSewa' ? settings.esewaLink : selected === 'Khalti' ? settings.khaltiLink : selected === 'Card' ? settings.stripeLink : '';
      const whatsapp = settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g,'')}?text=${encodeURIComponent(`Urban Togs order ${order.id}\nName: ${order.customer.name}\nTotal: ${UI.money(order.amounts.total)}`)}` : '';
      UI.$('#checkout-content').innerHTML = `<div class="ut-container py-20"><div class="mx-auto max-w-3xl rounded-[2.5rem] border border-black/10 bg-white/70 p-8 text-center shadow-2xl shadow-black/10"><span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-black text-2xl text-[#fffaf0]">✓</span><h1 class="serif mt-6 text-5xl font-black tracking-tight">Order received.</h1><p class="mx-auto mt-4 max-w-xl text-stone-600">Order <strong>${order.id}</strong> has been saved on this website demo. For a real online store, connect a payment gateway and backend so orders reach you automatically.</p><div class="mt-7 grid gap-3 sm:grid-cols-2"><a class="btn btn-dark" href="shop.html">Continue shopping</a><a class="btn btn-outline" href="admin.html">View admin orders</a>${link ? `<a class="btn btn-gold sm:col-span-2" target="_blank" rel="noopener" href="${link}">Continue to payment</a>` : ''}${whatsapp ? `<a class="btn btn-light sm:col-span-2" target="_blank" rel="noopener" href="${whatsapp}">Send order on WhatsApp</a>` : ''}</div></div></div>`;
      UI.updateCartCount();
    });
    renderSummary(); renderPaymentDetails();
  });
})();
