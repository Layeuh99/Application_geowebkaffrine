(function () {
  "use strict";

  const state = {
    mobileMenuOpen: false,
    fabOpen: false,
    deferredInstallPrompt: null,
    activity: []
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

  function overlayState() {
    const panelOpen = document.querySelector(".panel.open");
    const dashboardOpen = document.querySelector(".dashboard.open");
    const modalOpen = document.querySelector(".modal.open");
    return Boolean(panelOpen || dashboardOpen || modalOpen || state.mobileMenuOpen);
  }

  function setOverlay() {
    const overlay = byId("uiOverlay");
    if (!overlay) return;
    overlay.classList.toggle("show", overlayState());
  }

  function closeAllPanels() {
    document.querySelectorAll(".panel.open").forEach((p) => p.classList.remove("open"));
    const dashboard = byId("dashboardPanel");
    if (dashboard) dashboard.classList.remove("open");
  }

  function openPanel(panelId) {
    closeAllPanels();
    const panel = byId(panelId);
    if (!panel) return;
    panel.classList.add("open");
    setOverlay();
    MapModule.invalidateSize();
  }

  function closePanel(panelId) {
    const panel = byId(panelId);
    if (!panel) return;
    panel.classList.remove("open");
    setOverlay();
    MapModule.invalidateSize();
  }

  function openDashboard() {
    closeAllPanels();
    const panel = byId("dashboardPanel");
    if (!panel) return;
    panel.classList.add("open");
    setOverlay();
  }

  function toggleMobileMenu() {
    const menu = byId("mobileMenu");
    const btn = byId("mobileMenuToggle");
    if (!menu || !btn) return;
    state.mobileMenuOpen = !state.mobileMenuOpen;
    menu.classList.toggle("open", state.mobileMenuOpen);
    btn.setAttribute("aria-expanded", state.mobileMenuOpen ? "true" : "false");
    setOverlay();
  }

  function closeMobileMenu() {
    const menu = byId("mobileMenu");
    const btn = byId("mobileMenuToggle");
    if (!menu || !btn) return;
    state.mobileMenuOpen = false;
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    setOverlay();
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

  function openModal(id) {
    const modal = byId(id);
    if (!modal) return;
    modal.classList.add("open");
    setOverlay();
  }

  function closeModal(id) {
    const modal = byId(id);
    if (!modal) return;
    modal.classList.remove("open");
    setOverlay();
  }

  function toast(message, level) {
    const rack = byId("toastRack");
    if (!rack) return;
    const node = document.createElement("div");
    node.className = "toast";
    const cls = level === "error" ? "status-danger" : (level === "warn" ? "status-warn" : "status-ok");
    node.innerHTML = '<strong class="' + cls + '">' + message + "</strong>";
    rack.prepend(node);
    setTimeout(() => {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 3200);
  }

  function addActivity(text) {
    state.activity.unshift({
      at: new Date(),
      text: text
    });
    state.activity = state.activity.slice(0, 8);
    const list = byId("activityList");
    if (!list) return;
    list.innerHTML = state.activity.map((item) => {
      const hh = String(item.at.getHours()).padStart(2, "0");
      const mm = String(item.at.getMinutes()).padStart(2, "0");
      return "<li>[" + hh + ":" + mm + "] " + item.text + "</li>";
    }).join("");
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
          "<span>" + item.def.label + "</span>" +
          "</div>"
        );
      });
    container.innerHTML = rows.length ? rows.join("") : "<p>Aucune couche active.</p>";
  }

  function renderDashboard() {
    const stats = MapModule.dashboardStats();
    const kpiFeatures = byId("kpiFeatures");
    const kpiLayers = byId("kpiLayers");
    const kpiZoom = byId("kpiZoom");
    const kpiTheme = byId("kpiTheme");
    if (kpiFeatures) kpiFeatures.textContent = String(stats.activeFeatures);
    if (kpiLayers) kpiLayers.textContent = String(stats.activeLayers);
    if (kpiZoom) kpiZoom.textContent = String(stats.zoom);
    if (kpiTheme) kpiTheme.textContent = document.body.classList.contains("dark-theme") ? "Sombre" : "Clair";
  }

  function updateNetworkLabel() {
    const net = byId("networkText");
    if (!net) return;
    net.textContent = navigator.onLine ? "Online" : "Offline";
  }

  function executeInstall() {
    if (!state.deferredInstallPrompt) {
      toast("Installation non disponible pour ce navigateur", "warn");
      return;
    }
    state.deferredInstallPrompt.prompt();
    state.deferredInstallPrompt.userChoice.then(() => {
      state.deferredInstallPrompt = null;
      const banner = byId("installToast");
      if (banner) banner.classList.remove("show");
    });
  }

  function handleLayerEvents(event) {
    const toggle = event.target.closest("[data-layer-toggle]");
    if (toggle) {
      const key = toggle.getAttribute("data-layer-toggle");
      MapModule.setLayerVisibility(key, toggle.checked);
      renderLegend();
      renderDashboard();
      addActivity((toggle.checked ? "Activation " : "Desactivation ") + key);
      return;
    }
    const opacity = event.target.closest("[data-layer-opacity]");
    if (opacity) {
      const key = opacity.getAttribute("data-layer-opacity");
      const value = Number(opacity.value) / 100;
      MapModule.setLayerOpacity(key, value);
      renderLayersPanel();
      addActivity("Opacite " + key + " = " + Math.round(value * 100) + "%");
    }
  }

  function handleMenuAction(actionName) {
    switch (actionName) {
      case "home":
        MapModule.resetHome();
        addActivity("Vue complete");
        break;
      case "dashboard":
        renderDashboard();
        openDashboard();
        addActivity("Ouverture command center");
        break;
      case "layers":
        renderLayersPanel();
        openPanel("layersPanel");
        addActivity("Ouverture panneau couches");
        break;
      case "legend":
        renderLegend();
        openPanel("legendPanel");
        addActivity("Ouverture legende");
        break;
      case "analysis":
        MapModule.setStatus("Analyse spatiale prete");
        toast("Analyse spatiale prete", "ok");
        addActivity("Preparation analyse spatiale");
        break;
      case "analysis-modal":
        openModal("analysisModal");
        addActivity("Ouverture analyse avancee");
        break;
      case "routing":
        MapModule.startRouting();
        toast("Cliquez 2 points pour tracer l'itineraire", "ok");
        addActivity("Mode itineraire");
        break;
      case "measure":
        MapModule.toggleMeasure();
        addActivity("Activation mesure");
        break;
      case "download":
        MapModule.downloadActiveData();
        addActivity("Export GeoJSON");
        break;
      case "metadata":
        openModal("metadataModal");
        addActivity("Ouverture metadonnees");
        break;
      case "install":
        executeInstall();
        addActivity("Tentative installation");
        break;
      case "basemap-osm":
        MapModule.switchBasemap("osm");
        addActivity("Fond OSM");
        break;
      case "basemap-toner":
        MapModule.switchBasemap("toner");
        addActivity("Fond contraste");
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
    renderDashboard();
  }

  function startAnalysisFromForm() {
    const layer = byId("analysisLayer");
    const radius = byId("analysisRadius");
    const limit = byId("analysisLimit");
    if (!layer || !radius || !limit) return;
    MapModule.startAdvancedAnalysis({
      layerKey: layer.value,
      radius: Number(radius.value),
      limit: Number(limit.value)
    });
    closeModal("analysisModal");
    addActivity("Analyse avancee en attente de point carte");
  }

  function clearAnalysis() {
    MapModule.clearAnalysis();
    const result = byId("analysisResult");
    if (result) result.textContent = "Aucun resultat.";
    addActivity("Nettoyage analyse");
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const dropdownToggle = event.target.closest(".dropdown-toggle");
      if (dropdownToggle) {
        toggleDropdown(dropdownToggle.closest(".dropdown"));
        return;
      }
      if (!event.target.closest(".dropdown")) closeAllDropdowns();

      const actionButton = event.target.closest(".menu-action");
      if (actionButton) {
        handleMenuAction(actionButton.getAttribute("data-action"));
        return;
      }

      const panelClose = event.target.closest("[data-close-panel]");
      if (panelClose) {
        const id = panelClose.getAttribute("data-close-panel");
        if (id === "dashboardPanel") byId("dashboardPanel").classList.remove("open");
        else closePanel(id);
        setOverlay();
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
        const current = ThemeModule.toggleTheme();
        event.target.textContent = current === "dark" ? "Sombre" : "Clair";
        MapModule.refreshThemeStyles();
        renderLegend();
        renderDashboard();
        addActivity("Changement theme");
        return;
      }
      if (event.target.id === "closeMetadata") {
        closeModal("metadataModal");
        return;
      }
      if (event.target.id === "closeAnalysis") {
        closeModal("analysisModal");
        return;
      }
      if (event.target.id === "startAnalysis") {
        startAnalysisFromForm();
        return;
      }
      if (event.target.id === "clearAnalysis") {
        clearAnalysis();
        return;
      }
      if (event.target.id === "installNow") {
        executeInstall();
        return;
      }
      if (event.target.id === "installLater") {
        const banner = byId("installToast");
        if (banner) banner.classList.remove("show");
        return;
      }
      if (event.target.id === "uiOverlay") {
        closeMobileMenu();
        closeAllPanels();
        closeModal("metadataModal");
        closeModal("analysisModal");
        closeFab();
        setOverlay();
      }
    });

    document.addEventListener("input", handleLayerEvents);
    document.addEventListener("change", handleLayerEvents);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllDropdowns();
        closeMobileMenu();
        closeAllPanels();
        closeModal("metadataModal");
        closeModal("analysisModal");
        closeFab();
        setOverlay();
      }
    });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      const banner = byId("installToast");
      if (banner) banner.classList.add("show");
      addActivity("Prompt installation disponible");
    });

    window.addEventListener("online", () => {
      const net = byId("networkText");
      if (net) net.textContent = "Online";
      toast("Connexion retablie", "ok");
    });

    window.addEventListener("offline", () => {
      const net = byId("networkText");
      if (net) net.textContent = "Offline";
      toast("Mode hors-ligne actif", "warn");
    });

    const brand = byId("brandHome");
    if (brand) {
      brand.addEventListener("click", () => window.location.reload());
      brand.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.location.reload();
        }
      });
    }
  }

  function onAnalysisResult(summary, topList) {
    const box = byId("analysisResult");
    if (!box) return;
    if (!topList || !topList.length) {
      box.textContent = summary;
      return;
    }
    box.innerHTML =
      "<strong>" + summary + "</strong><br>" +
      topList.map((item) => {
        const n = item.feature && item.feature.properties
          ? (item.feature.properties.NOM || item.feature.properties.arr || item.feature.properties.dept || "Feature")
          : "Feature";
        return n + " - " + Math.round(item.distance) + " m";
      }).join("<br>");
    addActivity(summary);
    toast(summary, "ok");
  }

  function initUI() {
    bindEvents();
    renderLayersPanel();
    renderLegend();
    renderDashboard();
    updateNetworkLabel();
    const themeBtn = byId("themeToggle");
    if (themeBtn) {
      themeBtn.textContent = ThemeModule.getCurrentTheme() === "dark" ? "Sombre" : "Clair";
    }
    addActivity("Interface initialisee");
  }

  window.UIModule = {
    initUI,
    renderLegend,
    onAnalysisResult,
    renderDashboard,
    executeAction: handleMenuAction
  };
})();
