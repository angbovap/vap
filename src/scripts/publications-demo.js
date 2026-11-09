// Featured talk player on /publications/.
// One video, a segmented timeline (one segment per clip, sized by length).
// The active segment fills as the clip plays; clips crossfade into each other.
// Plays silently while on screen, pauses when scrolled away.
(function () {
  var player = document.querySelector('[data-player]');
  if (!player) return;
  var stage = player.querySelector('[data-player-stage]');
  var video = player.querySelector('[data-demo-video]');
  var toggle = player.querySelector('[data-player-toggle]');
  var full = player.querySelector('[data-player-full]');
  var segs = Array.prototype.slice.call(player.querySelectorAll('[data-demo-src]'));
  if (!video || !segs.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var index = 0;
  var userPaused = false;
  var frame = 0;
  var counted = {};

  function fill(seg, amount) {
    seg.querySelector('[data-fill]').style.transform = 'scaleX(' + amount + ')';
  }

  function paintSegments() {
    segs.forEach(function (seg, i) {
      var on = i === index;
      seg.classList.toggle('is-active', on);
      seg.classList.toggle('is-done', i < index);
      seg.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (!on) fill(seg, i < index ? 1 : 0);
    });
  }

  function tick() {
    if (video.duration) fill(segs[index], Math.min(video.currentTime / video.duration, 1));
    if (!video.paused) frame = requestAnimationFrame(tick);
  }

  function play() {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function load(i, autoplay) {
    index = i;
    paintSegments();
    fill(segs[index], 0);
    var seg = segs[index];
    stage.classList.add('is-switching');
    setTimeout(function () {
      video.src = seg.getAttribute('data-demo-src');
      video.poster = seg.getAttribute('data-demo-poster');
      video.setAttribute('aria-label', seg.getAttribute('aria-label'));
      if (autoplay) play();
      else stage.classList.remove('is-switching');
    }, reduceMotion ? 0 : 220);
  }

  video.addEventListener('loadeddata', function () { stage.classList.remove('is-switching'); });
  video.addEventListener('playing', function () { stage.classList.remove('is-switching'); });

  video.addEventListener('play', function () {
    stage.classList.add('is-playing');
    toggle.setAttribute('aria-label', 'Pause');
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);

    var key = segs[index].getAttribute('data-demo-src');
    if (!counted[key] && typeof window.gtag === 'function') {
      counted[key] = true;
      window.gtag('event', 'video_play', {
        page_location: window.location.href,
        video_title: segs[index].getAttribute('aria-label'),
        video_id: key
      });
    }
  });

  video.addEventListener('pause', function () {
    stage.classList.remove('is-playing');
    toggle.setAttribute('aria-label', 'Play');
    cancelAnimationFrame(frame);
    tick();
  });

  video.addEventListener('ended', function () {
    if (index < segs.length - 1) {
      load(index + 1, true);
    } else {
      userPaused = true; // finished the set; don't restart on its own
      load(0, false);
    }
  });

  toggle.addEventListener('click', function () {
    if (video.paused) {
      userPaused = false;
      play();
    } else {
      userPaused = true;
      video.pause();
    }
  });

  segs.forEach(function (seg, i) {
    seg.addEventListener('click', function () {
      userPaused = false;
      if (i === index && video.paused) play();
      else if (i !== index) load(i, true);
    });
  });

  if (full) {
    full.addEventListener('click', function () {
      if (stage.requestFullscreen) stage.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    });
  }

  // Play while on screen and on the visible slide (silent clips); pause otherwise.
  var slide = player.closest('[data-slide]');
  var inView = false;

  function slideShowing() {
    return !slide || slide.classList.contains('is-active');
  }

  function autoplay() {
    if (reduceMotion || saveData) return;
    if (inView && slideShowing() && !userPaused) {
      if (video.paused) play();
    } else if (!video.paused) {
      video.pause();
    }
  }

  document.addEventListener('pubslide:change', autoplay);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
        autoplay();
      });
    }, { threshold: 0.6 }).observe(stage);
  }
})();
