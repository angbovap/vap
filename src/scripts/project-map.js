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

  // Clicking a pin (or a region in the list) jumps the "Selected projects"
  // list straight to that region, instead of opening a panel on the map.
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-map-group]'));
  var listScroll = document.querySelector('.trusted__list-scroll');

  function setActiveRegion(id) {
    markers.forEach(function (marker) {
      var pin = marker.querySelector('[data-map-pin]');
      var isMatch = pin && pin.getAttribute('data-map-pin') === id;
      marker.classList.toggle('is-active', isMatch);
      if (pin) pin.classList.toggle('is-active', isMatch);
    });

    var targetGroup = null;
    groups.forEach(function (group) {
      var isMatch = group.getAttribute('data-map-group') === id;
      group.classList.toggle('is-active', isMatch);
      if (isMatch) targetGroup = group;
    });

    if (targetGroup && listScroll) {
      listScroll.scrollTop = Math.max(0, targetGroup.offsetTop);
    }
  }

  markers.forEach(function (marker) {
    var pin = marker.querySelector('[data-map-pin]');
    if (!pin) return;
    pin.addEventListener('click', function () {
      setActiveRegion(pin.getAttribute('data-map-pin'));
    });
  });

  document.querySelectorAll('[data-map-focus]').forEach(function (button) {
    button.addEventListener('click', function () {
      setActiveRegion(button.getAttribute('data-map-focus'));
    });
  });
})();
