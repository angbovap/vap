// Shortens the booking path.
// 1. The header "Book a meeting" button scrolls to the advisers already on the
//    page instead of loading /book/ (it still goes to /book/ where there are none).
// 2. An adviser's "Book a meeting" button opens their Google calendar in a panel
//    on this page instead of a new tab. Without JavaScript both links work as before.
(function () {
  // ---- 1. Header button ----
  var navBook = document.querySelector('.nav-book');
  var advisers = document.querySelector('section.book') || document.querySelector('.book-inline');
  if (navBook && advisers) {
    navBook.setAttribute('data-book-scroll', '');
    navBook.addEventListener('click', function (event) {
      event.preventDefault();
      var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      advisers.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      var first = advisers.querySelector('[data-book-host]');
      if (first) first.focus({ preventScroll: true });
    });
  }

  // ---- 2. Calendar panel ----
  var dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return; // very old browsers keep the new-tab link

  dialog.className = 'book-panel';
  dialog.setAttribute('aria-labelledby', 'book-panel-title');
  dialog.innerHTML =
    '<div class="book-panel__head">' +
      '<div>' +
        '<p class="book-panel__eyebrow" data-book-panel-focus></p>' +
        '<h2 class="book-panel__title" id="book-panel-title"></h2>' +
      '</div>' +
      '<button class="book-panel__close" type="button" data-book-panel-close>' +
        '<span aria-hidden="true">&times;</span><span class="visually-hidden">Close</span>' +
      '</button>' +
    '</div>' +
    '<div class="book-panel__frame">' +
      '<p class="book-panel__loading">Loading calendar&hellip;</p>' +
    '</div>' +
    '<p class="book-panel__alt">Calendar not showing? <a href="#" target="_blank" rel="noopener" data-book-panel-newtab>Open it in a new tab</a>.</p>';
  document.body.appendChild(dialog);

  var frameWrap = dialog.querySelector('.book-panel__frame');
  var title = dialog.querySelector('#book-panel-title');
  var focusLine = dialog.querySelector('[data-book-panel-focus]');
  var newTab = dialog.querySelector('[data-book-panel-newtab]');

  function isAppointmentPage(href) {
    return /^https:\/\/calendar\.google\.com\/calendar\/appointments\//.test(href);
  }

  function open(link) {
    var name = link.getAttribute('data-book-name') || '';
    title.textContent = name ? 'Book a meeting with ' + name : 'Book a meeting';
    focusLine.textContent = link.getAttribute('data-book-focus') || '';
    newTab.href = link.href;

    var old = frameWrap.querySelector('iframe');
    if (old) old.remove();
    frameWrap.classList.remove('is-loaded');
    var frame = document.createElement('iframe');
    frame.src = link.href;
    frame.title = title.textContent;
    frame.addEventListener('load', function () { frameWrap.classList.add('is-loaded'); });
    frameWrap.appendChild(frame);

    document.documentElement.classList.add('has-book-panel');
    dialog.showModal();
  }

  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('has-book-panel');
    var frame = frameWrap.querySelector('iframe');
    if (frame) frame.remove();
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'booking_panel_close', { page_location: window.location.href });
    }
  });

  dialog.querySelector('[data-book-panel-close]').addEventListener('click', function () {
    dialog.close();
  });

  // Click on the dimmed backdrop closes the panel.
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // let people open a tab on purpose
    var link = event.target.closest && event.target.closest('a[data-book-host]');
    if (!link || !isAppointmentPage(link.href)) return;
    event.preventDefault();
    open(link);
  });
})();
