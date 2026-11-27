// Service worker: no caching. Shows push notifications (data messages) and opens the app on tap.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
function convOf(tag, to) {
  if (!tag || tag.indexOf('m|') !== 0) return '';
  const p = tag.split('|').slice(1);
  if (p[0] === 'all') return 'all';
  return p.filter(x => x && x !== to)[0] || '';
}
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) {}
  d = d.data || d;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    if (l.some(c => c.focused)) return;
    return self.registration.showNotification(d.title || 'Sunud', { body: d.body || '', tag: d.tag || 'sunud', data: { u: d.u || './', tag: d.tag || '', to: d.to || '' } });
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const nd = e.notification.data || {}, c = convOf(nd.tag, nd.to);
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const cl of l) if ('focus' in cl) return cl.focus().then(w => { if (c) w.postMessage({ t: 'open', c: c }); return w; });
    return self.clients.openWindow(c ? './#c=' + c : './');
  }));
});
