// Mobile bottom sheet controller
(function () {
    function isMobile() {
        return window.innerWidth <= 768;
    }

    function closeSheets() {
        document.querySelectorAll('.mobile-sheet').forEach(function (sheet) {
            sheet.classList.remove('sheet-open');
        });
        const backdrop = document.getElementById('mobileSheetBackdrop');
        if (backdrop) {
            backdrop.classList.remove('sheet-open');
        }
        if (window.map) {
            setTimeout(function () {
                map.invalidateSize();
            }, 150);
        }
    }

    function openSheet(id) {
        if (!isMobile()) return;
        closeSheets();
        // Clone core UI blocks into mobile containers on demand
        if (id === 'sheetLayers') {
            cloneInto('layerControlContainer', 'mobileLayerControl');
            cloneInto('basemapControl', 'mobileBasemapControl');
            cloneInto('legendControl', 'mobileLegendControl');
        }
        const sheet = document.getElementById(id);
        const backdrop = document.getElementById('mobileSheetBackdrop');
        if (sheet) {
            sheet.classList.add('sheet-open');
        }
        if (backdrop) {
            backdrop.classList.add('sheet-open');
        }
        if (window.map) {
            setTimeout(function () {
                map.invalidateSize();
            }, 150);
        }
    }

    function cloneInto(sourceId, targetId) {
        const src = document.getElementById(sourceId);
        const dst = document.getElementById(targetId);
        if (!src || !dst) return;
        dst.innerHTML = '';
        dst.appendChild(src.cloneNode(true));
    }

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-sheet-target]');
        if (btn) {
            const target = btn.getAttribute('data-sheet-target');
            openSheet(target);
            return;
        }
        if (e.target.id === 'mobileSheetBackdrop') {
            closeSheets();
        }
        if (e.target.classList.contains('mobile-sheet-close')) {
            closeSheets();
        }
    });
})();
