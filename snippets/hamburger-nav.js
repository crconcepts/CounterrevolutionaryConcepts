
// Robust hamburger/drawer controller
(() => {
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));

  let openGuardUntil = 0;          // time window to ignore close triggers right after open
  let lastHamburgerUp = 0;         // timestamp of last pointerup on hamburger

  function now() {
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  function getEls() {
    const drawer = qs('#nav-drawer');
    const panel  = drawer ? qs('.nav-drawer__panel', drawer) : null;
    const backdrop = drawer ? qs('.nav-drawer__backdrop', drawer) : null;
    const closeBtn = drawer ? qs('.drawer-close', drawer) : null;
    // hamburger may live outside snippet depending on layout; prefer the one that controls this drawer
    const hamburgers = qsa('.hamburger');
    let ham = null;
    for (const b of hamburgers) {
      const id = b.getAttribute('aria-controls');
      if (id === 'nav-drawer') { ham = b; break; }
    }
    return { drawer, panel, backdrop, closeBtn, ham };
  }

  function trapFocus(panel) {
    const FOCUSABLE = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    const list = qsa(FOCUSABLE, panel).filter(el => el.offsetParent !== null);
    const first = list[0] || panel;
    const last  = list[list.length - 1] || panel;

    function onKey(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
      }
    }
    panel.addEventListener('keydown', onKey);
    panel.__untrap = () => panel.removeEventListener('keydown', onKey);
    // move focus in
    (first || panel).focus({ preventScroll: true });
  }

  function openDrawer(opener) {
    const { drawer, panel, backdrop, ham } = getEls();
    if (!drawer || !panel) return;

    // baseline closed
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'true');

    // ensure body lock and aria-expanded
    document.body.classList.add('body-lock');
    const btn = opener || ham;
    if (btn) btn.setAttribute('aria-expanded', 'true');

    // guard window: ignore backdrop/escape close immediately after open
    openGuardUntil = now() + 450;

    // async open so transitions fire
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drawer.setAttribute('aria-hidden', 'false');
        drawer.__opener = btn || document.activeElement;
        // focus trap
        trapFocus(panel);
      });
    });
  }

  function reallyClose(drawer, panel) {
    drawer.hidden = true;
    if (panel && panel.__untrap) { panel.__untrap(); delete panel.__untrap; }
    document.body.classList.remove('body-lock');
    // restore focus
    const opener = drawer.__opener;
    if (opener && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
  }

  function closeDrawer() {
    const { drawer, panel, ham } = getEls();
    if (!drawer || !panel) return;
    // ignore if within guard period
    if (now() < openGuardUntil) return;

    drawer.setAttribute('aria-hidden', 'true');
    if (ham) ham.setAttribute('aria-expanded', 'false');

    // wait for transition end or fallback
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      panel.removeEventListener('transitionend', onEnd);
      clearTimeout(fallback);
      reallyClose(drawer, panel);
    };
    function onEnd(e) {
      if (e.propertyName !== 'transform') return;
      done();
    }
    panel.addEventListener('transitionend', onEnd, { once: true });
    const fallback = setTimeout(done, 500);
  }

  function init() {
    const { drawer, panel, backdrop, closeBtn, ham } = getEls();
    if (!drawer || !ham || !panel) return;

    // start closed/inert
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
    ham.setAttribute('aria-expanded', 'false');

    // Open on click
    ham.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDrawer(ham);
    });

    // avoid immediate close due to same pointer sequence (iOS)
    ham.addEventListener('pointerup', () => {
      lastHamburgerUp = now();
    });

    // Backdrop + close buttons
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        // ignore if the click is too soon after open
        if (now() - lastHamburgerUp < 300) return;
        closeDrawer();
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeDrawer(); });
    }

    // Global escape support (fallback)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') {
        e.preventDefault();
        closeDrawer();
      }
    }, { capture: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
