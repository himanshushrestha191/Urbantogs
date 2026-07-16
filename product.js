(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const Store = window.UrbanStore;
    const UI = window.UrbanUI;
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || Store.activeProducts()[0]?.id;
    const p = Store.product(id);
    const wrap = UI.$('#product-page');
    if(!wrap) return;
    if(!p){ wrap.innerHTML = `<div class="empty-state"><h1 class="serif text-4xl font-black">Product not found.</h1><a class="btn btn-dark mt-5" href="shop.html">Back to shop</a></div>`; return; }
    const low = Number(p.stock || 0) <= 5;
    const savings = Math.max(0, Number(p.compareAt || 0) - Number(p.price || 0));
    wrap.innerHTML = `<div class="grid gap-10 lg:grid-cols-[1.02fr_.98fr]">
      <div class="reveal rounded-[2.5rem] border border-black/10 bg-gradient-to-br from-[#fffaf0] to-[#d9c592] p-8 shadow-2xl shadow-black/10"><img class="mx-auto max-h-[620px] object-contain drop-shadow-2xl" src="${p.image}" alt="${UI.escapeHtml(p.name)}"></div>
      <div class="reveal py-3"><a class="badge" href="shop.html">← Back to shop</a><div class="mt-5 flex flex-wrap gap-2"><span class="badge badge-dark">${UI.escapeHtml(p.badge || 'Urban pick')}</span><span class="badge badge-gold">${UI.escapeHtml(p.category)}</span></div><h1 class="serif mt-5 text-5xl font-black tracking-tight md:text-7xl">${UI.escapeHtml(p.name)}</h1><p class="mt-5 text-lg leading-8 text-stone-600">${UI.escapeHtml(p.description)}</p><div class="mt-5 flex items-center gap-3"><span class="rating text-lg">★ ${Number(p.rating || 4.8).toFixed(1)}</span><span class="text-sm font-bold text-stone-500">${p.reviews || 0} customer reactions</span></div><div class="mt-7 flex flex-wrap items-end gap-3"><span class="price text-4xl">${UI.money(p.price)}</span>${p.compareAt ? `<span class="compare text-xl">${UI.money(p.compareAt)}</span>` : ''}${savings ? `<span class="badge badge-gold">Save ${UI.money(savings)}</span>` : ''}</div><div class="mt-7 rounded-[2rem] border border-black/10 bg-white/60 p-5"><div class="flex justify-between gap-4"><strong>${low ? 'Limited quantity' : 'Ready to ship'}</strong><span class="font-black">${p.stock} in stock</span></div><div class="progress-bar mt-3"><div class="progress-fill" style="width:${Math.min(100, Math.max(8, Number(p.stock || 0) * 8))}%"></div></div><p class="mt-3 text-sm text-stone-600">Small details create the strongest memory. This product is styled to feel premium, giftable, and easy to say yes to.</p></div><div class="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]"><button class="btn btn-dark" data-add="${p.id}">Add to bag</button><button class="btn btn-outline" data-wishlist="${p.id}">Save for later</button></div><div class="mt-7 grid gap-3 sm:grid-cols-3"><div class="rounded-3xl bg-white/55 p-4"><strong>Gift-ready</strong><p class="mt-1 text-sm text-stone-600">Clean packaging note included.</p></div><div class="rounded-3xl bg-white/55 p-4"><strong>Easy returns</strong><p class="mt-1 text-sm text-stone-600">Simple exchange policy copy.</p></div><div class="rounded-3xl bg-white/55 p-4"><strong>Fast styling</strong><p class="mt-1 text-sm text-stone-600">Designed to upgrade basics.</p></div></div></div>
    </div>`;
    const related = UI.$('#related-grid');
    if(related){ related.innerHTML = Store.activeProducts().filter(x => x.category === p.category && x.id !== p.id).concat(Store.activeProducts().filter(x => x.id !== p.id)).slice(0,4).map(x => UI.productCard(x)).join(''); }
    setTimeout(() => UI.$$('.reveal').forEach(el => el.classList.add('show')), 80);
  });
})();
