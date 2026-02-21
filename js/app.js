(function () {
  "use strict";

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  function setupPerformanceHints() {
    if (!("requestIdleCallback" in window)) return;
    window.requestIdleCallback(() => {
      if (window.MapModule) window.MapModule.invalidateSize();
    });
  }

  function applyLaunchShortcut() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (!action || !window.UIModule || !UIModule.executeAction) return;
    if (action === "layers") UIModule.executeAction("layers");
    if (action === "analysis") UIModule.executeAction("analysis-modal");
    if (action === "metadata") UIModule.executeAction("metadata");
  }

  function boot() {
    ThemeModule.initTheme();
    MapModule.initMap();
    MapModule.initLayers();
    UIModule.initUI();
    MapModule.setStatus("Application chargee");

    setTimeout(() => MapModule.invalidateSize(), 250);
    setInterval(() => {
      if (window.UIModule && window.UIModule.renderDashboard) {
        window.UIModule.renderDashboard();
      }
    }, 4000);

    registerServiceWorker();
    setupPerformanceHints();
    applyLaunchShortcut();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
