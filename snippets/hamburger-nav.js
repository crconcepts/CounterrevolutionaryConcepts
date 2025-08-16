(() => {
  const root = document;
  const btn = root.querySelector('.hamburger');
  const drawer = root.getElementById('nav-drawer');
  if (!btn || !drawer) return;

  const panel = drawer.querySelector('.nav-drawer__panel');
  const closeBtn = drawer.querySelector('.drawer-close');
  const backdrop = drawer.querySelector('.nav-drawer__backdrop');

  let lastFocus = null;
  const focusableSel = [
    'a[href]',
    'button:not([disabled])',
    'summary',
    '[tabindex]:not([tabindex="-1"])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])'
  ].join(',');

  function trapFocus(e) {
    if (drawer.getAttribute('aria-hidden') === 'true') return;
    if (e.key !== 'Tab') return;

    const nodes = panel.querySelectorAll(focusableSel);
    if (!nodes.length) return;

    const first = nodes[0];
    const last  = nodes[nodes.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
    } else {
      trapFocus(e);
    }
  }

  function afterClose() {
    drawer.hidden = true;                              // remove from a11y tree
    document.body.classList.remove('body-lock');
    btn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocus) lastFocus.focus();
  }

  function closeDrawer() {
    // Start slide-out / fade-out
    drawer.setAttribute('aria-hidden', 'true');

    // Wait for panel transition to finish, then hide the whole drawer
    const handle = (e) => {
      if (e.target !== panel) return;
      panel.removeEventListener('transitionend', handle);
      afterClose();
    };
    panel.addEventListener('transitionend', handle);

    // Failsafe (in case user agent fires no transitionend)
    setTimeout(() => {
      if (drawer.hidden) return;
      afterClose();
    }, 400);
  }

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;                             // allow CSS to animate
    // next frame → set aria so CSS transitions can start cleanly
    requestAnimationFrame(() => {
      drawer.setAttribute('aria-hidden', 'false');
    });
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('body-lock');

    // Focus first focusable
    const firstFocusable = panel.querySelector(focusableSel);
    if (firstFocusable) firstFocusable.focus();

    document.addEventListener('keydown', onKeydown);
  }

  // Toggle via button
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? closeDrawer() : openDrawer();
  });

  // Close actions
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Close when a link in the drawer is activated (keeps navigation snappy)
  panel.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    // Let the navigation proceed; no need to wait transition
    document.removeEventListener('keydown', onKeydown);
  });

  // Optional: build sections from sitemap (leave as-is if you already do this)
  // (You can keep your existing sitemap code here.)
})();