self.addEventListener("install", e =>{
    e.waitUntil(
        caches.open("static").then(cache =>{
            return cache.addAll(["./", "styles.css", "logo192.png"]);
        })
    );
});