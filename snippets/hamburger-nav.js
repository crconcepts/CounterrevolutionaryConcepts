/* Accessible drawer controller: slides from right, dims background only */
(() => {
  const openBtn = document.querySelector('.hamburger');
  const drawer = document.getElementById('nav-drawer');
  if (!openBtn || !drawer) return;

  const panel = drawer.querySelector('.nav-drawer__panel');
  const backdrop = drawer.querySelector('.nav-drawer__backdrop');
  const closeBtn = drawer.querySelector('.drawer-close');
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300;

  let lastFocused = null;
  let closingTimer = null;

  const focusablesSelector = [
    'a[href]','area[href]','button:not([disabled])','input:not([disabled])',
    'select:not([disabled])','textarea:not([disabled])','summary','[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function trapFocus(e){
    if (!drawer.classList.contains('is-open')) return;
    const focusables = panel.querySelectorAll(focusablesSelector);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    } else if (e.key === 'Escape') {
      closeDrawer();
    }
  }

  function onTransitionEnd(e){
    if (e.target !== panel) return;
    if (!drawer.classList.contains('is-open')) {
      drawer.hidden = true;
      drawer.setAttribute('aria-hidden','true');
      drawer.removeEventListener('transitionend', onTransitionEnd);
    }
  }

  function openDrawer(){
    if (closingTimer) { clearTimeout(closingTimer); closingTimer = null; }
    lastFocused = document.activeElement;
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
    // next frame to ensure transitions apply
    requestAnimationFrame(() => {
      drawer.classList.add('is-open');
      openBtn.setAttribute('aria-expanded','true');
      // move focus to panel
      const focusable = panel.querySelector(focusablesSelector);
      (focusable || closeBtn || panel).focus({preventScroll:true});
    });
    document.addEventListener('keydown', trapFocus);
  }

  function closeDrawer(){
    drawer.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded','false');
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', trapFocus);
    // use transition end or timeout as fallback
    if (duration === 0) {
      drawer.hidden = true;
      drawer.setAttribute('aria-hidden','true');
    } else {
      drawer.addEventListener('transitionend', onTransitionEnd);
      closingTimer = setTimeout(() => {
        drawer.hidden = true;
        drawer.setAttribute('aria-hidden','true');
        drawer.removeEventListener('transitionend', onTransitionEnd);
      }, duration + 80);
    }
    if (lastFocused) { try { lastFocused.focus({preventScroll:true}); } catch(e){} }
  }

  openBtn.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  // Close if user clicks links inside the panel (optional)
  panel.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (a && a.getAttribute('href') && !a.getAttribute('target')) closeDrawer();
  });
})();