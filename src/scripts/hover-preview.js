// Small preview clips that play only while hovered or focused, so nothing moves
// until someone shows interest: the home hero's "Latest talk" strip and the
// case study card that links to a talk.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  [['.hero-latest', '[data-hero-latest-video]'], ['.case-talk__card', '[data-case-talk-video]']].forEach(function (pair) {
    var link = document.querySelector(pair[0]);
    var video = link && link.querySelector(pair[1]);
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
  });
})();
