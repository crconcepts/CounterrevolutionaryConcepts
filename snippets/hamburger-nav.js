// Drawer controller with delegated binding and ARIA state
(() => {
  const qs  = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
  let guardUntil = 0, lastUp = 0;
  const now = () => (performance && performance.now) ? performance.now() : Date.now();

  function els(){
    const drawer = qs('#nav-drawer');
    return {
      drawer,
      panel:    drawer && qs('.nav-drawer__panel', drawer),
      backdrop: drawer && qs('.nav-drawer__backdrop', drawer),
    };
  }

  function trap(panel){
    const SEL = ['a[href]','button:not([disabled])','input:not([disabled])','select:not([disabled])','textarea:not([disabled])','[tabindex]:not([tabindex="-1"])'].join(',');
    const list = qsa(SEL, panel).filter(el => el.offsetParent !== null);
    const first = list[0] || panel, last = list[list.length-1] || panel;
    function onKey(e){
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      } else if (e.key === 'Escape') { e.preventDefault(); close(); }
    }
    panel.addEventListener('keydown', onKey);
    panel.__untrap = () => panel.removeEventListener('keydown', onKey);
    (first || panel).focus({ preventScroll: true });
  }

  function reallyClose(drawer, panel, opener){
    drawer.hidden = true;
    document.body.classList.remove('body-lock');
    if (panel && panel.__untrap) { panel.__untrap(); delete panel.__untrap; }
    if (opener && opener.focus) opener.focus({ preventScroll: true });
    opener?.setAttribute('aria-expanded','false');
  }

  function open(opener){
    const {drawer, panel} = els(); if (!drawer || !panel) return;
    drawer.hidden = false;
    document.body.classList.add('body-lock');
    opener?.setAttribute('aria-expanded','true');
    guardUntil = now() + 450;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      drawer.setAttribute('aria-hidden','false'); // style.css responds to this
      drawer.__opener = opener || document.activeElement;
      trap(panel);
    }));
  }

  function close(){
    const {drawer, panel} = els(); if (!drawer || !panel) return;
    if (now() < guardUntil) return;
    drawer.setAttribute('aria-hidden','true');
    const opener = drawer.__opener;
    const onEnd = e => { if (e.propertyName && e.propertyName !== 'transform') return;
      panel.removeEventListener('transitionend', onEnd);
      reallyClose(drawer, panel, opener);
    };
    panel.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(onEnd, 500);
  }

  function init(){
    const {drawer, panel, backdrop} = els(); if (!drawer || !panel) return;
    drawer.hidden = true; drawer.setAttribute('aria-hidden','true');

    // Delegated open: any control with aria-controls="nav-drawer"
    document.addEventListener('click', e => {
      const opener = e.target.closest('[aria-controls="nav-drawer"]');
      if (!opener) return;
      e.preventDefault(); open(opener);
    });
    document.addEventListener('pointerup', e => {
      if (e.target.closest('[aria-controls="nav-drawer"]')) lastUp = now();
    });

    backdrop?.addEventListener('click', () => { if (now()-lastUp < 300) return; close(); });
    qsa('[data-close], .drawer-close', drawer).forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); close(); }));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') { e.preventDefault(); close(); }
    }, { capture: true });
  }

  (document.readyState === 'loading') ? document.addEventListener('DOMContentLoaded', init) : init();
})();