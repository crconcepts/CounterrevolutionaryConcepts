(() => {
  const onReady = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };

  onReady(() => {
    const btn = document.querySelector('.hamburger');
    const drawer = document.getElementById('nav-drawer');
    if (!btn || !drawer) return;

    const panel = drawer.querySelector('.nav-drawer__panel');
    const closeBtn = drawer.querySelector('.drawer-close');
    const backdrop = drawer.querySelector('.nav-drawer__backdrop');
    const FOCUSABLE = 'a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])';
    let opener = null;

    // Ensure closed baseline
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');

    const trapFocus = (e) => {
      if (drawer.getAttribute('aria-hidden') === 'true') return;
      const focusables = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length-1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      } else if (e.key === 'Escape') {
        e.preventDefault(); closeDrawer();
      }
    };

    function openDrawer() {
      opener = document.activeElement;
      drawer.hidden = false; // participate in layout

      // Two rAFs ensure the CSS transition runs
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawer.setAttribute('aria-hidden','false');
          btn.setAttribute('aria-expanded','true');
          document.body.classList.add('body-lock');
          const first = panel.querySelector(FOCUSABLE);
          if (first) first.focus();
        });
      });

      document.addEventListener('keydown', trapFocus);
    }

    function closeDrawer() {
      drawer.setAttribute('aria-hidden','true');
      btn.setAttribute('aria-expanded','false');
      document.body.classList.remove('body-lock');

      const onEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        drawer.hidden = true;
        panel.removeEventListener('transitionend', onEnd);
        if (opener && typeof opener.focus === 'function') opener.focus();
      };
      panel.addEventListener('transitionend', onEnd, { once:true });

      // Fallback in case transitionend doesn't fire
      setTimeout(() => {
        if (drawer.getAttribute('aria-hidden') === 'true') {
          drawer.hidden = true;
        }
      }, 400);

      document.removeEventListener('keydown', trapFocus);
    }

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      expanded ? closeDrawer() : openDrawer();
    });

    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  });
})();