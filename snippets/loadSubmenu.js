(() => {
  if (document.documentElement.classList.contains("embedded-mode")) return;
  const isEmbedded = new URLSearchParams(location.search).get("embedded") === "true";
  if (isEmbedded) { document.documentElement.classList.add("embedded-mode"); return; }

  const SNIPPETS = {
    rst: "/snippets/rst-submenu.html",
    metapolitics: "/snippets/metapolitics-submenu.html"
  };

  const mounts = Array.from(document.querySelectorAll(".submenu-mount[data-submenu-target]"));
  if (!mounts.length) return;

  const grouped = mounts.reduce((acc, el) => {
    const key = el.getAttribute("data-submenu-target");
    if (SNIPPETS[key]) (acc[key] ||= []).push(el);
    return acc;
  }, {});

  const fetchAndInsert = (key) => {
    return fetch(SNIPPETS[key], { cache: "no-store" })
      .then(res => { if (!res.ok) throw new Error(`Failed to fetch ${SNIPPETS[key]}`); return res.text(); })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const candidate = doc.querySelector(".submenu, .subnav");
        const submenu = candidate ? candidate.cloneNode(true) : null;
        if (!submenu) return;

        submenu.classList.add("submenu");

        const currentPath = window.location.pathname.replace(/\/+$/, "");
        submenu.querySelectorAll("a[href]").forEach(a => {
          const hrefPath = new URL(a.getAttribute("href"), window.location.origin).pathname.replace(/\/+$/, "");
          if (hrefPath === currentPath) a.classList.add("active");
        });

        (grouped[key] || []).forEach(mount => {
          const clone = submenu.cloneNode(true);
          mount.innerHTML = "";
          mount.appendChild(clone);
        });
      });
  };

  Promise.all(Object.keys(grouped).map(fetchAndInsert))
    .catch(err => console.error("Failed to insert submenu(s):", err));
})();