(() => {
  const root = document;
  const btn = root.querySelector('.hamburger');
  const drawer = root.getElementById('nav-drawer');
  if (!btn || !drawer) return;

  const panel   = drawer.querySelector('.nav-drawer__panel');
  const closeBtn= drawer.querySelector('.drawer-close');
  const backdrop= drawer.querySelector('.nav-drawer__backdrop');
  let lastFocus = null;

  const focusableSel = [
    'a[href]','button:not([disabled])','summary',
    '[tabindex]:not([tabindex="-1"])','input:not([disabled])','select:not([disabled])','textarea:not([disabled])'
  ].join(',');

  function trapFocus(e) {
    if (drawer.getAttribute('aria-hidden') === 'true') return;
    if (e.key !== 'Tab') return;
    const nodes = panel.querySelectorAll(focusableSel);
    if (!nodes.length) return;
    const first = nodes[0];
    const last  = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); }
    else { trapFocus(e); }
  }

  function afterClose() {
    drawer.hidden = true;                              // remove from flow/a11y after animation
    document.body.classList.remove('body-lock');
    btn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocus) lastFocus.focus();
  }

  function closeDrawer() {
    // Start slide-out / fade-out (keep element visible so it can animate)
    drawer.setAttribute('aria-hidden', 'true');

    const onEnd = (e) => {
      if (e.target !== panel) return;
      panel.removeEventListener('transitionend', onEnd);
      afterClose();
    };
    panel.addEventListener('transitionend', onEnd);

    // Failsafe in case transitionend doesn't fire
    setTimeout(() => { if (!drawer.hidden) afterClose(); }, 400);
  }

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;                             // allow CSS to animate
    // Next frame so the browser registers initial transform/opacity
    requestAnimationFrame(() => {
      drawer.setAttribute('aria-hidden', 'false');     // triggers transitions
    });
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('body-lock');
    document.addEventListener('keydown', onKeydown);

    const first = panel.querySelector(focusableSel);
    if (first) first.focus();
  }

  // Button toggle
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? closeDrawer() : openDrawer();
  });

  // Backdrop & Close button
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
})();