self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const plannerUrl = new URL("./#planner", self.registration.scope);
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const planner = tabs.find((tab) => {
      const url = new URL(tab.url);
      return url.origin === plannerUrl.origin &&
        (url.pathname === plannerUrl.pathname || url.pathname === plannerUrl.pathname + "index.html");
    });
    if (planner) {
      const tabUrl = new URL(planner.url);
      tabUrl.hash = plannerUrl.hash;
      const focusedPlanner = await planner.navigate(tabUrl.href);
      await (focusedPlanner || planner).focus();
    } else {
      await self.clients.openWindow(plannerUrl.href);
    }
  })());
});
