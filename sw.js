const CACHE_VERSION = 2;
const CACHE_NAME = 'writer-v' + CACHE_VERSION;

const PRECACHE_URLS = [
	'./',
	'index.html',
	'css/main.css',
	'js/sprite-data.js',
	'js/writer.js',
	'js/main.js',
	'img/list.png',
	'favicon-16x16.png',
	'favicon-32x32.png'
];

// Установка — precache основных ресурсов
self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function(cache) {
			return cache.addAll(PRECACHE_URLS);
		}).then(function() {
			return self.skipWaiting();
		})
	);
});

// Активация — удаление старых кешей
self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(names) {
			return Promise.all(
				names.filter(function(name) { return name !== CACHE_NAME; })
					.map(function(name) { return caches.delete(name); })
			);
		}).then(function() {
			return self.clients.claim();
		})
	);
});

// Fetch — cache-first для спрайтов, network-first для остального
self.addEventListener('fetch', function(event) {
	var url = event.request.url;

	// Cache-first для спрайтов (300dpi/*.png)
	if (url.indexOf('dpi/') !== -1 && url.endsWith('.png')) {
		event.respondWith(
			caches.match(event.request).then(function(cached) {
				if (cached) return cached;
				return fetch(event.request).then(function(response) {
					if (response.ok) {
						var clone = response.clone();
						caches.open(CACHE_NAME).then(function(cache) {
							cache.put(event.request, clone);
						});
					}
					return response;
				});
			})
		);
		return;
	}

	// Network-first для остальных ресурсов
	event.respondWith(
		fetch(event.request).then(function(response) {
			if (response.ok) {
				var clone = response.clone();
				caches.open(CACHE_NAME).then(function(cache) {
					cache.put(event.request, clone);
				});
			}
			return response;
		}).catch(function() {
			return caches.match(event.request);
		})
	);
});
