// Preview clips that play only while their card is hovered or focused, so
// nothing moves until someone shows interest. Mark the card (or row) with
// data-hover-preview and the video inside it with data-hover-video.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-hover-preview]').forEach(function (card) {
    var video = card.querySelector('[data-hover-video]');
    if (!video) return;

    function start() {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
    function stop() { video.pause(); }

    card.addEventListener('mouseenter', start);
    card.addEventListener('focusin', start);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focusout', stop);
  });
})();
