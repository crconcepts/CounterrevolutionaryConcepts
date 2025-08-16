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

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('body-lock');
    const f = panel.querySelector(focusableSel);
    if (f) f.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeDrawer() {
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('body-lock');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocus) lastFocus.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeDrawer();
  }

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? closeDrawer() : openDrawer();
  });
  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // Build submenus from sitemap.xml
  async function buildFromSitemap() {
    try {
      const res = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!res.ok) throw new Error('Sitemap fetch failed');
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'application/xml');
      const urls = [...xml.querySelectorAll('url loc')].map(n => n.textContent);

      const sections = {
        project: urls.filter(u => /\/resources\//.test(u)),
        metapolitics: urls.filter(u => /\/metapolitics\//.test(u)),
      };

      const fill = (key) => {
        const ul = panel.querySelector(`.drawer-section[data-section="${key}"] ul`);
        if (!ul) return;
        ul.innerHTML = '';
        sections[key].forEach(u => {
          const a = document.createElement('a');
          a.href = u;
          a.textContent = decodeURIComponent(u.split('/').pop().replace('.html','').replace(/-/g,' '));
          const li = document.createElement('li'); li.appendChild(a); ul.appendChild(li);
        });
      };
      fill('project'); fill('metapolitics');

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