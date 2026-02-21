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

  const fullExtent = [[13.721171, -16.131927], [14.821031, -14.310368]];
  const layerState = {};
  const basemaps = {};
  let activeBasemap = "osm";

  function cssVar(name, fallback) {
    const val = getComputedStyle(document.body).getPropertyValue(name).trim();
    return val || fallback;
  }

  function colorStyle(color, fillColor, weight) {
    return {
      color: color,
      fillColor: fillColor || color,
      fillOpacity: 0.55,
      opacity: 1,
      weight: weight || 1.5
    };
  }

  function stylePalette() {
    return {
      region: cssVar("--layer-region", "#93c5fd"),
      departement: cssVar("--layer-departement", "#86efac"),
      arrondissement: cssVar("--layer-arrondissement", "#fdba74"),
      routes: cssVar("--layer-routes", "#dc2626"),
      localites: cssVar("--layer-localites", "#60a5fa"),
      ecoles: cssVar("--layer-ecoles", "#f87171"),
      outline: cssVar("--text", "#1d2840"),
      analysis: cssVar("--primary", "#1e5eff"),
      route: cssVar("--ok", "#0f9f64")
    };
  }

  function layerDefinitions() {
    const c = stylePalette();
    return [
      { key: "Region", label: "Région", dataVar: "json_Region_3", type: "polygon", style: colorStyle(c.outline, c.region, 2), legend: c.region },
      { key: "Departement", label: "Département", dataVar: "json_Departement_4", type: "polygon", style: colorStyle(c.outline, c.departement, 1.5), legend: c.departement },
      { key: "Arrondissement", label: "Arrondissement", dataVar: "json_Arrondissement_5", type: "polygon", style: colorStyle(c.outline, c.arrondissement, 1), legend: c.arrondissement },
      { key: "Routes", label: "Routes", dataVar: "json_Routes_6", type: "line", style: { color: c.routes, opacity: 0.95, weight: 2 }, legend: c.routes },
      { key: "Localites", label: "Localités", dataVar: "json_Localites_7", type: "point", style: { radius: 4, color: c.outline, fillColor: c.localites, fillOpacity: 0.85, opacity: 1, weight: 1 }, legend: c.localites },
      { key: "Ecoles", label: "Écoles", dataVar: "json_Ecoles_8", type: "point", style: { radius: 5, color: c.outline, fillColor: c.ecoles, fillOpacity: 0.9, opacity: 1, weight: 1 }, legend: c.ecoles }
    ];
  }

  function ensureMap() {
    if (map) return map;

    map = L.map("map", {
      zoomControl: true,
      attributionControl: true
    });

    basemaps.osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    });

    basemaps.toner = L.tileLayer("https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution: "&copy; Stadia Maps, OpenStreetMap"
    });

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
    setStatus(type === "toner" ? "Fond contraste actif" : "Fond OSM actif");
  }

  function toLayer(def) {
    const data = window[def.dataVar];
    if (!data) return null;

    if (def.type === "point") {
      return L.geoJSON(data, {
        pointToLayer: (_, latlng) => L.circleMarker(latlng, def.style)
      });
    }
    return L.geoJSON(data, { style: def.style });
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
        opacity: 1
      };
      if (layer) layer.addTo(map);
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
        child.setStyle(def.style);
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
    const toggle = document.querySelector(".leaflet-control-measure-toggle");
    if (toggle) toggle.click();
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

  window.MapModule = {
    initMap: ensureMap,
    initLayers,
    refreshThemeStyles,
    getLayerState,
    setLayerVisibility,
    setLayerOpacity,
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
    invalidateSize,
    setStatus
  };
})();



