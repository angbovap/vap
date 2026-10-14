// Footer map: one map with a tab per office. Only the visible map is loaded.
(function () {
  var root = document.querySelector('[data-foot-map]');
  if (!root) return;

  var frame = root.querySelector('iframe');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-map-src]'));
  if (!frame || !tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (other) {
        var on = other === tab;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      frame.src = tab.getAttribute('data-map-src');
      frame.title = tab.getAttribute('data-map-title');
    });
  });
})();
