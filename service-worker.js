const CACHE_NAME = 'liz-tribute-v1';
const DYNAMIC_CACHE = 'liz-tribute-dynamic-v1';

// Core assets to cache immediately
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/loader.css',
    '/messages.css',
    '/script.js',
    '/messages.js',
    '/icons/InBug-White.png',
    '/icons/github-mark-white.svg',
    '/profile-pic/DP.jpg'
];

// Image assets to cache (lazy)
const IMAGE_ASSETS = [
    '/images/liz.jpeg',
    '/images/liz1.jpg',
    '/images/liz2.jpg',
    '/images/liz3.jpg',
    '/images/liz4.jpg',
    '/images/liz5.jpg',
    '/images/liz6.jpg',
    '/images/lizA.jpg',
    '/images/lizB.jpg',
    '/images/lizz1.jpg',
    '/images/lizz2.jpg',
    '/images/lizz3.jpg',
    '/images/lizz4.jpg',
    '/images/lizz5.jpg',
    '/images/lizz6.jpg',
    '/images/lizz7.jpg',
    '/images/lizz8.jpg',
    '/images2/photo_2025-11-12_19-10-11.jpg',
    '/images2/photo_2025-11-12_19-10-16.jpg',
    '/images2/photo_2025-11-12_19-10-19.jpg',
    '/images2/photo_2025-11-12_19-10-22.jpg',
    '/images2/photo_2025-11-12_19-10-25.jpg',
    '/images2/photo_2025-11-12_19-10-28.jpg',
    '/images2/photo_2025-11-12_19-10-30.jpg',
    '/images2/photo_2025-11-12_19-10-34.jpg',
    '/images2/photo_2025-11-12_19-10-37.jpg',
    '/images2/photo_2025-11-12_19-10-40.jpg',
    '/images2/photo_2025-11-12_19-10-42.jpg',
    '/images2/photo_2025-11-12_19-10-44.jpg',
    '/images2/photo_2025-11-12_19-10-47.jpg',
    '/images2/photo_2025-11-12_19-10-49.jpg',
    '/images2/photo_2025-11-12_19-10-52.jpg'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests (Firebase, Google Fonts, etc.)
    if (url.origin !== location.origin) {
        return;
    }

    // Network-first strategy for messages.html and Firebase data
    if (url.pathname.includes('messages') || url.hostname.includes('firebase')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Cache-first strategy for images and videos
    if (request.destination === 'image' || request.destination === 'video') {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Stale-while-revalidate for HTML, CSS, JS
    if (request.destination === 'document' || 
        request.destination === 'script' || 
        request.destination === 'style') {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Default to cache-first for everything else
    event.respondWith(cacheFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        
        // Only cache successful responses
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('Fetch failed:', error);
        
        // Return offline fallback if available
        const fallback = await cache.match('/index.html');
        return fallback || new Response('Offline - please check your connection', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network-first strategy
async function networkFirst(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        return cached || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then((response) => {
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    });

    return cached || fetchPromise;
}

// Background sync for failed message posts (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    // Placeholder for syncing messages when back online
    console.log('Syncing messages...');
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'New Update';
    const options = {
        body: data.body || 'Check out what\'s new!',
        icon: '/profile-pic/DP.jpg',
        badge: '/icons/badge.png',
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
