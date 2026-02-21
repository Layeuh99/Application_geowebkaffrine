(function () {
  "use strict";

  const STORAGE_KEY = "geoweb-theme";

  function applyTheme(themeName) {
    document.body.classList.toggle("dark-theme", themeName === "dark");
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
  }

  window.ThemeModule = {
    initTheme,
    toggleTheme
  };
})();
