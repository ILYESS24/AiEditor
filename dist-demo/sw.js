/**
 * AiEditor Service Worker
 * Provides offline support, caching, and performance optimization
 */

const CACHE_VERSION = 'v1.4.2';
const CACHE_NAME = `aieditor-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Cache first, then network (for static assets)
    cacheFirst: ['fonts.googleapis.com', 'fonts.gstatic.com', '.woff2', '.woff', '.ttf'],
    // Network first, then cache (for API calls and dynamic content)
    networkFirst: ['openrouter.ai', 'api.openai.com', 'api.anthropic.com'],
    // Stale while revalidate (for HTML, JS, CSS)
    staleWhileRevalidate: ['.js', '.css', '.html'],
};

/**
 * Install event - precache essential assets
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('aieditor-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Determine caching strategy
    const strategy = getCacheStrategy(url.href);

    if (strategy === 'cacheFirst') {
        event.respondWith(cacheFirst(request));
    } else if (strategy === 'networkFirst') {
        event.respondWith(networkFirst(request));
    } else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

/**
 * Determine which caching strategy to use
 */
function getCacheStrategy(url) {
    for (const pattern of CACHE_STRATEGIES.cacheFirst) {
        if (url.includes(pattern)) return 'cacheFirst';
    }
    for (const pattern of CACHE_STRATEGIES.networkFirst) {
        if (url.includes(pattern)) return 'networkFirst';
    }
    return 'staleWhileRevalidate';
}

/**
 * Cache First Strategy
 * Best for static assets that rarely change
 */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Cache first fetch failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network First Strategy
 * Best for API calls and frequently changing content
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

/**
 * Stale While Revalidate Strategy
 * Best for HTML, JS, CSS - returns cached version immediately, updates in background
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch((error) => {
            console.error('[SW] Stale while revalidate fetch failed:', error);
            return cached || new Response('Offline', { status: 503 });
        });

    return cached || fetchPromise;
}

/**
 * Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] Cache cleared');
        });
    }
});

/**
 * Background sync for offline document saving
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-documents') {
        event.waitUntil(syncDocuments());
    }
});

async function syncDocuments() {
    // Implementation for syncing documents when back online
    console.log('[SW] Syncing documents...');
}

/**
 * Push notifications (for future use)
 */
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'AiEditor', {
            body: data.body || 'New notification',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            data: data.data,
        })
    );
});
