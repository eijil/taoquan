var cacheName = 'phaser-pwa';
var filesToCache = [
    '/taoquan',
    '/index.html',
    '/taoquan/img/logo.png',
    '/taoquan/img/btnStart.png',
    '/taoquan/img/321.png',
    '/taoquan/img/quan.png',
    '/taoquan/img/bquan.png',
    '/taoquan/img/fquan.png',
    '/taoquan/img/boxbg.png',
    '/taoquan/img/bubble.png',
    '/taoquan/img/map.png',
    '/taoquan/img/gamebox.png',
    '/taoquan/img/texture_.png',
    '/taoquan/img/rule.png',
    '/taoquan/img/zhenshadow.png',
    '/taoquan/img/water.png',
    '/taoquan/img/leftbutton.png',
    '/taoquan/img/rightbutton.png',
    '/taoquan/img/zhen.png',
    '/taoquan/img/+10.png',
    '/taoquan/js/conf.js',
    '/taoquan/js/game.js',
    '/taoquan/js/main.js',
    '/taoquan/css/game.css',
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