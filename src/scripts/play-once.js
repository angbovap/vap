// Videos marked data-play-once play a single time when they come into view, then rest
// on their last frame. With reduced motion they just show the poster (the finished logo).
(function () {
  var videos = document.querySelectorAll('video[data-play-once]');
  if (!videos.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      var p = entry.target.play();
      if (p && p.catch) p.catch(function () {});
    });
  }, { threshold: 0.6 });

  videos.forEach(function (video) { observer.observe(video); });
})();
