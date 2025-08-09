<script>
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
    'a[href]','button:not([disabled])','summary',
    '[tabindex]:not([tabindex="-1"])','input:not([disabled])','select:not([disabled])','textarea:not([disabled])'
  ].join(',');

  // ---- Drawer open/close & a11y
  function openDrawer() {
    lastFocus = root.activeElement;
    drawer.hidden = false;
    btn.setAttribute('aria-expanded','true');
    document.body.classList.add('body-lock');
    const first = panel.querySelector(focusableSel);
    (first || closeBtn || panel).focus();
    root.addEventListener('keydown', onKeydown);
  }
  function closeDrawer() {
    drawer.hidden = true;
    btn.setAttribute('aria-expanded','false');
    document.body.classList.remove('body-lock');
    root.removeEventListener('keydown', onKeydown);
    if (lastFocus) lastFocus.focus();
  }
  function onKeydown(e) {
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key !== 'Tab') return;
    const f = panel.querySelectorAll(focusableSel);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  btn.addEventListener('click', openDrawer);
  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  backdrop && backdrop.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', e => { if (e.target.closest('a[href]')) closeDrawer(); });

  // ---- Build submenus from sitemap.xml
  async function buildFromSitemap() {
    try {
      const res = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!res.ok) throw new Error('sitemap ' + res.status);
      const xml = await res.text();
      const dom = new window.DOMParser().parseFromString(xml, 'application/xml');

      const locs = Array.from(dom.querySelectorAll('url > loc')).map(n => n.textContent.trim());
      const resources = locs.filter(u => new URL(u).pathname.startsWith('/resources/'));
      const metapol = locs.filter(u => new URL(u).pathname.startsWith('/metapolitics/'));

      // Helpers: pretty titles from filenames
      const labelFromPath = (p) => {
        const name = p.split('/').pop().replace(/\.html$/,'');
        return decodeURIComponent(
          name
            .replace(/-/g,' ')
            .replace(/\b\w/g, c => c.toUpperCase())
        );
      };

      // Targets (create Details if missing)
      let resDetails = panel.querySelector('details.drawer-section[data-section="resources"]');
      let metaDetails = panel.querySelector('details.drawer-section[data-section="metapolitics"]');
      if (!resDetails) {
        resDetails = document.createElement('details');
        resDetails.className = 'drawer-section';
        resDetails.setAttribute('data-section','resources');
        resDetails.open = true;
        resDetails.innerHTML = '<summary>Resources</summary><ul></ul>';
        panel.appendChild(resDetails);
      }
      if (!metaDetails) {
        metaDetails = document.createElement('details');
        metaDetails.className = 'drawer-section';
        metaDetails.setAttribute('data-section','metapolitics');
        metaDetails.open = true;
        metaDetails.innerHTML = '<summary>Metapolitics</summary><ul></ul>';
        panel.appendChild(metaDetails);
      }

      const resUL = resDetails.querySelector('ul'); resUL.innerHTML = '';
      resources.forEach(u => {
        const p = new URL(u).pathname;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = p;
        a.textContent = labelFromPath(p);
        li.appendChild(a);
        resUL.appendChild(li);
      });

      const metaUL = metaDetails.querySelector('ul'); metaUL.innerHTML = '';
      // Optional desired order for metapolitics:
      const desiredOrder = [
        '/metapolitics/introduction.html',
        '/metapolitics/proceduralist-globalist-axis.html',
        '/metapolitics/deconstructionists.html',
        '/metapolitics/vitalists.html',
        '/metapolitics/restorationists.html',
        '/metapolitics/indifferentists.html',
        '/metapolitics/conclusion.html'
      ];
      const sortedMetapol =
        desiredOrder.filter(p => metapol.some(u => new URL(u).pathname === p))
        .concat(
          metapol
            .map(u => new URL(u).pathname)
            .filter(p => !desiredOrder.includes(p))
            .sort()
        );

      sortedMetapol.forEach(p => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = p;
        a.textContent = labelFromPath(p);
        li.appendChild(a);
        metaUL.appendChild(li);
      });

      // Highlight active link inside drawer
      const current = location.pathname.replace(/\/+$/,'');
      panel.querySelectorAll('.nav-drawer a').forEach(a => {
        const path = new URL(a.href, location.origin).pathname.replace(/\/+$/,'');
        if (path === current) a.style.fontWeight = 'bold';
      });

    } catch (err) {
      console.warn('Failed to build submenu from sitemap:', err);
    }
  }
  buildFromSitemap();
})();
</script>