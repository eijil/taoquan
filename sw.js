var cacheName = 'phaser-pwa';
var filesToCache = [
    '/',
    '/index.html',
    '/img/logo.png',
    '/img/btnStart.png',
    '/img/321.png',
    '/img/quan.png',
    '/img/bquan.png',
    '/img/fquan.png',
    '/img/boxbg.png',
    '/img/bubble.png',
    '/img/map.png',
    '/img/gamebox.png',
    '/img/texture_.png',
    '/img/rule.png',
    '/img/zhenshadow.png',
    '/img/water.png',
    '/img/leftbutton.png',
    '/img/rightbutton.png',
    '/img/zhen.png',
    '/img/+10.png',
    '/js/conf.js',
    '/js/game.js',
    '/js/main.js',
    '/css/game.css',
];

self.addEventListener('install', function (event) {
    console.log('sw install');
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('sw caching files');
            return cache.addAll(filesToCache);
        }).catch(function (err) {
            console.log(err);
        })
    );
});


self.addEventListener('fetch', (event) => {
    console.log('sw fetch');
    console.log(event.request.url);
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        }).catch(function (error) {
            console.log(error);
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('sw activate');
    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('sw removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});