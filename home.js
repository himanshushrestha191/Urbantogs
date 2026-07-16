(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const Store = window.UrbanStore;
    const UI = window.UrbanUI;
    const featured = Store.activeProducts().filter(p => p.featured).slice(0, 6);
    const newest = [...Store.activeProducts()].sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 4);
    const featuredEl = UI.$('#featured-grid');
    if(featuredEl) featuredEl.innerHTML = featured.map(p => UI.productCard(p)).join('');
    const newEl = UI.$('#new-grid');
    if(newEl) newEl.innerHTML = newest.map(p => UI.productCard(p)).join('');
    setTimeout(() => UI.$$('.reveal').forEach(el => el.classList.add('show')), 100);
  });
})();
