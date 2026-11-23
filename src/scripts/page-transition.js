// Page transition: on a link to one of the main pages, the screen turns white, the VAP
// logo draws itself in (rings tracing, the teal one glowing, as in the logo reveal video)
// and the name wipes in beside it. The next page opens on the same logo and name, then
// fades in (the page head adds that screen; see "Page transition" in base.css).
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var LEAVE_MS = 520; // everything has finished drawing by 480ms
  var MAJOR = ['/', '/what-we-do/', '/our-work/', '/our-team/', '/publications/', '/get-in-touch/'];

  // The logo's three rings, traced over the logo image (512 x 512).
  var LOCKUP =
    '<div class="pt-overlay__lockup"><div class="pt-overlay__mark">' +
      '<svg viewBox="0 0 512 512" aria-hidden="true">' +
        '<defs><filter id="pt-glow" x="-30%" y="-30%" width="160%" height="160%">' +
          '<feGaussianBlur stdDeviation="14" result="b"/>' +
          '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter></defs>' +
        '<circle class="pt-ring pt-ring--1" cx="166" cy="167" r="144" pathLength="1" transform="rotate(150 166 167)"/>' +
        '<circle class="pt-ring pt-ring--2" cx="339" cy="167" r="144" pathLength="1" transform="rotate(-30 339 167)"/>' +
        '<circle class="pt-ring pt-ring--3" cx="257" cy="320" r="144" pathLength="1" transform="rotate(40 257 320)" filter="url(#pt-glow)"/>' +
      '</svg>' +
      '<img src="/assets/img/brand/vaplogo.png" alt="" width="512" height="512">' +
    '</div><p class="pt-overlay__name"><b>VALUE ADVISORY</b><span>PARTNERS</span></p></div>';

  var overlay = null;

  // Tidy away the arrival screen once it has faded.
  setTimeout(function () {
    document.querySelectorAll('.pt-overlay--arrive').forEach(function (el) { el.remove(); });
  }, 1200);

  function isPageLink(link, event) {
    if (event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download') || link.hasAttribute('data-no-transition')) return false;
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return false;
    // Same page (including #anchors): no transition.
    if (url.pathname === location.pathname && url.search === location.search) return false;
    // Only the main sections get the transition; detail pages load straight away.
    return MAJOR.indexOf(url.pathname) !== -1;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link || !isPageLink(link, event)) return;
    event.preventDefault();
    try { sessionStorage.setItem('vap-pt', '1'); } catch (e) {}
    document.querySelectorAll('.pt-overlay').forEach(function (el) { el.remove(); });
    overlay = document.createElement('div');
    overlay.className = 'pt-overlay pt-overlay--leave';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = LOCKUP;
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect(); // start the animation from its first frame
    overlay.classList.add('is-on');
    setTimeout(function () { location.href = link.href; }, LEAVE_MS);
  });

  // Coming back with the browser's Back button can restore this page as it was left.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && overlay) { overlay.remove(); overlay = null; }
  });
})();
