var CACHE_NAME = "my-site-cache-v5";
const DATA_CACHE_NAME = "data-cache-v5";

var cachedFiles = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

// Installation life cycle
self.addEventListener("install", function(e) {
    // Perform install steps
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log("Cache is open for business");
            return cache.addAll(cachedFiles);
        })
    );
    // Waiting life cycle skipped!
    self.skipWaiting();
  }
);

// Activation life cycle
self.addEventListener("activate", function(e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
            keyList.map(key => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                console.log("Removing old cache data", key);
                return caches.delete(key);
                }
            })
        );
      })
    );
  
    self.clients.claim();
  }
);

// fetch
self.addEventListener("fetch", function(e) {
    // cache successful requests to the API
    if (e.req.url.includes("/api/")) {
      e.respondWith(
        caches.open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(e.req)
            .then(res => {
              // If the response was good, clone it and store it in the cache.
              if (res.status === 200) {
                cache.put(e.req.url, res.clone());
              }
  
              return res;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(e.req);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  

    e.respondWith(
      caches.match(e.req).then(function(res) {
        return res || fetch(e.req);
      })
    );
  }
);