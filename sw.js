const CACHE_PREFIX='target-x-shell-';
const CACHE_VERSION='v62-20260909-private-query-safe';
const CACHE=`${CACHE_PREFIX}${CACHE_VERSION}`;
const APP_SHELL=['./','./index.html','./hist-2026.js','./app.js','./manager-tools.js','./upload-import.js','./client-profile.js','./profile-explorer.js','./profile-interactive.js','./rank-print.js','./print-mode.js','./alerts.js','./weekly-history.json','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const SHELL_URLS=new Set(APP_SHELL.map(item=>new URL(item,self.registration.scope).href));
const SENSITIVE=/\b(api|auth|login|logout|session|token|password|senha|secret|private|account|conta)\b/i;

function cacheableRequest(request){
  if(!request||request.method!=='GET') return false;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return false;
  if(request.headers.has('authorization')||request.headers.has('cookie')||request.headers.has('range')||request.headers.has('if-range')) return false;
  if(SENSITIVE.test(url.pathname)||SENSITIVE.test(url.search)) return false;
  return true;
}

function cacheableResponse(response){
  if(!response||!response.ok||response.type==='opaque'||response.redirected||response.status===206) return false;
  if(response.headers.has('set-cookie')||response.headers.has('content-range')) return false;
  const cc=(response.headers.get('cache-control')||'').toLowerCase();
  if(cc.includes('private')||cc.includes('no-store')) return false;
  const vary=(response.headers.get('vary')||'').toLowerCase().split(',').map(v=>v.trim()).filter(Boolean);
  if(vary.some(v=>v==='*'||v==='cookie'||v==='authorization'||v==='range')) return false;
  return true;
}

async function precache(){
  const cache=await caches.open(CACHE);
  await Promise.all(APP_SHELL.map(async asset=>{
    try{
      const url=new URL(asset,self.registration.scope);
      const request=new Request(url,{credentials:'omit',cache:'reload',redirect:'error'});
      const response=await fetch(request);
      if(cacheableResponse(response)) await cache.put(url,response.clone());
    }catch{}
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{await precache();await self.skipWaiting()})());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(!cacheableRequest(request)) return;
  const url=new URL(request.url);
  const isNavigation=request.mode==='navigate';
  const isShell=url.search===''&&SHELL_URLS.has(url.href);
  if(!isNavigation&&!isShell) return;

  event.respondWith((async()=>{
    try{
      const response=await fetch(request,{cache:'no-store',redirect:'error'});
      if(isShell&&cacheableResponse(response)){
        const cache=await caches.open(CACHE);
        await cache.put(request,response.clone());
      }
      return response;
    }catch(error){
      if(isShell){
        const cache=await caches.open(CACHE);
        const cached=await cache.match(request);
        if(cached) return cached;
      }
      if(isNavigation){
        const cache=await caches.open(CACHE);
        const fallback=await cache.match(new URL('./index.html',self.registration.scope));
        if(fallback) return fallback;
      }
      throw error;
    }
  })());
});
