const CACHE_NAME = 'kira-games-v1';
const STATIC_FILES = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Установка
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

// Активация
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Самое главное: перехват запросов
self.addEventListener('fetch', event => {
  // Нас интересуют только GET-запросы (картинки, звуки, скрипты)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 1. Если файл уже в кэше — отдаем его (работает офлайн)
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Если файла нет в кэше, качаем из интернета
      return fetch(event.request).then(networkResponse => {
        // Если скачали успешно, добавляем в кэш на будущее
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Если интернета нет и файла нет в кэше — ничего не поделать
        console.log('Офлайн: файл не найден в кэше', event.request.url);
      });
    })
  );
});