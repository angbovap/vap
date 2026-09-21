(function () {
  var chips = document.querySelectorAll('[data-pub-filter]');
  var items = document.querySelectorAll('[data-pub-item]');
  var years = document.querySelectorAll('[data-pub-year]');
  var status = document.querySelector('[data-pub-status]');
  var total = items.length;
  var hashToFilter = { talks: 'presentation', reports: 'report' };
  var filterToHash = { presentation: 'talks', report: 'reports' };

  function apply(filter) {
    var shown = 0;
    items.forEach(function (item) {
      var match = filter === 'all' || item.getAttribute('data-type') === filter;
      item.hidden = !match;
      if (match) shown += 1;
    });
    years.forEach(function (group) {
      group.hidden = !group.querySelector('[data-pub-item]:not([hidden])');
    });
    chips.forEach(function (chip) {
      var active = chip.getAttribute('data-pub-filter') === filter;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (status) {
      status.textContent = filter === 'all' ? 'Showing all ' + total : 'Showing ' + shown + ' of ' + total;
    }
  }

  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filter = chip.getAttribute('data-pub-filter');
        apply(filter);
        if (window.history && history.replaceState) {
          history.replaceState(null, '', filter === 'all' ? location.pathname : '#' + filterToHash[filter]);
        }
      });
    });
    var initial = hashToFilter[location.hash.replace('#', '')];
    if (initial) apply(initial);
  }

  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'), 10);
      var start = null;
      function step(now) {
        if (start === null) start = now;
        var progress = Math.min((now - start) / 900, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(step);
      }
      el.textContent = '0';
      requestAnimationFrame(step);
    });
  });
  counters.forEach(function (el) { observer.observe(el); });
})();
