const CACHE_PREFIX = 'target-x-shell-';
const CACHE_VERSION = 'v36-20260903-safe';
const CACHE = `${CACHE_PREFIX}${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './hist-2026.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

const SENSITIVE_PATH = /(?:^|\/)(?:api|auth|login|logout|session|sessions|token|tokens|account|accounts|profile|admin|private|user|users)(?:\/|$)/i;
const SENSITIVE_PARAM = /(?:token|access_token|refresh_token|code|password|senha|secret|session|auth|authorization)/i;
const SAFE_SHELL_PATHS = new Set(APP_SHELL.map((item) => new URL(item, self.registration.scope).pathname));

function isSensitiveRequest(request, url) {
  if (request.headers.has('authorization') || request.headers.has('cookie')) return true;
  if (request.headers.has('range') || request.headers.has('if-range')) return true;
  if (SENSITIVE_PATH.test(url.pathname)) return true;
  for (const key of url.searchParams.keys()) {
    if (SENSITIVE_PARAM.test(key)) return true;
  }
  return false;
}

function isCacheableResponse(response) {
  if (!response || !response.ok || response.type === 'opaque' || response.redirected) return false;
  if (response.status === 206 || response.headers.has('content-range') || response.headers.has('set-cookie')) return false;
  const cacheControl = response.headers.get('cache-control') || '';
  return !/(?:^|,)\s*(?:private|no-store)\b/i.test(cacheControl);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin || isSensitiveRequest(request, url)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store', redirect: 'error' });
        if (isCacheableResponse(response)) {
          const cache = await caches.open(CACHE);
          await cache.put('./index.html', response.clone());
        }
        return response;
      } catch {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  if (!SAFE_SHELL_PATHS.has(url.pathname)) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache: 'no-store', redirect: 'error' });
      if (isCacheableResponse(response)) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
