const CACHE_NAME = 'kk-v2';
const OFFLINE_URL = '/offline.html';

const PRECACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',

  '/css/tokens.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/modals.css',
  '/css/forms.css',
  '/css/toast.css',
  '/css/animations.css',
  '/css/print.css',
  '/css/pages/home.css',
  '/css/pages/menu.css',
  '/css/pages/about.css',
  '/css/pages/gallery.css',
  '/css/pages/reservations.css',
  '/css/pages/reviews.css',
  '/css/pages/contact.css',
  '/css/pages/faq.css',
  '/css/pages/account.css',
  '/css/pages/checkout.css',

  '/js/app.js',
  '/js/router.js',
  '/js/config.js',
  '/js/core/store.js',
  '/js/core/icons.js',
  '/js/core/toast.js',
  '/js/core/theme.js',
  '/js/core/modal.js',
  '/js/core/forms.js',
  '/js/core/auth.js',
  '/js/core/nav.js',
  '/js/data/menu-data.js',
  '/js/data/reviews-data.js',
  '/js/data/gallery-data.js',
  '/js/ui/ui.js',
  '/js/ui/animations.js',
  '/js/features/cart.js',
  '/js/features/checkout.js',
  '/js/features/favourites.js',
  '/js/features/filter.js',
  '/js/features/item-modal.js',
  '/js/features/loyalty.js',
  '/js/features/ratings.js',
  '/js/features/reservations.js',
  '/js/features/reviews.js',
  '/js/pages/home.js',
  '/js/pages/menu.js',
  '/js/pages/about.js',
  '/js/pages/gallery.js',
  '/js/pages/reservations.js',
  '/js/pages/reviews.js',
  '/js/pages/contact.js',
  '/js/pages/faq.js',
  '/js/pages/account-login.js',
  '/js/pages/account-signup.js',
  '/js/pages/account-profile.js',
  '/js/pages/account-orders.js',
  '/js/pages/checkout.js',
  '/js/pages/order-confirmation.js',
  '/js/pages/not-found.js',

  '/partials/header.html',
  '/partials/footer.html',
  '/partials/home.html',
  '/partials/menu.html',
  '/partials/about.html',
  '/partials/gallery.html',
  '/partials/reservations.html',
  '/partials/reviews.html',
  '/partials/contact.html',
  '/partials/faq.html',
  '/partials/login.html',
  '/partials/signup.html',
  '/partials/profile.html',
  '/partials/orders.html',
  '/partials/checkout.html',
  '/partials/order-confirmation.html',
  '/partials/not-found.html',

  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',

  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.origin !== location.origin && !url.href.includes('fonts.googleapis.com') && !url.href.includes('fonts.gstatic.com') && !url.href.includes('images.unsplash.com')) {
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="225" viewBox="0 0 300 225">
              <rect width="300" height="225" fill="#f5ede0"/>
            </svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html').then(cached => cached ?? caches.match(OFFLINE_URL))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => caches.match(OFFLINE_URL));
    })
  );
});
