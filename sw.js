// StudyForge Service Worker
const CACHE = 'studyforge-v1';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// Receive scheduled notifications from the app
self.addEventListener('message', e => {
  const d = e.data;
  if (!d) return;

  if (d.type === 'SCHEDULE') {
    const delay = d.fireAt - Date.now();
    if (delay <= 0 || delay > 48 * 60 * 60 * 1000) return;
    setTimeout(() => {
      self.registration.showNotification(d.title, {
        body: d.body,
        tag: d.tag || 'sf',
        icon: d.icon || '',
        badge: d.icon || '',
        vibrate: [200, 80, 200],
        requireInteraction: false,
        data: { sessionId: d.sessionId, url: d.url || '/' }
      });
    }, delay);
  }

  if (d.type === 'IMMEDIATE') {
    self.registration.showNotification(d.title, {
      body: d.body,
      tag: d.tag || 'sf-now',
      vibrate: [150, 50, 150],
      requireInteraction: false
    });
  }

  if (d.type === 'CANCEL') {
    // nothing needed - tag-based deduplication handles this
  }
});

// Click notification → open/focus the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      if (cs.length) return cs[0].focus();
      return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});
