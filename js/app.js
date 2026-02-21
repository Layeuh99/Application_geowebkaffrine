(function () {
  "use strict";

  function boot() {
    ThemeModule.initTheme();
    MapModule.initMap();
    MapModule.initLayers();
    UIModule.initUI();
    MapModule.setStatus("Application chargee");
    setTimeout(() => MapModule.invalidateSize(), 250);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
