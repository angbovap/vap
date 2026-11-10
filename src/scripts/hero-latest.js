// Home hero "Latest talk" strip: the clip plays only while hovered or focused,
// so nothing moves next to the main buttons until someone shows interest.
(function () {
  var link = document.querySelector('.hero-latest');
  var video = link && link.querySelector('[data-hero-latest-video]');
  if (!video) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function start() {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }
  function stop() { video.pause(); }

  link.addEventListener('mouseenter', start);
  link.addEventListener('focus', start);
  link.addEventListener('mouseleave', stop);
  link.addEventListener('blur', stop);
})();
