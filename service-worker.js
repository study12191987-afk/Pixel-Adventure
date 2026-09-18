const CACHE_NAME = "pixel-adventure-v7-1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./levels.js",
  "./audio.js",
  "./manifest.json",
  "./pixel-adventure-icon-192.png",
  "./pixel-adventure-icon-512.png"
];

// 安装：缓存游戏需要的文件
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();
});

// 激活：删除旧版本缓存
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// 请求：优先读取网络，失败时使用缓存
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, copy));

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});