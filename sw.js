const CACHE = "echo-squad-v2";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./icon.svg",
  "./spectator.html",
  "./src/app.js",
  "./src/sim.js",
  "./src/neural.js",
  "./src/render.js",
  "./src/storage.js",
  "./src/lab.js",
  "./models/policy.json",
  "./research/manifest.json",
  "./research/learning.json",
  "./research/evaluation.json",
  "./research/evaluation.csv",
  "./research/learning.csv",
  "./research/EXPERIMENT.md",
  "./research/learning-curves.svg",
  "./research/controller-comparison.pdf",
  "./README.md",
];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("echo-squad-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    new URL(e.request.url).origin !== location.origin
  )
    return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() =>
        caches
          .match(e.request)
          .then(
            (r) => r || new Response("Unavailable offline", { status: 503 }),
          ),
      ),
  );
});
