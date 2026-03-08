self.addEventListener("push", function (event) {
  if (!event.data) return;
  let data = { title: "Family Workspace", body: "", url: "/" };
  try {
    data = { ...data, ...event.data.json() };
  } catch (_) {
    data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "通知", {
      body: data.body,
      data: { url: data.url || "/" },
      icon: "/favicon.ico",
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.indexOf(self.location.origin) === 0 && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
