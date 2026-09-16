(function () {
  var roots = document.querySelectorAll('[data-associates-spotlight]');

  roots.forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-associates-tab]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-associates-panel]'));
    if (tabs.length < 2) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var index = tab.getAttribute('data-associates-tab');

        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        panels.forEach(function (p) {
          var active = p.getAttribute('data-associates-panel') === index;
          p.classList.toggle('is-active', active);
          if (active) {
            p.removeAttribute('hidden');
          } else {
            p.setAttribute('hidden', '');
          }
        });
      });
    });
  });
})();
