(function(){
  const PRODUCT_KEY = 'urbantogs.products.v3';
  const CART_KEY = 'urbantogs.cart.v3';
  const ORDER_KEY = 'urbantogs.orders.v3';
  const SETTINGS_KEY = 'urbantogs.settings.v3';
  const WISHLIST_KEY = 'urbantogs.wishlist.v3';

  const DEFAULT_SETTINGS = {
    storeName: 'Urban Togs',
    currency: 'Rs.',
    freeShippingThreshold: 5000,
    standardShipping: 250,
    whatsappNumber: '',
    esewaLink: '',
    khaltiLink: '',
    stripeLink: '',
    announcement: 'Launch offer: 10% off with URBAN10 · Free delivery above Rs. 5,000',
    deliveryNote: 'Inside valley: 1–3 days · Outside valley: 3–6 days'
  };

  const DEFAULT_PRODUCTS = [
    {id:'p-001', sku:'UT-EAR-001', name:'Noir Pearl Drops', category:'Earrings', price:1450, compareAt:1900, stock:8, badge:'Bestseller', featured:true, status:'active', rating:4.9, reviews:42, image:'assets/img/products/noir-pearl-drops.svg', description:'Soft pearl shine with a dark city finish. Easy to wear, impossible to ignore.', tags:['Pearl','Minimal','Gift'], createdAt:'2026-07-01'},
    {id:'p-002', sku:'UT-RNG-002', name:'Stacked Street Rings', category:'Rings', price:1250, compareAt:1600, stock:5, badge:'Low stock', featured:true, status:'active', rating:4.8, reviews:31, image:'assets/img/products/stacked-street-rings.svg', description:'A layered ring set that makes simple outfits feel styled in seconds.', tags:['Stack','Silver','Street'], createdAt:'2026-07-02'},
    {id:'p-003', sku:'UT-BRC-003', name:'Chain Code Bracelet', category:'Bracelets', price:1750, compareAt:2200, stock:12, badge:'New drop', featured:true, status:'active', rating:4.9, reviews:27, image:'assets/img/products/chain-code-bracelet.svg', description:'A polished chain bracelet with enough weight to feel premium but still everyday.', tags:['Chain','Premium'], createdAt:'2026-07-03'},
    {id:'p-004', sku:'UT-HCL-004', name:'Crystal Claw Clip', category:'Hair', price:980, compareAt:1250, stock:4, badge:'Only 4 left', featured:true, status:'active', rating:4.7, reviews:56, image:'assets/img/products/crystal-claw-clip.svg', description:'A strong hold claw clip with crystal energy for clean buns and quick styling.', tags:['Hair','Crystal'], createdAt:'2026-07-04'},
    {id:'p-005', sku:'UT-HSC-005', name:'Satin Shadow Scrunchie', category:'Hair', price:650, compareAt:850, stock:18, badge:'Easy gift', featured:false, status:'active', rating:4.8, reviews:22, image:'assets/img/products/satin-shadow-scrunchie.svg', description:'Soft satin texture that looks clean on the wrist and gentle in the hair.', tags:['Satin','Everyday'], createdAt:'2026-07-05'},
    {id:'p-006', sku:'UT-CHA-006', name:'Tote Mood Charm', category:'Charms', price:890, compareAt:1200, stock:10, badge:'Viral pick', featured:true, status:'active', rating:4.9, reviews:64, image:'assets/img/products/tote-mood-charm.svg', description:'A small charm that gives your bag a personal signature without overdoing it.', tags:['Bag','Charm'], createdAt:'2026-07-06'},
    {id:'p-007', sku:'UT-SUN-007', name:'City Mini Shades', category:'Sunglasses', price:1850, compareAt:2400, stock:7, badge:'Trending', featured:true, status:'active', rating:4.6, reviews:19, image:'assets/img/products/city-mini-shades.svg', description:'Compact sunglasses with a bold line. Built for photos, errands, and attitude.', tags:['Street','Photo'], createdAt:'2026-07-07'},
    {id:'p-008', sku:'UT-ANK-008', name:'Beaded Anklet', category:'Anklets', price:740, compareAt:950, stock:16, badge:'Summer edit', featured:false, status:'active', rating:4.7, reviews:16, image:'assets/img/products/beaded-anklet.svg', description:'Lightweight beaded anklet for sandals, sneakers, and everyday summer fits.', tags:['Beads','Summer'], createdAt:'2026-07-08'},
    {id:'p-009', sku:'UT-NEC-009', name:'Moonlit Necklace', category:'Necklaces', price:2100, compareAt:2700, stock:6, badge:'Gift ready', featured:true, status:'active', rating:4.9, reviews:38, image:'assets/img/products/moonlit-necklace.svg', description:'A clean pendant necklace that layers well and makes basics feel elevated.', tags:['Pendant','Layering'], createdAt:'2026-07-09'},
    {id:'p-010', sku:'UT-HPN-010', name:'Baroque Hair Pins', category:'Hair', price:1100, compareAt:1450, stock:9, badge:'Set of 3', featured:false, status:'active', rating:4.8, reviews:24, image:'assets/img/products/baroque-hair-pins.svg', description:'Three polished pins for half-up looks, loose buns, and small detail styling.', tags:['Pins','Set'], createdAt:'2026-07-10'},
    {id:'p-011', sku:'UT-HOP-011', name:'Chrome Hoops', category:'Earrings', price:1320, compareAt:1700, stock:11, badge:'Daily icon', featured:false, status:'active', rating:4.7, reviews:33, image:'assets/img/products/chrome-hoops.svg', description:'Clean hoops with a chrome finish. The reliable pair you reach for every week.', tags:['Hoops','Chrome'], createdAt:'2026-07-11'},
    {id:'p-012', sku:'UT-WTC-012', name:'Urban Watch Strap', category:'Watches', price:2450, compareAt:3100, stock:3, badge:'Only 3 left', featured:false, status:'active', rating:4.8, reviews:14, image:'assets/img/products/urban-watch-strap.svg', description:'A refined watch strap with a dark finish for sharp daily styling.', tags:['Watch','Premium'], createdAt:'2026-07-12'}
  ];

  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  function read(key, fallback){
    try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : clone(fallback); }
    catch(err){ console.warn('UrbanTogs storage read failed', err); return clone(fallback); }
  }
  function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); return value; }
  function settings(){ return {...clone(DEFAULT_SETTINGS), ...read(SETTINGS_KEY, {})}; }
  function saveSettings(value){ return write(SETTINGS_KEY, {...settings(), ...value}); }
  function products(){
    const saved = read(PRODUCT_KEY, null);
    if(!saved || !Array.isArray(saved) || saved.length === 0){ write(PRODUCT_KEY, DEFAULT_PRODUCTS); return clone(DEFAULT_PRODUCTS); }
    return saved;
  }
  function activeProducts(){ return products().filter(p => p.status !== 'draft'); }
  function saveProducts(list){ return write(PRODUCT_KEY, list); }
  function product(id){ return products().find(p => p.id === id); }
  function cart(){ return read(CART_KEY, []); }
  function saveCart(items){ write(CART_KEY, items); window.dispatchEvent(new CustomEvent('urban:cart')); return items; }
  function wishlist(){ return read(WISHLIST_KEY, []); }
  function saveWishlist(list){ write(WISHLIST_KEY, list); window.dispatchEvent(new CustomEvent('urban:wishlist')); return list; }
  function toggleWishlist(id){
    const list = wishlist();
    const index = list.indexOf(id);
    if(index > -1) list.splice(index,1); else list.push(id);
    return saveWishlist(list);
  }
  function addToCart(id, qty=1){
    const p = product(id);
    if(!p) return {ok:false, message:'Product was not found.'};
    if(p.status === 'draft') return {ok:false, message:'This product is not available yet.'};
    const items = cart();
    const found = items.find(item => item.id === id);
    const currentQty = found ? found.qty : 0;
    const nextQty = Math.min(Number(p.stock || 0), currentQty + Number(qty || 1));
    if(Number(p.stock || 0) <= 0) return {ok:false, message:`${p.name} is sold out.`};
    if(found) found.qty = nextQty; else items.push({id, qty:nextQty});
    saveCart(items.filter(item => item.qty > 0));
    if(nextQty === currentQty) return {ok:false, message:`Only ${p.stock} available in stock.`};
    return {ok:true, message:`${p.name} added to bag.`};
  }
  function updateQty(id, qty){
    const p = product(id);
    const items = cart();
    const found = items.find(item => item.id === id);
    if(!found) return saveCart(items);
    found.qty = Math.max(0, Math.min(Number(qty || 0), Number(p?.stock || 0)));
    return saveCart(items.filter(item => item.qty > 0));
  }
  function removeFromCart(id){ return saveCart(cart().filter(item => item.id !== id)); }
  function clearCart(){ return saveCart([]); }
  function cartDetailed(){
    return cart().map(item => {
      const p = product(item.id);
      return p ? {...item, product:p, lineTotal:item.qty * Number(p.price || 0)} : null;
    }).filter(Boolean);
  }
  function couponValue(code, subtotal){
    const clean = String(code || '').trim().toUpperCase();
    if(clean === 'URBAN10') return {code:clean, label:'10% launch discount', amount:Math.round(subtotal * .10), freeShip:false};
    if(clean === 'FIRST15') return {code:clean, label:'15% first order discount', amount:Math.round(subtotal * .15), freeShip:false};
    if(clean === 'FREESHIP') return {code:clean, label:'Free shipping', amount:0, freeShip:true};
    if(!clean) return {code:'', label:'', amount:0, freeShip:false};
    return {code:clean, label:'Invalid code', amount:0, freeShip:false, invalid:true};
  }
  function totals(couponCode=''){
    const set = settings();
    const items = cartDetailed();
    const subtotal = items.reduce((sum,item) => sum + item.lineTotal, 0);
    const discount = couponValue(couponCode, subtotal);
    const shipping = subtotal <= 0 || subtotal >= Number(set.freeShippingThreshold) || discount.freeShip ? 0 : Number(set.standardShipping);
    const total = Math.max(0, subtotal - discount.amount + shipping);
    const savings = items.reduce((sum,item) => sum + Math.max(0, Number(item.product.compareAt || 0) - Number(item.product.price || 0)) * item.qty, 0) + discount.amount;
    return {items, subtotal, discount, shipping, total, savings};
  }
  function orders(){ return read(ORDER_KEY, []); }
  function saveOrder(order){ const list = orders(); list.unshift(order); write(ORDER_KEY, list); return order; }
  function createOrder(payload){
    const order = {
      id: `UT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status:'New',
      ...payload
    };
    saveOrder(order);
    return order;
  }
  function formatMoney(value){
    const set = settings();
    const number = Number(value || 0).toLocaleString('en-NP', {maximumFractionDigits:0});
    return `${set.currency} ${number}`;
  }
  function categories(){ return [...new Set(activeProducts().map(p => p.category).filter(Boolean))].sort(); }
  function upsertProduct(data){
    const list = products();
    const normalized = {
      id: data.id || uid('p'),
      sku: data.sku || `UT-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
      name: data.name || 'Untitled Product',
      category: data.category || 'Accessories',
      price: Number(data.price || 0),
      compareAt: Number(data.compareAt || 0),
      stock: Number(data.stock || 0),
      badge: data.badge || '',
      featured: !!data.featured,
      status: data.status || 'active',
      rating: Number(data.rating || 4.8),
      reviews: Number(data.reviews || 0),
      image: data.image || 'assets/img/products/tote-mood-charm.svg',
      description: data.description || '',
      tags: Array.isArray(data.tags) ? data.tags : String(data.tags || '').split(',').map(x => x.trim()).filter(Boolean),
      createdAt: data.createdAt || new Date().toISOString().slice(0,10)
    };
    const index = list.findIndex(p => p.id === normalized.id);
    if(index > -1) list[index] = normalized; else list.unshift(normalized);
    saveProducts(list);
    window.dispatchEvent(new CustomEvent('urban:products'));
    return normalized;
  }
  function deleteProduct(id){
    saveProducts(products().filter(p => p.id !== id));
    saveCart(cart().filter(item => item.id !== id));
    window.dispatchEvent(new CustomEvent('urban:products'));
  }
  function resetProducts(){ saveProducts(DEFAULT_PRODUCTS); clearCart(); window.dispatchEvent(new CustomEvent('urban:products')); return products(); }
  function importProducts(raw){
    let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if(!Array.isArray(parsed)) throw new Error('Catalog must be an array of products.');
    saveProducts(parsed);
    window.dispatchEvent(new CustomEvent('urban:products'));
    return parsed.length;
  }
  function exportOrdersCsv(){
    const rows = [['Order ID','Date','Customer','Phone','Email','Payment','Total','Status','Items']];
    orders().forEach(o => rows.push([o.id, o.createdAt, o.customer?.name || '', o.customer?.phone || '', o.customer?.email || '', o.paymentMethod || '', o.amounts?.total || 0, o.status || '', (o.items || []).map(i => `${i.name} x ${i.qty}`).join('; ')]));
    return rows.map(row => row.map(cell => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
  }
  window.UrbanStore = {DEFAULT_PRODUCTS, DEFAULT_SETTINGS, products, activeProducts, saveProducts, product, categories, cart, saveCart, addToCart, updateQty, removeFromCart, clearCart, cartDetailed, totals, couponValue, settings, saveSettings, orders, createOrder, formatMoney, upsertProduct, deleteProduct, resetProducts, importProducts, wishlist, toggleWishlist, exportOrdersCsv};
})();
