const CACHE_NAME = 'restaurant-cache-v4';

const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
      return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(err => {
            console.log('تم تجاوز خطأ في جلب ملف خارجي:', event.request.url);
            // 💡 التعديل هنا: إرجاع استجابة وهمية فارغة عشان الـ Service Worker ميضربش إيرور
            return new Response('', { status: 404, statusText: 'Not Found' });
        });
      })
  );
});
