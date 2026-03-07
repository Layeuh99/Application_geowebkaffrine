(function () {
  "use strict";

  let map = null;
  let measureControl = null;
  let routeMode = false;
  let routePoints = [];
  let routeLayer = null;
  let analysisMode = false;
  let analysisConfig = null;
  let analysisMarker = null;
  let analysisCircle = null;
  let analysisLayer = null;
  let quickMarkerLayer = null;

  const fullExtent = [[13.721171, -16.131927], [14.821031, -14.310368]];
  const layerState = {};
  const basemaps = {};
  let activeBasemap = "osm";

  function cssVar(name, fallback) {
    const val = getComputedStyle(document.body).getPropertyValue(name).trim();
    return val || fallback;
  }

  function qgis2webStyles() {
    return {
      region: {
        opacity: 1,
        color: "rgba(35,35,35,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 5.0,
        fillOpacity: 0,
        interactive: true
      },
      routes: {
        opacity: 1,
        color: "rgba(255,0,0,1.0)",
        dashArray: "",
        lineCap: "round",
        lineJoin: "round",
        weight: 1.0,
        fillOpacity: 0,
        interactive: true
      },
      localites: {
        radius: 3.2,
        opacity: 1,
        color: "rgba(247,247,247,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 2.0,
        fill: true,
        fillOpacity: 1,
        fillColor: "rgba(83,83,83,1.0)",
        interactive: true
      },
      ecoles: {
        radius: 4.77,
        opacity: 1,
        color: "rgba(184,8,8,1.0)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 1,
        fillColor: "rgba(184,8,8,1.0)",
        interactive: true
      }
    };
  }

  function styleDepartement(feature) {
    const colors = {
      BIRKELANE: "rgba(126,222,43,1.0)",
      KAFFRINE: "rgba(214,97,39,1.0)",
      KOUNGHEUL: "rgba(211,108,199,1.0)",
      "MALEM HODDAR": "rgba(101,202,175,1.0)"
    };

    return {
      opacity: 1,
      color: "rgba(35,35,35,1.0)",
      dashArray: "",
      lineCap: "butt",
      lineJoin: "miter",
      weight: 1.0,
      fill: true,
      fillOpacity: 1,
      fillColor: colors[feature?.properties?.dept] || "rgba(200,200,200,1.0)",
      interactive: true
    };
  }

  function styleArrondissement(feature) {
    const colors = {
      "DAROU MINAME II": "rgba(212,225,126,1.0)",
      GNIBY: "rgba(168,29,214,1.0)",
      "IDA MOURIDE": "rgba(132,116,220,1.0)",
      KATAKEL: "rgba(200,69,76,1.0)",
      "KEUR MBOUCKI": "rgba(202,130,41,1.0)",
      "LOUR ESCALE": "rgba(61,142,235,1.0)",
      MABO: "rgba(234,59,173,1.0)",
      "MISSIRAH WADENE": "rgba(68,214,204,1.0)",
      SAGNA: "rgba(87,201,45,1.0)"
    };

    return {
      opacity: 1,
      color: "rgba(35,35,35,1.0)",
      dashArray: "",
      lineCap: "butt",
      lineJoin: "miter",
      weight: 1.0,
      fill: true,
      fillOpacity: 1,
      fillColor: colors[feature?.properties?.arr] || "rgba(200,200,200,1.0)",
      interactive: true
    };
  }

  function layerDefinitions() {
    const styles = qgis2webStyles();
    return [
      { key: "Region", label: "Région", group: "Limites administratives", dataVar: "json_Region_3", type: "polygon", style: styles.region, legend: "#232323" },
      { key: "Departement", label: "Département", group: "Limites administratives", dataVar: "json_Departement_4", type: "polygon", style: styleDepartement, legend: "#d66127" },
      {
        key: "Arrondissement",
        label: "Arrondissement",
        group: "Limites administratives",
        dataVar: "json_Arrondissement_5",
        type: "polygon",
        style: styleArrondissement,
        legend: "#3d8eeb",
        labels: {
          default: false,
          className: "arrondissement-label",
          direction: "center",
          offset: [0, 0]
        }
      },
      {
        key: "Localites",
        label: "Localités",
        group: "Occupation du territoire",
        dataVar: "json_Localites_7",
        type: "point",
        pointStyle: styles.localites,
        legend: "#535353",
        labels: {
          default: false,
          className: "localite-label",
          direction: "top",
          offset: [0, -10]
        }
      },
      { key: "Ecoles", label: "Écoles", group: "Services essentiels", dataVar: "json_Ecoles_8", type: "point", pointStyle: styles.ecoles, legend: "#b80808" },
      { key: "Routes", label: "Routes", group: "Réseaux et mobilité", dataVar: "json_Routes_6", type: "line", style: styles.routes, legend: "#ff0000" }
    ];
  }

  function toTitleCaseKey(key) {
    if (!key) return "";
    const cleaned = String(key).replace(/_/g, " ").trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  function featureLabel(feature, fallback) {
    if (!feature || !feature.properties) return fallback || "Entité";
    const p = feature.properties;
    return p.NOM || p.Nom || p.nom || p.NAME || p.Name || p.arr || p.dept || p.Region || p["Région"] || p["RÃ©gion"] || p.Code || fallback || "Entité";
  }

  function pickProp(properties, keys) {
    if (!properties) return "";
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const value = properties[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") return value;
    }
    return "";
  }

  function popupHtml(feature, layerKey) {
    if (!feature || !feature.properties) {
      return "<strong>" + (layerKey || "Entité") + "</strong><br>Aucune donnée attributaire.";
    }

    const p = feature.properties;
    const rows = [];
    const addRow = (label, value) => {
      if (value === undefined || value === null || String(value).trim() === "") return;
      rows.push("<tr><td colspan=\"2\"><strong>" + label + "</strong><br />" + String(value) + "</td></tr>");
    };

    switch (layerKey) {
      case "Region":
        addRow("Code", pickProp(p, ["Code", "code"]));
        addRow("Région", pickProp(p, ["Region", "Région", "RÃ©gion"]));
        break;
      case "Departement":
        addRow("Région", pickProp(p, ["reg", "Reg", "REG"]));
        addRow("Département", pickProp(p, ["dept", "Dept", "DEPT"]));
        break;
      case "Arrondissement":
        addRow("Région", pickProp(p, ["reg", "Reg", "REG"]));
        addRow("Département", pickProp(p, ["dept", "Dept", "DEPT"]));
        addRow("CAV", pickProp(p, ["cav", "CAV"]));
        addRow("Arrondissement", pickProp(p, ["arr", "ARR", "Arrondissement"]));
        break;
      case "Routes":
        addRow("Route ID", pickProp(p, ["ROUTESA3_", "ROUTE_ID", "route_id"]));
        addRow("Route Info", pickProp(p, ["ROUTESA3_I", "ROUTE_INFO", "route_info"]));
        break;
      case "Localites":
        addRow("Entité", pickProp(p, ["ENTITY", "Entite", "entite"]));
        addRow("Nom", pickProp(p, ["NOM", "Nom", "nom"]));
        addRow("Numéro village", pickProp(p, ["NUM_VILLAG", "NUM_VILLAGE", "num_villag"]));
        break;
      case "Ecoles":
        addRow("Nom", pickProp(p, ["Nom", "NOM", "nom"]));
        break;
      default:
        break;
    }

    const header = "<strong>" + (featureLabel(feature, layerKey) || layerKey || "Entité") + "</strong>";
    if (!rows.length) return header + "<br>Aucune donnée attributaire.";
    return header + "<hr><table>" + rows.join("") + "</table>";
  }

  function labelText(feature, def) {
    if (!feature || !feature.properties || !def || !def.labels) return "";
    if (def.key === "Localites") return pickProp(feature.properties, ["NOM", "Nom", "nom"]);
    if (def.key === "Arrondissement") return pickProp(feature.properties, ["arr", "ARR", "Arrondissement"]);
    return "";
  }

  function applyLabelsForLayer(key, enabled) {
    const state = layerState[key];
    if (!state || !state.layer || !state.def || !state.def.labels) return;
    state.labelsEnabled = enabled;
    state.layer.eachLayer((child) => {
      if (!child || !child.bindTooltip) return;
      if (!enabled) {
        if (child.getTooltip && child.getTooltip()) child.unbindTooltip();
        return;
      }
      const text = labelText(child.feature, state.def);
      if (!text) return;
      child.bindTooltip(text, {
        permanent: true,
        direction: state.def.labels.direction,
        className: state.def.labels.className,
        offset: state.def.labels.offset
      });
    });
  }

  function highlightFeature(event) {
    const layer = event.target;
    const geomType = layer?.feature?.geometry?.type;
    if (geomType === "LineString" || geomType === "MultiLineString") {
      layer.setStyle({ color: "rgba(255,255,0,1.00)", weight: 3 });
    } else {
      layer.setStyle({ fillColor: "rgba(255,255,0,1.00)", fillOpacity: 0.7 });
    }
    layer.openPopup();
  }

  function bindFeatureInteractivity(feature, layer, def) {
    layer.on({
      mouseout: (event) => {
        for (const key in event.target._eventParents) {
          if (typeof event.target._eventParents[key].resetStyle === "function") {
            event.target._eventParents[key].resetStyle(event.target);
          }
        }
        if (typeof layer.closePopup === "function") layer.closePopup();
      },
      mouseover: highlightFeature
    });

    const content = popupHtml(feature, def.key);
    layer.bindPopup(content, { maxHeight: 400 });

  }

  function locateUser() {
    ensureMap();
    map.once("locationfound", (event) => {
      if (!quickMarkerLayer) quickMarkerLayer = L.layerGroup().addTo(map);
      const marker = L.marker(event.latlng).addTo(quickMarkerLayer);
      marker.bindPopup("Position actuelle").openPopup();
      setStatus("Position détectée");
    });
    map.once("locationerror", () => {
      setStatus("Localisation indisponible");
    });
    map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
  }

  function toggleFullscreen() {
    ensureMap();
    const container = map.getContainer();
    const inFullscreen = Boolean(document.fullscreenElement);
    if (!inFullscreen && container.requestFullscreen) {
      container.requestFullscreen().then(() => setStatus("Mode plein écran activé")).catch(() => setStatus("Plein écran indisponible"));
      return;
    }
    if (inFullscreen && document.exitFullscreen) {
      document.exitFullscreen().then(() => setStatus("Mode plein écran quitté")).catch(() => setStatus("Sortie plein écran impossible"));
    }
  }

  function addQuickMarker() {
    ensureMap();
    if (!quickMarkerLayer) quickMarkerLayer = L.layerGroup().addTo(map);
    const center = map.getCenter();
    const marker = L.marker(center).addTo(quickMarkerLayer);
    marker.bindPopup("Marqueur rapide").openPopup();
    setStatus("Marqueur ajouté");
  }

  function executeSigToolAction(action) {
    switch (action) {
      case "home":
        resetHome();
        break;
      case "locate":
        locateUser();
        break;
      case "measure":
        toggleMeasure();
        break;
      case "fullscreen":
        toggleFullscreen();
        break;
      case "marker":
        addQuickMarker();
        break;
      case "export":
        downloadActiveData();
        break;
      case "reset":
        window.location.reload();
        break;
      default:
        break;
    }
  }

  function addSigToolsControl() {
    if (!map) return;
    const toolsControl = L.control({ position: "topleft" });

    toolsControl.onAdd = function () {
      const container = L.DomUtil.create("div", "leaflet-bar sig-tools");
      container.innerHTML =
        '<a href="#" class="sig-main-btn" title="Outils SIG" aria-label="Menu Outils SIG">🧰</a>' +
        '<div class="sig-dropdown">' +
        '<a href="#" data-action="home">🏠 Home</a>' +
        '<a href="#" data-action="locate">📍 GPS</a>' +
        '<a href="#" data-action="measure">📏 Mesure</a>' +
        '<a href="#" data-action="fullscreen">⛶ Plein écran</a>' +
        '<a href="#" data-action="marker">📌 Marqueur</a>' +
        '<a href="#" data-action="export">🖨 Export</a>' +
        '<a href="#" data-action="reset">🔄 Reset</a>' +
        "</div>";

      const mainBtn = container.querySelector(".sig-main-btn");
      const dropdown = container.querySelector(".sig-dropdown");
      const actionLinks = container.querySelectorAll(".sig-dropdown a");

      function closeDropdown() {
        if (dropdown) dropdown.style.display = "none";
      }

      function positionDropdown() {
        if (!dropdown || !container) return;
        dropdown.classList.remove("sig-dropdown-left");
        const containerRect = container.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const estimatedWidth = Math.max(dropdown.offsetWidth || 0, 180);
        const defaultLeft = containerRect.left + 48 + estimatedWidth;
        if (defaultLeft > viewportWidth - 8) {
          dropdown.classList.add("sig-dropdown-left");
        }
      }

      function toggleDropdown() {
        if (!dropdown) return;
        const opening = dropdown.style.display !== "flex";
        if (opening) {
          dropdown.style.display = "flex";
          positionDropdown();
          return;
        }
        dropdown.style.display = "none";
      }

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      if (mainBtn) {
        L.DomEvent.on(mainBtn, "click", (event) => {
          L.DomEvent.preventDefault(event);
          toggleDropdown();
        });
      }

      actionLinks.forEach((link) => {
        L.DomEvent.on(link, "click", (event) => {
          L.DomEvent.preventDefault(event);
          const action = link.getAttribute("data-action");
          executeSigToolAction(action);
          closeDropdown();
        });
      });

      document.addEventListener("click", (event) => {
        if (!container.contains(event.target)) closeDropdown();
      });

      window.addEventListener("resize", () => {
        if (dropdown && dropdown.style.display === "flex") positionDropdown();
      });

      return container;
    };

    toolsControl.addTo(map);
    map.getContainer().classList.add("sig-tools-enabled");
  }

  function ensureMap() {
    if (map) return map;

    map = L.map("map", {
      zoomControl: false,
      attributionControl: true
    });
    addSigToolsControl();

    basemaps.osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    });

    const esriImagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri"
    });
    const esriLabels = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Labels &copy; Esri"
    });

    basemaps.hybrid = L.layerGroup([esriImagery, esriLabels]);
    basemaps.dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 20,
      attribution: "&copy; OpenStreetMap &copy; CARTO"
    });
    // Compatibilite ancienne action UI.
    basemaps.toner = basemaps.dark;

    basemaps.osm.addTo(map);
    map.fitBounds(fullExtent);

    map.on("click", onMapClick);
    map.on("zoomend moveend", updateScaleText);
    window.addEventListener("resize", () => {
      if (map) map.invalidateSize();
    });
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 150);

    return map;
  }

  function switchBasemap(type) {
    ensureMap();
    if (!basemaps[type] || type === activeBasemap) return;
    map.removeLayer(basemaps[activeBasemap]);
    basemaps[type].addTo(map);
    activeBasemap = type;
    if (type === "hybrid") setStatus("Fond hybride actif");
    else if (type === "dark" || type === "toner") setStatus("Fond sombre actif");
    else setStatus("Fond OSM actif");
  }

  function toLayer(def) {
    const data = window[def.dataVar];
    if (!data) return null;

    if (def.type === "point") {
      return L.geoJSON(data, {
        pointToLayer: (_, latlng) => L.circleMarker(latlng, def.pointStyle),
        onEachFeature: (feature, layer) => bindFeatureInteractivity(feature, layer, def)
      });
    }
    return L.geoJSON(data, {
      style: def.style,
      onEachFeature: (feature, layer) => bindFeatureInteractivity(feature, layer, def)
    });
  }

  function initLayers() {
    ensureMap();
    const defs = layerDefinitions();

    defs.forEach((def) => {
      const layer = toLayer(def);
      layerState[def.key] = {
        def: def,
        layer: layer,
        active: Boolean(layer),
        opacity: 1,
        labelsEnabled: def.labels ? Boolean(def.labels.default) : false
      };
      if (layer) layer.addTo(map);
    });

    defs.forEach((def) => {
      if (!def.labels) return;
      applyLabelsForLayer(def.key, Boolean(def.labels.default));
    });
    updateScaleText();
  }

  function refreshThemeStyles() {
    const defs = layerDefinitions();
    defs.forEach((def) => {
      const state = layerState[def.key];
      if (!state || !state.layer) return;
      state.def.legend = def.legend;
      state.layer.eachLayer((child) => {
        if (!child.setStyle) return;
        if (def.type === "point") {
          child.setStyle(def.pointStyle);
        } else if (typeof def.style === "function") {
          child.setStyle(def.style(child.feature));
        } else {
          child.setStyle(def.style);
        }
      });
      setLayerOpacity(def.key, state.opacity);
    });

    if (routeLayer) routeLayer.setStyle({ color: cssVar("--ok", "#0f9f64"), weight: 4 });
    if (analysisCircle) analysisCircle.setStyle({ color: cssVar("--primary", "#1e5eff"), fillColor: cssVar("--primary", "#1e5eff") });
    if (analysisMarker) analysisMarker.setStyle({ color: cssVar("--primary", "#1e5eff"), fillColor: cssVar("--primary", "#1e5eff") });
    if (analysisLayer) analysisLayer.setStyle({ color: cssVar("--primary-strong", "#1c48ba"), fillColor: cssVar("--primary", "#1e5eff") });
  }

  function getLayerState() {
    return layerState;
  }

  function getBasemapState() {
    const label = activeBasemap === "hybrid"
      ? "Fond hybride"
      : ((activeBasemap === "dark" || activeBasemap === "toner") ? "Fond sombre" : "Fond OSM");
    return {
      active: activeBasemap,
      label: label,
      items: [
        { key: "osm", label: "Fond OSM" },
        { key: "hybrid", label: "Fond hybride" },
        { key: "dark", label: "Fond sombre" }
      ]
    };
  }

  function setLayerVisibility(key, visible) {
    const state = layerState[key];
    if (!state || !state.layer) return;
    state.active = visible;
    if (visible) state.layer.addTo(map);
    else map.removeLayer(state.layer);
  }

  function setLayerOpacity(key, opacity) {
    const state = layerState[key];
    if (!state || !state.layer) return;
    state.opacity = opacity;
    state.layer.eachLayer((child) => {
      if (!child.setStyle) return;
      if (state.def.type === "line") {
        child.setStyle({ opacity: opacity });
      } else if (state.def.type === "point") {
        child.setStyle({ opacity: opacity, fillOpacity: Math.max(0.15, opacity * 0.9) });
      } else {
        child.setStyle({ opacity: opacity, fillOpacity: Math.max(0.12, opacity * 0.6) });
      }
    });
  }

  function setLayerLabels(key, enabled) {
    applyLabelsForLayer(key, enabled);
  }

  function resetHome() {
    ensureMap().fitBounds(fullExtent);
    setStatus("Vue complète chargée");
  }

  function zoomIn() { ensureMap().zoomIn(); }
  function zoomOut() { ensureMap().zoomOut(); }

  function toggleMeasure() {
    ensureMap();
    if (!L.Control || !L.Control.Measure) {
      setStatus("Module mesure indisponible");
      return;
    }
    if (!measureControl) {
      measureControl = new L.Control.Measure({
        primaryLengthUnit: "meters",
        secondaryLengthUnit: "kilometers",
        primaryAreaUnit: "sqmeters",
        secondaryAreaUnit: "hectares"
      });
      map.addControl(measureControl);
    }

    // Si une mesure est en cours, un nouvel appel arrete proprement la session.
    if (measureControl._locked && typeof measureControl._finishMeasure === "function") {
      measureControl._finishMeasure();
      setStatus("Mesure arrêtée");
      return;
    }

    // Methode robuste: API interne du plugin si disponible.
    if (typeof measureControl._expand === "function") measureControl._expand();
    if (typeof measureControl._startMeasure === "function") {
      measureControl._startMeasure();
      setStatus("Outil de mesure actif");
      return;
    }

    // Fallback DOM pour compatibilite versions plugin.
    const scope = measureControl._container || document;
    const toggle =
      scope.querySelector(".leaflet-control-measure-toggle") ||
      scope.querySelector(".js-toggle");
    if (toggle) {
      toggle.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    }
    const start = scope.querySelector(".js-start");
    if (start) {
      start.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    }

    setStatus("Outil de mesure actif");
  }

  function startRouting() {
    routeMode = true;
    routePoints = [];
    setStatus("Itinéraire: sélectionnez 2 points sur la carte");
  }

  function clearRouting() {
    routeMode = false;
    routePoints = [];
    if (routeLayer) {
      map.removeLayer(routeLayer);
      routeLayer = null;
    }
    setStatus("Itinéraire réinitialisé");
  }

  function startAdvancedAnalysis(config) {
    analysisMode = true;
    analysisConfig = config;
    setStatus("Analyse avancée: cliquez sur un point de la carte");
  }

  function clearAnalysis() {
    analysisMode = false;
    analysisConfig = null;
    if (analysisMarker) map.removeLayer(analysisMarker);
    if (analysisCircle) map.removeLayer(analysisCircle);
    if (analysisLayer) map.removeLayer(analysisLayer);
    analysisMarker = null;
    analysisCircle = null;
    analysisLayer = null;
    setStatus("Analyse nettoyée");
  }

  function onMapClick(event) {
    if (routeMode) {
      handleRoutingClick(event);
      return;
    }
    if (analysisMode) {
      runAdvancedAnalysis(event.latlng);
    }
  }

  function handleRoutingClick(event) {
    routePoints.push(event.latlng);
    if (routePoints.length < 2) {
      setStatus("Itinéraire: sélectionnez le point d'arrivée");
      return;
    }
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.polyline(routePoints, {
      color: cssVar("--ok", "#0f9f64"),
      weight: 4
    }).addTo(map);

    const distanceMeters = routePoints[0].distanceTo(routePoints[1]);
    setStatus("Distance : " + distanceMeters.toFixed(0) + " m");
    routeMode = false;
    routePoints = [];
  }

  function getCenter(layer) {
    if (layer.getLatLng) return layer.getLatLng();
    if (layer.getBounds) return layer.getBounds().getCenter();
    return null;
  }

  function runAdvancedAnalysis(latlng) {
    clearAnalysis();
    analysisMode = false;
    if (!analysisConfig || !analysisConfig.layerKey) return;

    const targetState = layerState[analysisConfig.layerKey];
    if (!targetState || !targetState.layer) {
      setStatus("Couche analyse indisponible");
      if (window.UIModule) window.UIModule.onAnalysisResult("Couche indisponible");
      return;
    }

    const radius = Number(analysisConfig.radius || 5000);
    const limit = Number(analysisConfig.limit || 25);
    const candidates = [];

    analysisMarker = L.circleMarker(latlng, {
      radius: 7,
      color: cssVar("--primary", "#1e5eff"),
      fillColor: cssVar("--primary", "#1e5eff"),
      fillOpacity: 0.8
    }).addTo(map);

    analysisCircle = L.circle(latlng, {
      radius: radius,
      color: cssVar("--primary", "#1e5eff"),
      fillColor: cssVar("--primary", "#1e5eff"),
      fillOpacity: 0.08,
      weight: 2
    }).addTo(map);

    targetState.layer.eachLayer((child) => {
      const center = getCenter(child);
      if (!center) return;
      const dist = latlng.distanceTo(center);
      if (dist <= radius) {
        candidates.push({
          center: center,
          distance: dist,
          feature: child.feature || null
        });
      }
    });

    candidates.sort((a, b) => a.distance - b.distance);
    const selected = candidates.slice(0, limit);

    const points = selected.map((it) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [it.center.lng, it.center.lat] },
      properties: {
        distance_m: Math.round(it.distance),
        source_name: featureName(it.feature)
      }
    }));

    analysisLayer = L.geoJSON({ type: "FeatureCollection", features: points }, {
      pointToLayer: (_, point) => L.circleMarker(point, {
        radius: 6,
        color: cssVar("--primary-strong", "#1c48ba"),
        fillColor: cssVar("--primary", "#1e5eff"),
        fillOpacity: 0.9
      })
    }).addTo(map);

    const summary = selected.length + " résultat(s) dans " + radius + " m";
    setStatus(summary);
    if (window.UIModule && window.UIModule.onAnalysisResult) {
      window.UIModule.onAnalysisResult(summary, selected.slice(0, 5));
    }
  }

  function featureName(feature) {
    if (!feature || !feature.properties) return "Entité";
    const p = feature.properties;
    return p.NOM || p.Nom || p.nom || p.arr || p.dept || p.Region || p.Code || "Entité";
  }

  function updateScaleText() {
    if (!map) return;
    const scaleEl = document.getElementById("scaleText");
    if (!scaleEl) return;
    scaleEl.textContent = "Niveau de zoom : " + map.getZoom();
  }

  function setStatus(text) {
    const statusEl = document.getElementById("statusText");
    if (statusEl) statusEl.textContent = text;
  }

  function invalidateSize() {
    if (map) map.invalidateSize();
  }

  function downloadActiveData() {
    const features = [];
    Object.keys(layerState).forEach((key) => {
      const state = layerState[key];
      if (!state.active || !state.layer) return;
      state.layer.eachLayer((child) => {
        if (child.feature) features.push(child.feature);
      });
    });
    const payload = { type: "FeatureCollection", features: features };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "geoweb-kaffrine-export.geojson";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Export GeoJSON terminé");
  }

  function dashboardStats() {
    const stats = { activeLayers: 0, activeFeatures: 0, zoom: map ? map.getZoom() : 0 };
    Object.keys(layerState).forEach((key) => {
      const s = layerState[key];
      if (!s.active || !s.layer) return;
      stats.activeLayers += 1;
      let count = 0;
      s.layer.eachLayer(() => { count += 1; });
      stats.activeFeatures += count;
    });
    return stats;
  }

  function getViewState() {
    if (!map) return null;
    const center = map.getCenter();
    const bounds = map.getBounds();
    return {
      zoom: map.getZoom(),
      center: { lat: center.lat, lng: center.lng },
      bounds: {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast()
      }
    };
  }

  window.MapModule = {
    initMap: ensureMap,
    initLayers,
    refreshThemeStyles,
    getLayerState,
    getBasemapState,
    setLayerVisibility,
    setLayerOpacity,
    setLayerLabels,
    switchBasemap,
    resetHome,
    zoomIn,
    zoomOut,
    toggleMeasure,
    startRouting,
    clearRouting,
    startAdvancedAnalysis,
    clearAnalysis,
    downloadActiveData,
    dashboardStats,
    getViewState,
    locateUser,
    toggleFullscreen,
    addQuickMarker,
    invalidateSize,
    setStatus
  };
})();



