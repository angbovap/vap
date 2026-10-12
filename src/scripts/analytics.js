// GA4 click tracking. One delegated listener handles every link on the page, so
// nothing needs to be wired per element and each click fires at most one event.
(function () {
  var section = {
    '/what-we-do/': 'service_name',
    '/our-work/': 'project_name'
  };

  function clean(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  function buttonText(link) {
    var text = clean(link.textContent);
    if (text) return text;
    var img = link.querySelector('img[alt]');
    return clean(link.getAttribute('aria-label') || (img && img.alt) || link.title);
  }

  function buttonLocation(link, type) {
    if (link.closest('.site-head')) return 'navbar';
    if (link.closest('.site-foot')) return 'footer';
    if (link.closest('.hero')) return 'hero';
    if (type === 'service_click') return 'service_card';
    if (type === 'project_click') return 'project_card';
    var block = link.closest('section[class]');
    return block ? block.classList[0] : 'page';
  }

  // Returns { type, nameKey, name } for a tracked link, or null.
  function classify(link, url) {
    var href = (link.getAttribute('href') || '').toLowerCase();
    if (href.indexOf('mailto:') === 0) return { type: 'email_click' };
    if (href.indexOf('tel:') === 0) return { type: 'phone_click' };
    if (url.hostname.indexOf('linkedin.com') !== -1) return { type: 'linkedin_click' };

    var isBooking = link.classList.contains('nav-book') ||
      url.hostname === 'calendar.google.com' ||
      /\bbook (a )?(meeting|call)\b/i.test(buttonText(link));
    if (isBooking) return { type: 'book_meeting_click' };

    if (url.origin !== window.location.origin) return null;
    var path = url.pathname;
    if (path === '/get-in-touch/' || path === '/get-in-touch') return { type: 'contact_click' };

    var parts = path.split('/').filter(Boolean);
    if (parts.length === 2 && parts[0] === 'what-we-do') {
      return { type: 'service_click', nameKey: 'service_name', name: parts[1] };
    }
    if (parts.length === 2 && parts[0] === 'our-work') {
      return { type: 'project_click', nameKey: 'project_name', name: parts[1] };
    }
    return null;
  }

  document.addEventListener('click', function (event) {
    if (typeof window.gtag !== 'function') return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (e) {
      return;
    }

    var match = classify(link, url);
    if (!match) return;

    var params = {
      page_location: window.location.href,
      button_text: buttonText(link),
      button_location: buttonLocation(link, match.type),
      destination_url: url.href,
      transport_type: 'beacon'
    };
    if (match.nameKey) params[match.nameKey] = match.name;

    window.gtag('event', match.type, params);
  });
})();
