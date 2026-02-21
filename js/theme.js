(function () {
  "use strict";

  const STORAGE_KEY = "geoweb-theme";
  const META_THEME = "meta[name='theme-color']";

  function applyTheme(themeName) {
    document.body.classList.toggle("dark-theme", themeName === "dark");
    const meta = document.querySelector(META_THEME);
    if (meta) {
      meta.setAttribute("content", themeName === "dark" ? "#0b1221" : "#1e5eff");
    }
  }

  function getCurrentTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  }

  function initTheme() {
    applyTheme(getCurrentTheme());
  }

  function toggleTheme() {
    const next = document.body.classList.contains("dark-theme") ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    return next;
  }

  window.ThemeModule = {
    initTheme: initTheme,
    toggleTheme: toggleTheme,
    getCurrentTheme: getCurrentTheme
  };
})();
