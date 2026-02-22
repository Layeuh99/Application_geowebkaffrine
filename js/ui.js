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
    const modalOpen = document.querySelector(".modal.open");
    return Boolean(modalOpen);
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

  function buildLayerCategories(layers) {
    const preferredOrder = [
      "Limites administratives",
      "Réseaux et mobilité",
      "Occupation du territoire",
      "Services essentiels",
      "Autres couches"
    ];

    const groups = {};
    Object.keys(layers).forEach((key) => {
      const item = layers[key];
      const groupName = item.def.group || "Autres couches";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push({ key: key, item: item });
    });

    const orderedNames = Object.keys(groups).sort((a, b) => {
      const ai = preferredOrder.indexOf(a);
      const bi = preferredOrder.indexOf(b);
      const av = ai === -1 ? 999 : ai;
      const bv = bi === -1 ? 999 : bi;
      if (av !== bv) return av - bv;
      return a.localeCompare(b, "fr");
    });

    return orderedNames.map((name) => {
      const entries = groups[name].slice().sort((x, y) => x.item.def.label.localeCompare(y.item.def.label, "fr"));
      return { name: name, entries: entries };
    });
  }
  function renderLayersPanel() {
    const container = byId("layersList");
    if (!container) return;
    const layers = MapModule.getLayerState();
    const categories = buildLayerCategories(layers);

    const html = categories.map((category) => {
      const rows = category.entries.map((entry) => {
        const item = entry.item;
        const key = entry.key;
        const checked = item.active ? "checked" : "";
        const opacity = Math.round(item.opacity * 100);
        return (
          '<div class="layer-row">' +
          '<div class="layer-top">' +
          '<label><input type="checkbox" data-layer-toggle="' + key + '" ' + checked + '> ' + item.def.label + '</label>' +
          '<span>' + opacity + '%</span>' +
          '</div>' +
          '<input type="range" min="0" max="100" value="' + opacity + '" data-layer-opacity="' + key + '">' +
          '</div>'
        );
      }).join("");

      return (
        '<div class="layer-group">' +
        '<div class="layer-group-title">' + category.name + ' <span class="layer-group-count">(' + category.entries.length + ')</span></div>' +
        rows +
        '</div>'
      );
    }).join("");

    container.innerHTML = html || "<p>Aucune couche chargée.</p>";
  }

  function renderLegend() {
    const container = byId("legendContent");
    if (!container) return;
    const layers = MapModule.getLayerState();
    const categories = buildLayerCategories(layers);
    const basemap = MapModule.getBasemapState ? MapModule.getBasemapState() : {
      active: "osm",
      items: [
        { key: "osm", label: "Fond OSM" },
        { key: "hybrid", label: "Fond hybride" },
        { key: "dark", label: "Fond sombre" }
      ]
    };

    const basemapRows = basemap.items.map((item) => {
      const active = item.key === basemap.active;
      const chipColor = item.key === "osm" ? "#3b82f6" : (item.key === "hybrid" ? "#0ea5a4" : "#6d28d9");
      const state = active ? "Actif" : "Inactif";
      return (
        '<div class="legend-row' + (active ? "" : " legend-row-muted") + '">' +
        '<span class="legend-chip" style="background:' + chipColor + ';"></span>' +
        '<span>' + item.label + ' (' + state + ')</span>' +
        '</div>'
      );
    });

    const groupedLayerRows = categories.map((category) => {
      const rows = category.entries.map((entry) => {
        const item = entry.item;
        const active = Boolean(item.active);
        const state = active ? "Actif" : "Inactif";
        const color = item.def.legend || "var(--surface-alt)";
        return (
          '<div class="legend-row' + (active ? "" : " legend-row-muted") + '">' +
          '<span class="legend-chip" style="background:' + color + ';"></span>' +
          '<span>' + item.def.label + ' (' + state + ')</span>' +
          '</div>'
        );
      }).join("");

      return '<div class="legend-section-title">' + category.name + '</div>' + rows;
    }).join("");

    container.innerHTML =
      '<div class="legend-section-title">Fonds de carte</div>' +
      basemapRows.join("") +
      '<div class="legend-section-title">Couches</div>' +
      (groupedLayerRows || "<p>Aucune couche chargée.</p>");
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

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function countLayerFeatures(layer) {
    let count = 0;
    if (!layer || !layer.eachLayer) return count;
    layer.eachLayer(() => {
      count += 1;
    });
    return count;
  }

  function buildMetadataPayload() {
    const layers = MapModule.getLayerState();
    const stats = MapModule.dashboardStats();
    const basemap = MapModule.getBasemapState ? MapModule.getBasemapState() : { label: "Fond OSM", active: "osm" };
    const view = MapModule.getViewState ? MapModule.getViewState() : null;
    const now = new Date();

    const layerDetails = Object.keys(layers).map((key) => {
      const layer = layers[key];
      return {
        key: key,
        nom: layer.def.label,
        categorie: layer.def.group || "Autres",
        active: Boolean(layer.active),
        objets: countLayerFeatures(layer.layer),
        opacite: Math.round(Number(layer.opacity || 0) * 100)
      };
    });

    return {
      projet: "GeoWeb Kaffrine",
      projection: "WGS84 (EPSG:4326)",
      date_generation: now.toISOString(),
      theme: document.body.classList.contains("dark-theme") ? "Sombre" : "Clair",
      basemap: basemap.label,
      basemap_key: basemap.active,
      vue: view,
      resume: {
        couches_total: layerDetails.length,
        couches_actives: stats.activeLayers,
        entites_visibles: stats.activeFeatures,
        zoom: stats.zoom
      },
      couches: layerDetails
    };
  }

  function metadataBoundsText(view) {
    if (!view || !view.bounds) return "Non disponible";
    const b = view.bounds;
    return (
      "S " + b.south.toFixed(5) +
      " | O " + b.west.toFixed(5) +
      " | N " + b.north.toFixed(5) +
      " | E " + b.east.toFixed(5)
    );
  }

  function renderMetadata() {
    const payload = buildMetadataPayload();
    const generatedAt = byId("metadataGeneratedAt");
    const theme = byId("metadataTheme");
    const basemap = byId("metadataBasemap");
    const viewport = byId("metadataViewport");
    const layersCount = byId("metadataLayersCount");
    const featuresCount = byId("metadataFeaturesCount");
    const extent = byId("metadataExtent");
    const table = byId("metadataLayersTable");

    if (generatedAt) {
      const d = new Date(payload.date_generation);
      generatedAt.textContent = d.toLocaleString("fr-FR");
    }
    if (theme) theme.textContent = payload.theme;
    if (basemap) basemap.textContent = payload.basemap;

    if (viewport) {
      if (payload.vue && payload.vue.center) {
        viewport.textContent = "Zoom " + payload.resume.zoom + " | " +
          payload.vue.center.lat.toFixed(5) + ", " + payload.vue.center.lng.toFixed(5);
      } else {
        viewport.textContent = "Non disponible";
      }
    }

    if (layersCount) {
      layersCount.textContent = payload.resume.couches_actives + " / " + payload.resume.couches_total;
    }
    if (featuresCount) featuresCount.textContent = String(payload.resume.entites_visibles);
    if (extent) extent.textContent = metadataBoundsText(payload.vue);

    if (table) {
      const sortedLayers = payload.couches.slice().sort((a, b) => {
        if (a.active === b.active) return a.nom.localeCompare(b.nom, "fr");
        return a.active ? -1 : 1;
      });

      if (!sortedLayers.length) {
        table.innerHTML = '<tr><td colspan="5">Aucune couche disponible.</td></tr>';
        return;
      }

      table.innerHTML = sortedLayers.map((layer) => {
        const statusClass = layer.active ? "metadata-status metadata-status-on" : "metadata-status metadata-status-off";
        const statusText = layer.active ? "Actif" : "Inactif";
        return (
          "<tr>" +
          "<td>" + escapeHtml(layer.nom) + "</td>" +
          "<td>" + escapeHtml(layer.categorie) + "</td>" +
          '<td><span class="' + statusClass + '">' + statusText + "</span></td>" +
          "<td>" + layer.objets + "</td>" +
          "<td>" + layer.opacite + "%</td>" +
          "</tr>"
        );
      }).join("");
    }
  }

  function copyMetadataSummary() {
    const payload = buildMetadataPayload();
    const lines = [
      "Projet: " + payload.projet,
      "Projection: " + payload.projection,
      "Date: " + new Date(payload.date_generation).toLocaleString("fr-FR"),
      "Theme: " + payload.theme,
      "Fond actif: " + payload.basemap,
      "Couches actives: " + payload.resume.couches_actives + "/" + payload.resume.couches_total,
      "Entites visibles: " + payload.resume.entites_visibles
    ];
    const summary = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(() => {
        toast("Résumé métadonnées copié", "ok");
      }).catch(() => {
        toast("Copie impossible", "warn");
      });
      return;
    }
    toast("Copie non supportée par ce navigateur", "warn");
  }

  function downloadMetadataJson() {
    const payload = buildMetadataPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "geoweb-kaffrine-metadata.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("Fichier métadonnées téléchargé", "ok");
  }

  function updateNetworkLabel() {
    const net = byId("networkText");
    if (!net) return;
    net.textContent = navigator.onLine ? "En ligne" : "Hors ligne";
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
      addActivity((toggle.checked ? "Activation " : "Désactivation ") + key);
      return;
    }
    const opacity = event.target.closest("[data-layer-opacity]");
    if (opacity) {
      const key = opacity.getAttribute("data-layer-opacity");
      const value = Number(opacity.value) / 100;
      MapModule.setLayerOpacity(key, value);
      renderLayersPanel();
      addActivity("Opacité " + key + " = " + Math.round(value * 100) + "%");
    }
  }

  function handleMenuAction(actionName, originEl) {
    switch (actionName) {
      case "home":
        MapModule.resetHome();
        addActivity("Vue complète");
        break;
      case "dashboard":
        renderDashboard();
        openDashboard();
        addActivity("Ouverture centre de commande");
        break;
      case "layers":
        renderLayersPanel();
        openPanel("layersPanel");
        addActivity("Ouverture panneau couches");
        break;
      case "legend":
        renderLegend();
        openPanel("legendPanel");
        addActivity("Ouverture légende");
        break;
      case "analysis":
        MapModule.setStatus("Analyse spatiale prête");
        toast("Analyse spatiale prête", "ok");
        addActivity("Préparation analyse spatiale");
        break;
      case "analysis-modal":
        openModal("analysisModal");
        addActivity("Ouverture analyse avancée");
        break;
      case "routing":
        MapModule.startRouting();
        toast("Cliquez sur 2 points pour tracer l'itinéraire", "ok");
        addActivity("Mode itinéraire");
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
        renderMetadata();
        openModal("metadataModal");
        addActivity("Ouverture métadonnées");
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
        MapModule.switchBasemap("dark");
        addActivity("Fond sombre");
        break;
      case "basemap-hybrid":
        MapModule.switchBasemap("hybrid");
        addActivity("Fond hybride");
        break;
      case "basemap-dark":
        MapModule.switchBasemap("dark");
        addActivity("Fond sombre");
        break;
      case "zoom-in":
        MapModule.zoomIn();
        break;
      case "zoom-out":
        MapModule.zoomOut();
        break;
      case "full-extent":
        window.location.reload();
        break;
      default:
        break;
    }
    if (!originEl) {
      closeMobileMenu();
      closeFab();
      closeAllDropdowns();
    } else {
      const fromMobileMenu = Boolean(originEl.closest("#mobileMenu"));
      const fromFabMenu = Boolean(originEl.closest("#fabMenu"));
      const fromDropdown = Boolean(originEl.closest(".dropdown-menu"));
      // Menu mobile: reste ouvert pendant les interactions internes.
      if (fromFabMenu) closeFab();
      if (!fromDropdown) closeAllDropdowns();
    }
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
    addActivity("Analyse avancée en attente d'un point sur la carte");
  }

  function clearAnalysis() {
    MapModule.clearAnalysis();
    const result = byId("analysisResult");
    if (result) result.textContent = "Aucun résultat.";
    addActivity("Nettoyage analyse");
  }

  function bindEvents() {
    const mobileMenu = byId("mobileMenu");
    const toggleBtn = byId("mobileMenuToggle");
    const metadataModal = byId("metadataModal");

    if (mobileMenu) {
      mobileMenu.addEventListener("click", (event) => {
        event.stopPropagation();
        const actionButton = event.target.closest(".menu-action");
        if (actionButton) {
          handleMenuAction(actionButton.getAttribute("data-action"), actionButton);
        }
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMobileMenu();
      });
    }

    if (metadataModal) {
      metadataModal.addEventListener("click", (event) => {
        const navButton = event.target.closest(".metadata-nav-btn");
        if (!navButton) return;
        const targetId = navButton.getAttribute("data-target");
        if (!targetId) return;
        const section = byId(targetId);
        if (!section) return;
        if (section.tagName === "DETAILS") section.open = true;
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    document.addEventListener("click", (event) => {
      if (state.mobileMenuOpen && mobileMenu) {
        const clickOutsideMenu = !mobileMenu.contains(event.target);
        const clickOnToggle = toggleBtn && toggleBtn.contains(event.target);
        if (clickOutsideMenu && !clickOnToggle) {
          closeMobileMenu();
        }
      }

      const clickInsideUiContainer = event.target.closest(
        "#layersPanel, #legendPanel, #dashboardPanel, #analysisModal .modal-content, #metadataModal .modal-content, #fabMenu"
      );
      const clickOnUiAction = event.target.closest(
        ".menu-action, [data-close-panel], #closeMetadata, #closeAnalysis, #startAnalysis, #clearAnalysis, #metadataCopy, #metadataDownload"
      );
      if (clickInsideUiContainer && !clickOnUiAction) {
        return;
      }

      const dropdownToggle = event.target.closest(".dropdown-toggle");
      if (dropdownToggle) {
        toggleDropdown(dropdownToggle.closest(".dropdown"));
        return;
      }
      if (!event.target.closest(".dropdown")) closeAllDropdowns();

      const actionButton = event.target.closest(".menu-action");
      if (actionButton) {
        handleMenuAction(actionButton.getAttribute("data-action"), actionButton);
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

      if (event.target.id === "installButton") {
        executeInstall();
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
        addActivity("Changement thème");
        return;
      }
      if (event.target.id === "closeMetadata") {
        closeModal("metadataModal");
        return;
      }
      if (event.target.id === "metadataCopy") {
        copyMetadataSummary();
        return;
      }
      if (event.target.id === "metadataDownload") {
        downloadMetadataJson();
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
      addActivity("Installation disponible");
    });

    window.addEventListener("online", () => {
      const net = byId("networkText");
      if (net) net.textContent = "En ligne";
      toast("Connexion rétablie", "ok");
    });

    window.addEventListener("offline", () => {
      const net = byId("networkText");
      if (net) net.textContent = "Hors ligne";
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
          ? (item.feature.properties.NOM || item.feature.properties.arr || item.feature.properties.dept || "Entité")
          : "Entité";
        return n + " - " + Math.round(item.distance) + " m";
      }).join("<br>");
    addActivity(summary);
    toast(summary, "ok");
  }

  function initUI() {
    bindEvents();
    renderLayersPanel();
    renderLegend();
    renderMetadata();
    renderDashboard();
    updateNetworkLabel();
    const themeBtn = byId("themeToggle");
    if (themeBtn) {
      themeBtn.textContent = ThemeModule.getCurrentTheme() === "dark" ? "Sombre" : "Clair";
    }
    addActivity("Interface initialisée");
  }

  window.UIModule = {
    initUI,
    renderLegend,
    onAnalysisResult,
    renderDashboard,
    executeAction: handleMenuAction
  };
})();



