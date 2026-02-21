(function () {
  "use strict";

  let map = null;
  let measureControl = null;
  let routeMode = false;
  let routePoints = [];
  let routeLayer = null;

  const fullExtent = [[13.721171, -16.131927], [14.821031, -14.310368]];
  const layerState = {};

  function colorStyle(color, fillColor, weight) {
    return {
      color: color,
      fillColor: fillColor || color,
      fillOpacity: 0.55,
      opacity: 1,
      weight: weight || 1.5
    };
  }

  const definitions = [
    { key: "Region", label: "Region", dataVar: "json_Region_3", type: "polygon", style: colorStyle("#111827", "#93c5fd", 2), legend: "#93c5fd" },
    { key: "Departement", label: "Departement", dataVar: "json_Departement_4", type: "polygon", style: colorStyle("#14532d", "#86efac", 1.5), legend: "#86efac" },
    { key: "Arrondissement", label: "Arrondissement", dataVar: "json_Arrondissement_5", type: "polygon", style: colorStyle("#7c2d12", "#fdba74", 1), legend: "#fdba74" },
    { key: "Routes", label: "Routes", dataVar: "json_Routes_6", type: "line", style: { color: "#dc2626", opacity: 0.95, weight: 2 }, legend: "#dc2626" },
    { key: "Localites", label: "Localites", dataVar: "json_Localites_7", type: "point", style: { radius: 4, color: "#1d4ed8", fillColor: "#60a5fa", fillOpacity: 0.85, opacity: 1, weight: 1 }, legend: "#60a5fa" },
    { key: "Ecoles", label: "Ecoles", dataVar: "json_Ecoles_8", type: "point", style: { radius: 5, color: "#991b1b", fillColor: "#f87171", fillOpacity: 0.9, opacity: 1, weight: 1 }, legend: "#f87171" }
  ];

  function ensureMap() {
    if (map) {
      return map;
    }
    map = L.map("map", {
      zoomControl: true,
      attributionControl: true
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);
    map.fitBounds(fullExtent);

    map.on("click", onMapClickForRouting);
    map.on("zoomend moveend", updateScaleText);
    window.addEventListener("resize", () => map && map.invalidateSize());
    setTimeout(() => map && map.invalidateSize(), 150);

    return map;
  }

  function toLayer(def) {
    const data = window[def.dataVar];
    if (!data) {
      return null;
    }
    if (def.type === "point") {
      return L.geoJSON(data, {
        pointToLayer: (_, latlng) => L.circleMarker(latlng, def.style)
      });
    }
    return L.geoJSON(data, { style: def.style });
  }

  function initLayers() {
    ensureMap();
    definitions.forEach((def) => {
      const layer = toLayer(def);
      layerState[def.key] = {
        def,
        layer,
        active: Boolean(layer),
        opacity: 1
      };
      if (layer) {
        layer.addTo(map);
      }
    });
    updateScaleText();
  }

  function getLayerState() {
    return layerState;
  }

  function setLayerVisibility(key, visible) {
    const state = layerState[key];
    if (!state || !state.layer) return;
    state.active = visible;
    if (visible) {
      state.layer.addTo(map);
    } else {
      map.removeLayer(state.layer);
    }
  }

  function setLayerOpacity(key, opacity) {
    const state = layerState[key];
    if (!state || !state.layer) return;
    state.opacity = opacity;
    state.layer.eachLayer((child) => {
      if (!child.setStyle) return;
      const base = state.def.style;
      if (state.def.type === "line") {
        child.setStyle({ opacity: opacity });
      } else if (state.def.type === "point") {
        child.setStyle({ opacity: opacity, fillOpacity: Math.max(0.15, opacity * 0.9) });
      } else {
        child.setStyle({ opacity: opacity, fillOpacity: Math.max(0.1, opacity * 0.55) });
      }
      if (base.weight) child.setStyle({ weight: base.weight });
    });
  }

  function resetHome() {
    ensureMap().fitBounds(fullExtent);
    setStatus("Vue complete chargee");
  }

  function zoomIn() {
    ensureMap().zoomIn();
  }

  function zoomOut() {
    ensureMap().zoomOut();
  }

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
    setStatus("Outil mesure active");
  }

  function startRouting() {
    routeMode = true;
    routePoints = [];
    setStatus("Itineraire: selectionnez 2 points sur la carte");
  }

  function clearRouting() {
    routeMode = false;
    routePoints = [];
    if (routeLayer) {
      map.removeLayer(routeLayer);
      routeLayer = null;
    }
    setStatus("Itineraire reinitialise");
  }

  function onMapClickForRouting(event) {
    if (!routeMode) return;
    routePoints.push(event.latlng);
    if (routePoints.length < 2) {
      setStatus("Itineraire: selectionnez le point d'arrivee");
      return;
    }
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }
    routeLayer = L.polyline(routePoints, { color: "#16a34a", weight: 4 }).addTo(map);
    const distanceMeters = routePoints[0].distanceTo(routePoints[1]);
    setStatus("Distance: " + distanceMeters.toFixed(0) + " m");
    routeMode = false;
    routePoints = [];
  }

  function updateScaleText() {
    if (!map) return;
    const scaleEl = document.getElementById("scaleText");
    if (!scaleEl) return;
    const zoom = map.getZoom();
    scaleEl.textContent = "Zoom: " + zoom;
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
    const payload = {
      type: "FeatureCollection",
      features: features
    };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "geoweb-kaffrine-export.geojson";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Export GeoJSON termine");
  }

  window.MapModule = {
    initMap: ensureMap,
    initLayers,
    getLayerState,
    setLayerVisibility,
    setLayerOpacity,
    resetHome,
    zoomIn,
    zoomOut,
    toggleMeasure,
    startRouting,
    clearRouting,
    downloadActiveData,
    invalidateSize,
    setStatus
  };
})();
