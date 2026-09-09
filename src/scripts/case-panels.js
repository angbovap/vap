(function () {
  var roots = document.querySelectorAll('[data-case-panels]');
  var heroNote = document.querySelector('[data-case-hero-note]');
  var activeImage = document.querySelector('[data-case-active-image]');
  var defaultImageBg = activeImage ? activeImage.style.backgroundImage : '';
  var defaultImagePos = activeImage ? activeImage.style.backgroundPosition : '';

  roots.forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-case-tab]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-case-panel]'));
    if (tabs.length < 2) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var index = tab.getAttribute('data-case-tab');

        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        panels.forEach(function (p) {
          var active = p.getAttribute('data-case-panel') === index;
          p.classList.toggle('is-active', active);
          if (active) {
            p.removeAttribute('hidden');
          } else {
            p.setAttribute('hidden', '');
          }
        });

        if (activeImage) {
          var imgSrc = tab.getAttribute('data-case-image');
          var imgPos = tab.getAttribute('data-case-image-position');
          var isContain = tab.hasAttribute('data-case-image-contain');
          var nextBg = imgSrc ? "url('" + imgSrc + "')" : defaultImageBg;
          var nextPos = imgSrc ? (imgPos || 'center') : defaultImagePos;

          activeImage.style.opacity = '0';
          setTimeout(function () {
            activeImage.style.backgroundImage = nextBg;
            activeImage.style.backgroundPosition = nextPos;
            activeImage.classList.toggle('is-contain', !!(imgSrc && isContain));
            activeImage.removeAttribute('data-placeholder');
            activeImage.style.opacity = '1';
          }, 200);
        }

        if (heroNote) {
          var note = tab.getAttribute('data-hero-note');
          if (note) {
            heroNote.textContent = note;
            heroNote.hidden = false;
          } else {
            heroNote.hidden = true;
          }
        }
      });
    });
  });
})();
