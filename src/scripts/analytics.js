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
    if (link.closest('.vc')) return 'digital_card';
    if (link.closest('.site-head')) return 'navbar';
    if (link.closest('.site-foot')) return 'footer';
    if (link.closest('.book--page')) return 'booking_page';
    if (link.closest('.book')) return 'booking_section';
    if (link.closest('.book-inline')) return 'inline_prompt';
    if (link.closest('.team-member-wrap')) return 'team_card';
    if (link.closest('.wwd-selector')) return 'service_panel';
    if (link.closest('.case-hero')) return 'service_hero';
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

    if (link.hasAttribute('data-track')) return { type: link.getAttribute('data-track') };
    if (/\.vcf$/.test(url.pathname)) {
      return { type: 'save_contact_click', nameKey: 'team_member', name: link.getAttribute('data-save-contact') || '' };
    }

    var isBooking = link.classList.contains('nav-book') ||
      link.hasAttribute('data-book-host') ||
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
    if (parts.length === 2 && parts[0] === 'our-team') {
      return { type: 'team_profile_click', nameKey: 'team_member', name: parts[1] };
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
    if (match.type === 'book_meeting_click') {
      // 'calendar' = opened an adviser's calendar; 'booking_page' = went to the /book/ page
      params.click_stage = link.hasAttribute('data-book-host') ? 'calendar' : 'booking_page';
      if (link.hasAttribute('data-book-host')) {
        params.meeting_host = link.getAttribute('data-book-host');
        params.meeting_topic = link.getAttribute('data-book-focus');
        params.is_suggested = link.closest('.book__row--flagged') ? 'yes' : 'no';
      }
    }

    window.gtag('event', match.type, params);
  });

  // ---- Engagement events (no markup changes: all hooked from the outside) ----

  function send(name, params) {
    if (typeof window.gtag !== 'function') return;
    var data = { page_location: window.location.href };
    for (var key in params) data[key] = params[key];
    window.gtag('event', name, data);
  }

  document.addEventListener('click', function (event) {
    var el = event.target.closest && event.target.closest(
      '[data-yt-preview], [data-map-pin], [data-map-focus], [data-wwd-toggle], .nav-toggle'
    );
    if (!el) return;

    if (el.hasAttribute('data-yt-preview')) {
      send('video_play', {
        video_title: clean(el.getAttribute('aria-label')),
        video_id: el.getAttribute('data-yt-preview')
      });
    } else if (el.hasAttribute('data-map-pin') || el.hasAttribute('data-map-focus')) {
      send('map_region_select', {
        region: el.getAttribute('data-map-pin') || el.getAttribute('data-map-focus')
      });
    } else if (el.hasAttribute('data-wwd-toggle')) {
      send('service_panel_toggle', { button_text: clean(el.textContent) });
    } else {
      send('mobile_menu_toggle', { button_location: 'navbar' });
    }
  });

  // Scroll depth: 25 / 50 / 75 / 100 %, once each per page view.
  var depthMarks = [25, 50, 75, 100];
  var depthSent = {};
  var depthTicking = false;

  function checkDepth() {
    depthTicking = false;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var percent = (window.scrollY / scrollable) * 100;
    depthMarks.forEach(function (mark) {
      if (percent >= mark - 1 && !depthSent[mark]) {
        depthSent[mark] = true;
        send('scroll_depth', { percent_scrolled: mark });
      }
    });
  }

  window.addEventListener('scroll', function () {
    if (depthTicking) return;
    depthTicking = true;
    window.requestAnimationFrame(checkDepth);
  }, { passive: true });

  // Contact form: started, submitted successfully (lead), or failed.
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var started = false;
    form.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      send('form_start', { form_name: 'contact' });
    });

    var status = form.querySelector('[data-form-status]');
    if (status) {
      var lastKind = '';
      new MutationObserver(function () {
        var kind = /form-status--(success|error)/.exec(status.className);
        kind = kind ? kind[1] : '';
        if (!kind || kind === lastKind) return;
        lastKind = kind;
        if (kind === 'success') send('generate_lead', { form_name: 'contact' });
        else send('form_error', { form_name: 'contact' });
      }).observe(status, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // ---- Experience / UX signals ----

  // Which sections people actually see (shows where visitors drop off).
  if ('IntersectionObserver' in window) {
    var seenSections = {};
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var name = entry.target.classList[0];
        sectionObserver.unobserve(entry.target);
        if (!name || seenSections[name]) return;
        seenSections[name] = true;
        send('section_view', { section_name: name });
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('main section[class]').forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  // Broken links: which missing page was requested, and where the visitor came from.
  if (/page not found/i.test(document.title)) {
    send('page_not_found', {
      page_path: window.location.pathname,
      referrer: document.referrer || '(direct)'
    });
  }

  // People copying contact details instead of clicking them.
  document.addEventListener('copy', function () {
    var selected = clean(String(window.getSelection() || ''));
    if (!selected || selected.length > 80) return;
    var kind = /@/.test(selected) ? 'email' : /^[+()ds-]{8,}$/.test(selected) ? 'phone' : '';
    if (kind) send('contact_copy', { contact_type: kind });
  });

  // Back to top.
  document.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('[data-back-to-top]')) {
      send('back_to_top_click', { percent_scrolled: Math.round(
        (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100
      ) });
    }
  });

  // Which contact-form fields trip people up (field names only, never what they typed).
  if (form) {
    var reportedFields = {};
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var field = m.target;
        if (!field.hasAttribute('aria-invalid') || reportedFields[field.id]) return;
        reportedFields[field.id] = true;
        send('form_field_error', { form_name: 'contact', field_name: field.id });
      });
    }).observe(form, { attributes: true, attributeFilter: ['aria-invalid'], subtree: true });
  }
})();
