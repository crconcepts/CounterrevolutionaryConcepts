/* Hamburger / Drawer controller
   - Works with:
     <button class="hamburger" aria-controls="nav-drawer" aria-expanded="false"></button>
     <div id="nav-drawer" class="nav-drawer" hidden aria-hidden="true" role="dialog" aria-modal="true">
       <div class="nav-drawer__backdrop" data-close></div>
       <aside class="nav-drawer__panel" role="document"> ... </aside>
     </div>
*/
(function () {
  const onReady = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  onReady(() => {
    const hamburger = document.querySelector(".hamburger");
    const drawerId = (hamburger && hamburger.getAttribute("aria-controls")) || "nav-drawer";
    const drawer = document.getElementById(drawerId);
    if (!hamburger || !drawer) return;

    const panel = drawer.querySelector(".nav-drawer__panel");
    const backdrop = drawer.querySelector(".nav-drawer__backdrop");

    // Ensure safe closed baseline
    drawer.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");

    let lastOpener = null;

    function openDrawer(opener) {
      if (!drawer) return;
      lastOpener = opener || document.activeElement;
      drawer.hidden = false;                 // participate in layout first
      // double RAF to guarantee a transition after removing [hidden]
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawer.setAttribute("aria-hidden", "false"); // -> CSS transitions run
          document.body.classList.add("body-lock");
          hamburger.setAttribute("aria-expanded", "true");
          // Focus first focusable in panel after transition start
          const first = panel && panel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (first) first.focus({ preventScroll: true });
        });
      });
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("body-lock");
      hamburger.setAttribute("aria-expanded", "false");
      const onEnd = (e) => {
        if (e && e.target !== panel) return;
        drawer.hidden = true;
        panel && panel.removeEventListener("transitionend", onEnd);
        if (lastOpener && typeof lastOpener.focus === "function") {
          lastOpener.focus({ preventScroll: true });
        }
      };
      panel && panel.addEventListener("transitionend", onEnd);
      // Fallback timeout in case transitionend doesn't fire
      setTimeout(onEnd, 400);
    }

    // Wire click
    hamburger.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = drawer.getAttribute("aria-hidden") === "false";
      if (isOpen) closeDrawer();
      else openDrawer(e.currentTarget);
    });

    // Backdrop & explicit close buttons
    drawer.addEventListener("click", (e) => {
      if (e.target && (e.target.hasAttribute("data-close") || e.target.closest(".drawer-close"))) {
        e.preventDefault();
        closeDrawer();
      }
    });

    // ESC to close
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.getAttribute("aria-hidden") === "false") {
        e.preventDefault();
        closeDrawer();
      }
    });

    // Expose for debugging if needed
    window.__drawer = { openDrawer, closeDrawer, drawer };
  });
})();
