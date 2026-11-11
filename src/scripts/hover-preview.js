// Case study card that links to a talk: its preview clip plays only while
// hovered or focused, so nothing moves until someone shows interest.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var link = document.querySelector('.case-talk__card');
  var video = link && link.querySelector('[data-case-talk-video]');
  if (!video) return;

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
