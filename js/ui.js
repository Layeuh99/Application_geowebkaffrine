(function () {
  "use strict";

  const state = {
    mobileMenuOpen: false,
    fabOpen: false
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".dropdown.open").forEach((el) => {
      el.classList.remove("open");
      const btn = el.querySelector(".dropdown-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function toggleDropdown(dropdownEl) {
    const opening = !dropdownEl.classList.contains("open");
    closeAllDropdowns();
    if (opening) {
      dropdownEl.classList.add("open");
      const btn = dropdownEl.querySelector(".dropdown-toggle");
      if (btn) btn.setAttribute("aria-expanded", "true");
    }
  }

  function setOverlay(show) {
    const overlay = byId("uiOverlay");
    if (!overlay) return;
    overlay.classList.toggle("show", show);
  }

  function openPanel(panelId) {
    document.querySelectorAll(".panel.open").forEach((panel) => {
      if (panel.id !== panelId) panel.classList.remove("open");
    });
    const panel = byId(panelId);
    if (!panel) return;
    panel.classList.add("open");
    setOverlay(true);
    MapModule.invalidateSize();
  }

  function closePanel(panelId) {
    const panel = byId(panelId);
    if (!panel) return;
    panel.classList.remove("open");
    const anyPanelOpen = document.querySelector(".panel.open");
    const modalOpen = document.querySelector(".modal.open");
    setOverlay(Boolean(anyPanelOpen || modalOpen || state.mobileMenuOpen));
    MapModule.invalidateSize();
  }

  function toggleMobileMenu() {
    const menu = byId("mobileMenu");
    const btn = byId("mobileMenuToggle");
    if (!menu || !btn) return;
    state.mobileMenuOpen = !state.mobileMenuOpen;
    menu.classList.toggle("open", state.mobileMenuOpen);
    btn.setAttribute("aria-expanded", state.mobileMenuOpen ? "true" : "false");
    setOverlay(state.mobileMenuOpen);
  }

  function closeMobileMenu() {
    const menu = byId("mobileMenu");
    const btn = byId("mobileMenuToggle");
    if (!menu || !btn) return;
    state.mobileMenuOpen = false;
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    const anyPanelOpen = document.querySelector(".panel.open");
    const modalOpen = document.querySelector(".modal.open");
    setOverlay(Boolean(anyPanelOpen || modalOpen));
  }

  function toggleFab() {
    const menu = byId("fabMenu");
    if (!menu) return;
    state.fabOpen = !state.fabOpen;
    menu.classList.toggle("open", state.fabOpen);
  }

  function closeFab() {
    const menu = byId("fabMenu");
    if (!menu) return;
    state.fabOpen = false;
    menu.classList.remove("open");
  }

  function openMetadata() {
    const modal = byId("metadataModal");
    if (!modal) return;
    modal.classList.add("open");
    setOverlay(false);
  }

  function closeMetadata() {
    const modal = byId("metadataModal");
    if (!modal) return;
    modal.classList.remove("open");
    const anyPanelOpen = document.querySelector(".panel.open");
    setOverlay(Boolean(anyPanelOpen || state.mobileMenuOpen));
  }

  function renderLayersPanel() {
    const container = byId("layersList");
    if (!container) return;
    const layers = MapModule.getLayerState();
    const rows = Object.keys(layers).map((key) => {
      const item = layers[key];
      const checked = item.active ? "checked" : "";
      const opacity = Math.round(item.opacity * 100);
      return (
        '<div class="layer-row">' +
        '<div class="layer-top">' +
        '<label><input type="checkbox" data-layer-toggle="' + key + '" ' + checked + "> " + item.def.label + "</label>" +
        '<span>' + opacity + "%</span>" +
        "</div>" +
        '<input type="range" min="0" max="100" value="' + opacity + '" data-layer-opacity="' + key + '">' +
        "</div>"
      );
    });
    container.innerHTML = rows.join("");
  }

  function renderLegend() {
    const container = byId("legendContent");
    if (!container) return;
    const layers = MapModule.getLayerState();
    const rows = Object.keys(layers)
      .filter((key) => layers[key].active)
      .map((key) => {
        const item = layers[key];
        return (
          '<div class="legend-row">' +
          '<span class="legend-chip legend-chip-' + key.toLowerCase() + '"></span>' +
          '<span>' + item.def.label + "</span>" +
          "</div>"
        );
      });
    container.innerHTML = rows.length ? rows.join("") : "<p>Aucune couche active.</p>";
  }

  function handleLayerEvents(event) {
    const toggle = event.target.closest("[data-layer-toggle]");
    if (toggle) {
      const key = toggle.getAttribute("data-layer-toggle");
      MapModule.setLayerVisibility(key, toggle.checked);
      renderLegend();
      return;
    }
    const opacity = event.target.closest("[data-layer-opacity]");
    if (opacity) {
      const key = opacity.getAttribute("data-layer-opacity");
      const value = Number(opacity.value) / 100;
      MapModule.setLayerOpacity(key, value);
      renderLayersPanel();
    }
  }

  function handleMenuAction(actionName) {
    switch (actionName) {
      case "home":
        MapModule.resetHome();
        break;
      case "layers":
        openPanel("layersPanel");
        break;
      case "legend":
        renderLegend();
        openPanel("legendPanel");
        break;
      case "analysis":
        MapModule.setStatus("Analyse spatiale disponible");
        break;
      case "routing":
        MapModule.startRouting();
        break;
      case "measure":
        MapModule.toggleMeasure();
        break;
      case "download":
        MapModule.downloadActiveData();
        break;
      case "metadata":
        openMetadata();
        break;
      case "zoom-in":
        MapModule.zoomIn();
        break;
      case "zoom-out":
        MapModule.zoomOut();
        break;
      case "full-extent":
        MapModule.resetHome();
        break;
      default:
        break;
    }
    closeMobileMenu();
    closeFab();
    closeAllDropdowns();
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const dropdownToggle = event.target.closest(".dropdown-toggle");
      if (dropdownToggle) {
        toggleDropdown(dropdownToggle.closest(".dropdown"));
        return;
      }

      if (!event.target.closest(".dropdown")) {
        closeAllDropdowns();
      }

      const actionButton = event.target.closest(".menu-action");
      if (actionButton) {
        handleMenuAction(actionButton.getAttribute("data-action"));
        return;
      }

      const panelClose = event.target.closest("[data-close-panel]");
      if (panelClose) {
        closePanel(panelClose.getAttribute("data-close-panel"));
        return;
      }

      if (event.target.id === "mobileMenuToggle") {
        toggleMobileMenu();
        return;
      }

      if (event.target.id === "fabButton") {
        toggleFab();
        return;
      }

      if (event.target.id === "themeToggle") {
        ThemeModule.toggleTheme();
        return;
      }

      if (event.target.id === "closeMetadata") {
        closeMetadata();
        return;
      }

      if (event.target.id === "uiOverlay") {
        closeMobileMenu();
        closePanel("layersPanel");
        closePanel("legendPanel");
        closeMetadata();
        closeFab();
      }
    });

    document.addEventListener("input", handleLayerEvents);
    document.addEventListener("change", handleLayerEvents);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllDropdowns();
        closeMobileMenu();
        closePanel("layersPanel");
        closePanel("legendPanel");
        closeMetadata();
        closeFab();
      }
    });

    const brand = byId("brandHome");
    if (brand) {
      brand.addEventListener("click", MapModule.resetHome);
      brand.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          MapModule.resetHome();
        }
      });
    }
  }

  function initUI() {
    bindEvents();
    renderLayersPanel();
    renderLegend();
  }

  window.UIModule = {
    initUI,
    renderLegend
  };
})();
