const CACHE_NAME='kfcc-admin-v2';
const CACHE_PREFIX='kfcc-admin-';
const ADMIN_SHELL=['/admin/','/admin.html','/admin-pwa.webmanifest','/admin-pwa-icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ADMIN_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;if(request.mode==='navigate'){event.respondWith(fetch(request).then(response=>{if(response.ok)caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone()));return response;}).catch(async()=>await caches.match(request)||await caches.match('/admin/')||await caches.match('/admin.html')));return;}event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok&&response.type==='basic')caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone()));return response;}).catch(()=>cached)));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
