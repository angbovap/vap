(function () {
  var map = document.querySelector('[data-project-map]');
  if (!map) return;

  var markers = Array.prototype.slice.call(map.querySelectorAll('.trusted__map-marker'));

  var iframe = map.querySelector('iframe');
  var WIDE_VIEW = { zoom: 4, lat: -29, lon: 147 };
  var NARROW_VIEW = { zoom: 3, lat: -34, lon: 145.3 };
  var WIDE_MIN_WIDTH = 760;
  var PIN_EDGE = 18;
  var currentZoom = iframe ? parseInt(iframe.getAttribute('data-zoom'), 10) : WIDE_VIEW.zoom;

  function mercatorY(lat, world) {
    return (world / (2 * Math.PI)) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  }

  function placeMarkers() {
    var view = map.clientWidth >= WIDE_MIN_WIDTH ? WIDE_VIEW : NARROW_VIEW;
    var world = 256 * Math.pow(2, view.zoom);

    if (iframe && view.zoom !== currentZoom) {
      currentZoom = view.zoom;
      iframe.src = 'https://www.google.com/maps?ll=' + view.lat + ',' + view.lon + '&z=' + view.zoom + '&output=embed';
    }

    markers.forEach(function (marker) {
      var lat = parseFloat(marker.getAttribute('data-lat'));
      var lon = parseFloat(marker.getAttribute('data-lon'));
      if (isNaN(lat) || isNaN(lon)) return;
      var dx = ((lon - view.lon) * world) / 360;
      var dy = mercatorY(view.lat, world) - mercatorY(lat, world);
      var limitX = map.clientWidth / 2 - PIN_EDGE;
      var limitY = map.clientHeight / 2 - PIN_EDGE;
      dx = Math.max(-limitX, Math.min(limitX, dx));
      dy = Math.max(-limitY, Math.min(limitY, dy));
      marker.style.left = 'calc(50% + ' + dx.toFixed(1) + 'px)';
      marker.style.top = 'calc(50% + ' + dy.toFixed(1) + 'px)';
    });
  }

  var resizeQueued = false;
  window.addEventListener('resize', function () {
    if (resizeQueued) return;
    resizeQueued = true;
    window.requestAnimationFrame(function () {
      resizeQueued = false;
      placeMarkers();
    });
  });
  placeMarkers();

  var GAP = 8;

  function positionPanel(marker, panel) {
    marker.classList.remove('trusted__map-marker--flip-y');
    panel.style.maxHeight = '';
    panel.style.left = '';
    panel.style.transform = '';

    var mapRect = map.getBoundingClientRect();
    var pin = marker.querySelector('[data-map-pin]');
    var pinRect = pin.getBoundingClientRect();

    var spaceBelow = mapRect.bottom - pinRect.bottom - GAP;
    var spaceAbove = pinRect.top - mapRect.top - GAP;
    var defaultMax = 224;

    if (spaceBelow < spaceAbove) {
      marker.classList.add('trusted__map-marker--flip-y');
      panel.style.maxHeight = Math.max(96, Math.min(defaultMax, spaceAbove)) + 'px';
    } else {
      panel.style.maxHeight = Math.max(96, Math.min(defaultMax, spaceBelow)) + 'px';
    }

    var markerRect = marker.getBoundingClientRect();
    var panelWidth = panel.offsetWidth;
    var idealLeft = pinRect.left + pinRect.width / 2 - panelWidth / 2;
    var minLeft = mapRect.left;
    var maxLeft = mapRect.right - panelWidth;
    var clampedLeft = Math.min(Math.max(idealLeft, minLeft), maxLeft);

    panel.style.transform = 'none';
    panel.style.left = (clampedLeft - markerRect.left) + 'px';
  }

  function setOpen(marker, open) {
    var pin = marker.querySelector('[data-map-pin]');
    var panel = marker.querySelector('[data-map-panel]');
    if (!pin || !panel) return;
    pin.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    if (open) positionPanel(marker, panel);
  }

  function closeAll(except) {
    markers.forEach(function (marker) {
      if (marker === except) return;
      setOpen(marker, false);
    });
  }

  markers.forEach(function (marker) {
    var pin = marker.querySelector('[data-map-pin]');
    if (!pin) return;
    pin.addEventListener('click', function () {
      var isOpen = pin.getAttribute('aria-expanded') === 'true';
      closeAll(marker);
      setOpen(marker, !isOpen);
    });
  });

  document.addEventListener('click', function (event) {
    var openMarker = markers.find(function (marker) {
      var pin = marker.querySelector('[data-map-pin]');
      return pin && pin.getAttribute('aria-expanded') === 'true';
    });
    if (openMarker && !openMarker.contains(event.target)) closeAll(null);
  });

  document.querySelectorAll('[data-map-focus]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      var pin = map.querySelector('[aria-controls="pin-panel-' + button.getAttribute('data-map-focus') + '"]');
      if (!pin) return;
      closeAll(null);
      pin.click();
      map.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAll(null);
  });
})();
