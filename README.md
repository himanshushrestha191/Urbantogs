# Urban Togs Ecommerce Website

This is a host-ready static ecommerce website for **Urban Togs**, built with **HTML, Tailwind CSS, custom CSS, and JavaScript**.

## What is included

- Premium homepage with Urban Togs branding and uploaded logo
- Shop page with search, category filter, price filter, sorting, product cards, wishlist, quick view, and add to cart
- Product detail page
- Cart page with coupon codes, free-shipping progress, recommendations, and order summary
- Checkout page with customer details, payment method selection, eSewa/Khalti/Card-style interface, and order confirmation
- Admin page to add/edit/delete products, upload product photos, set inventory, prices, badges, featured products, and store settings
- Demo order storage and CSV export
- JSON catalog import/export
- Netlify and GitHub Pages friendly files

## Admin login

Default admin code:

```txt
urban123
```

Open `admin.html` to manage the store.

## Coupon codes

```txt
URBAN10   = 10% off
FIRST15   = 15% off
FREESHIP  = free delivery
```

## How to publish

Upload the entire folder to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- cPanel public_html
- Cloudflare Pages

The main file is:

```txt
index.html
```

## Important payment note

The checkout payment interface is a professional front-end/demo interface. It does **not** charge real cards and does **not** process real payments.

Before accepting real payments, connect a secure payment gateway such as Stripe, PayPal, eSewa, Khalti, or a bank/payment-link system. Do not collect real card details directly on a static website.

## Important admin/storage note

This version is fully static and host-ready. Product changes and orders are saved in the browser using localStorage. That means:

- You can add products and photos from the admin page on your own browser.
- Those changes stay on that browser.
- For a real public store where all customers see live inventory and orders come to you automatically, connect a backend/database such as Firebase, Supabase, Shopify, WooCommerce, or a custom Node/Django backend.

The admin page includes export/import tools so you can back up the product catalog.

## Recommended next real-business upgrade

For a production Urban Togs store, connect:

1. A real database for products and inventory
2. A secure payment gateway
3. Email or WhatsApp order notifications
4. Delivery/shipping integration
5. Admin authentication with a real login system

The current website gives you the complete front-end brand, customer experience, and ecommerce interface ready to publish.

## Light / Dark Mode

This version includes a JavaScript-powered light/dark mode switch. The toggle appears beside the cart button on customer pages and inside the admin area. The selected theme is saved in `localStorage` under `urbantogs.theme`, so customers keep the same look when they move between pages or return later.

Main files involved:

- `assets/js/ui.js` — creates the toggle, switches themes, and saves the choice.
- `assets/css/styles.css` — contains the dark-mode design system and component overrides.
- Every `.html` file — includes a small early theme script in the `<head>` to prevent flashing before the page loads.
