// Slide viewer on talk pages (/publications/<talk>/).
// Slides crossfade; slides with a recording play it in place of the old
// screenshot (silent, cycling through the slide's clips). Navigate with the
// buttons, thumbnails, arrow keys or a swipe. #slide-8 links straight to a slide.
(function () {
  var deck = document.querySelector('[data-deck]');
  if (!deck) return;

  var stage = deck.querySelector('[data-deck-stage]');
  var slides = Array.prototype.slice.call(deck.querySelectorAll('[data-deck-slide]'));
  var thumbs = Array.prototype.slice.call(deck.querySelectorAll('[data-deck-go]'));
  var strip = deck.querySelector('[data-deck-thumbs]');
  var current = deck.querySelector('[data-deck-current]');
  var progress = deck.querySelector('[data-deck-progress]');
  var prev = deck.querySelector('[data-deck-prev]');
  var next = deck.querySelector('[data-deck-next]');
  var full = deck.querySelector('[data-deck-full]');
  var name = deck.getAttribute('data-deck-name') || '';
  var saveData = navigator.connection && navigator.connection.saveData;
  var index = 0;
  var inView = false;
  var seen = {};

  function videoOf(slide) {
    return slide.querySelector('[data-deck-video]');
  }

  function playVideo(video) {
    if (!video || saveData) return;
    var clips = video.getAttribute('data-clips').split('|');
    if (!video.getAttribute('src')) {
      video.dataset.clip = '0';
      video.src = clips[0];
    }
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function syncVideos() {
    slides.forEach(function (slide, i) {
      var video = videoOf(slide);
      if (!video) return;
      if (i === index && inView) playVideo(video);
      else if (!video.paused) video.pause();
    });
  }

  // When a clip ends, move to the slide's next clip (and back to the first).
  slides.forEach(function (slide) {
    var video = videoOf(slide);
    if (!video) return;
    video.addEventListener('ended', function () {
      var clips = video.getAttribute('data-clips').split('|');
      var n = (Number(video.dataset.clip || 0) + 1) % clips.length;
      video.dataset.clip = String(n);
      video.src = clips[n];
      playVideo(video);
    });
  });

  function scrollThumbIntoView(thumb) {
    if (!strip || !thumb) return;
    var left = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }

  function show(i, fromHash) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (slide, n) {
      var on = n === index;
      slide.classList.toggle('is-active', on);
      if (on) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    thumbs.forEach(function (thumb, n) {
      var on = n === index;
      thumb.classList.toggle('is-active', on);
      if (on) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    scrollThumbIntoView(thumbs[index]);
    if (current) current.textContent = String(index + 1);
    if (progress) progress.style.transform = 'scaleX(' + (index + 1) / slides.length + ')';
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;

    // Warm up the next slide's image.
    var after = slides[index + 1] && slides[index + 1].querySelector('img');
    if (after && after.loading === 'lazy') after.loading = 'eager';

    syncVideos();

    if (!fromHash && window.history && history.replaceState) {
      history.replaceState(null, '', index === 0 ? location.pathname : '#slide-' + (index + 1));
    }
    if (!seen[index] && typeof window.gtag === 'function') {
      seen[index] = true;
      window.gtag('event', 'deck_slide_view', {
        page_location: window.location.href,
        deck_name: name,
        slide_number: index + 1
      });
    }
  }

  if (prev) prev.addEventListener('click', function () { show(index - 1); });
  if (next) next.addEventListener('click', function () { show(index + 1); });
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () { show(Number(thumb.getAttribute('data-deck-go'))); });
  });

  // Arrow keys while the deck is on screen (not while typing in a field).
  document.addEventListener('keydown', function (event) {
    if (!inView && !document.fullscreenElement) return;
    var tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); show(index + 1); }
    else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); show(index - 1); }
  });

  // Swipe on touch screens.
  var startX = null;
  var startY = null;
  stage.addEventListener('touchstart', function (event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', function (event) {
    if (startX === null) return;
    var dx = event.changedTouches[0].clientX - startX;
    var dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });

  if (full) {
    full.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (stage.requestFullscreen) stage.requestFullscreen();
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
        syncVideos();
      });
    }, { threshold: 0.4 }).observe(stage);
  } else {
    inView = true;
  }

  var match = /^#slide-(\d+)$/.exec(location.hash);
  show(match ? Number(match[1]) - 1 : 0, true);
})();
