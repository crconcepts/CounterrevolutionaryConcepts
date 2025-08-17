/* Accessible hamburger-driven drawer controller
   - Ensures drawer starts closed and inert
   - Smooth slide from right; background dims
   - Focus trap, ESC to close, backdrop/close button to close
   - No content changes
*/
(function () {
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const drawer = q('#nav-drawer');
  if (!drawer) return;

  // Start closed + inert
  drawer.hidden = true;
  drawer.setAttribute('aria-hidden', 'true');

  const panel = q('.nav-drawer__panel', drawer);
  const backdrop = q('.nav-drawer__backdrop', drawer);
  const closeBtn = q('.drawer-close', drawer);
  const openers = qa('[aria-controls="nav-drawer"]');

  let lastFocus = null;
  let trapHandler = null;

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusables = qa([
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(','), panel);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
    }
  }

  function openDrawer(opener) {
    if (!drawer || !panel) return;
    lastFocus = opener || document.activeElement;
    drawer.hidden = false; // participate in layout
    requestAnimationFrame(() => {
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('body-lock');
      (closeBtn || panel).focus({ preventScroll: true });
      trapHandler = (ev) => trapFocus(ev);
      document.addEventListener('keydown', trapHandler);
      document.addEventListener('keydown', onKeydown);
    });
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('body-lock');
    const onEnd = (ev) => {
      if (ev.target !== panel) return;
      drawer.hidden = true;
      panel.removeEventListener('transitionend', onEnd);
      if (trapHandler) {
        document.removeEventListener('keydown', trapHandler);
        trapHandler = null;
      }
      document.removeEventListener('keydown', onKeydown);
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus({ preventScroll: true });
      }
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawer.hidden = true;
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
      return;
    }
    if (panel) panel.addEventListener('transitionend', onEnd, { once: true });
    else drawer.hidden = true;
  }

  openers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeDrawer();
        btn.setAttribute('aria-expanded', 'false');
      } else {
        openDrawer(btn);
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  window.addEventListener('hashchange', closeDrawer);
})();