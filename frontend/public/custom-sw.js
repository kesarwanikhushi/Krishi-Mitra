importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: false });

// Precache manifest will be injected by next-pwa
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Cache static assets and fonts
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'font',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache images
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Use stale-while-revalidate for GET /weather, /market, /calendar, /advisories (frontend or backend)
workbox.routing.registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.pathname.match(/^\/(weather|market|calendar|advisories)$/) ||
    url.pathname.match(/^\/backend\/(weather|market|calendar|advisories)/),
  async ({ event }) => {
    try {
      return await workbox.strategies.StaleWhileRevalidate({
        cacheName: 'api-data',
        plugins: [
          new workbox.expiration.ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 }),
        ],
      }).handle({ event });
    } catch (err) {
      // Fallback to last cached response if offline
      const cache = await caches.open('api-data');
      const cached = await cache.match(event.request);
      if (cached) return cached;
      throw err;
    }
  },
  'GET'
);

// Background sync for POST advice endpoint
const adviceQueue = new workbox.backgroundSync.Queue('adviceQueue', {
  maxRetentionTime: 24 * 60, // Retry for max 24 hours
});

// Function to get API base URL based on current origin
const getApiUrl = () => {
  // In production, use the same origin or environment-specific URL
  if (self.location.hostname === 'localhost') {
    return 'http://localhost:5001';
  }
  // For production, determine API URL based on deployment
  // This should match your actual deployed backend URL
  return process.env.NEXT_PUBLIC_API_URL || 'https://krishi-mitra-backend.onrender.com';
};

workbox.routing.registerRoute(
  ({ url, request }) =>
    request.method === 'POST' && 
    (url.pathname === '/backend/advice' || url.pathname.endsWith('/advice')),
  async ({ event }) => {
    try {
      // For development, keep original URL. For production, transform URL
      let requestUrl = event.request.url;
      if (event.request.url.includes('/backend/advice')) {
        requestUrl = event.request.url.replace('/backend/advice', `${getApiUrl()}/advice`);
      }
      
      const modifiedRequest = new Request(requestUrl, {
        method: event.request.method,
        headers: event.request.headers,
        body: event.request.body,
        mode: 'cors',
        credentials: 'include'
      });
      
      return await fetch(modifiedRequest);
    } catch (error) {
      await adviceQueue.pushRequest({ request: event.request });
      return new Response(JSON.stringify({
        queued: true,
        message: 'You are offline. Your advice will be sent when back online.'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 202
      });
    }
  },
  'POST'
);

// Listen for custom offline download event
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'PRECACHE_LATEST_DATASETS') {
    const apiUrl = getApiUrl();
    const datasets = [
      `${apiUrl}/weather?district=Kanpur`,
      `${apiUrl}/market?crop=Wheat&market=Kanpur&days=7`,
      `${apiUrl}/advisories?district=Kanpur&crop=Wheat`,
    ];
    await Promise.all(
      datasets.map(async (url) => {
        try {
          await caches.open('api-data').then((cache) => cache.add(url));
        } catch (e) {}
      })
    );
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) =>
        client.postMessage({ type: 'OFFLINE_READY' })
      );
    });
  }
});

// Offline fallback
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});
