// Page transition: on an internal link, fade to white with the VAP logo, then
// load the next page, which fades back in (see "Page transition" in base.css).
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  var LEAVE_MS = 200;

  function isPageLink(link, event) {
    if (event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download') || link.hasAttribute('data-no-transition')) return false;
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return false;
    // Same page (including #anchors): no transition.
    if (url.pathname === location.pathname && url.search === location.search) return false;
    // Files such as PDFs or videos are not pages.
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !/\.html?$/i.test(url.pathname)) return false;
    return true;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link || !isPageLink(link, event)) return;
    event.preventDefault();
    try { sessionStorage.setItem('vap-pt', '1'); } catch (e) {}
    root.classList.remove('pt-in');
    root.classList.add('pt-out');
    setTimeout(function () { location.href = link.href; }, LEAVE_MS);
  });

  // Coming back with the browser's Back button can restore this page as it was left.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) root.classList.remove('pt-out');
  });
})();
