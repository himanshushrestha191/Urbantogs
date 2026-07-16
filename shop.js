(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const Store = window.UrbanStore;
    const UI = window.UrbanUI;
    const grid = UI.$('#shop-grid');
    const count = UI.$('#product-count');
    const empty = UI.$('#empty-products');
    const search = UI.$('#search-products');
    const category = UI.$('#category-filter');
    const sort = UI.$('#sort-filter');
    const maxPrice = UI.$('#price-filter');
    const maxPriceLabel = UI.$('#price-value');
    const categoryChips = UI.$('#category-chips');

    function setup(){
      const cats = Store.categories();
      if(category) category.innerHTML = `<option value="all">All categories</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');
      if(categoryChips) categoryChips.innerHTML = `<button class="badge badge-dark" data-cat-chip="all">All</button>` + cats.map(c => `<button class="badge" data-cat-chip="${c}">${c}</button>`).join('');
      render();
    }
    function filtered(){
      let items = Store.activeProducts();
      const q = search?.value.trim().toLowerCase() || '';
      const c = category?.value || 'all';
      const max = Number(maxPrice?.value || 5000);
      if(q) items = items.filter(p => [p.name,p.category,p.description,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q));
      if(c !== 'all') items = items.filter(p => p.category === c);
      items = items.filter(p => Number(p.price || 0) <= max);
      const s = sort?.value || 'featured';
      if(s === 'low') items.sort((a,b) => a.price - b.price);
      if(s === 'high') items.sort((a,b) => b.price - a.price);
      if(s === 'new') items.sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      if(s === 'stock') items.sort((a,b) => a.stock - b.stock);
      if(s === 'featured') items.sort((a,b) => Number(b.featured) - Number(a.featured));
      return items;
    }
    function render(){
      const items = filtered();
      if(grid) grid.innerHTML = items.map(p => UI.productCard(p)).join('');
      if(count) count.textContent = `${items.length} product${items.length === 1 ? '' : 's'}`;
      if(empty) empty.classList.toggle('hidden', items.length !== 0);
      if(maxPriceLabel) maxPriceLabel.textContent = UI.money(maxPrice?.value || 5000);
      UI.$$('.reveal', grid || document).forEach(el => setTimeout(() => el.classList.add('show'), 60));
    }
    [search, category, sort, maxPrice].forEach(el => el?.addEventListener('input', render));
    categoryChips?.addEventListener('click', e => {
      const chip = e.target.closest('[data-cat-chip]');
      if(!chip) return;
      category.value = chip.dataset.catChip;
      UI.$$('[data-cat-chip]', categoryChips).forEach(c => c.className = 'badge');
      chip.className = 'badge badge-dark';
      render();
    });
    UI.$('#clear-filters')?.addEventListener('click', () => { search.value=''; category.value='all'; sort.value='featured'; maxPrice.value=5000; setup(); });
    setup();
  });
})();
