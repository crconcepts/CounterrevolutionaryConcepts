(() => {
  if (document.documentElement.classList.contains("embedded-mode")) return;
  const isEmbedded = new URLSearchParams(location.search).get("embedded") === "true";
  if (isEmbedded) { document.documentElement.classList.add("embedded-mode"); return; }

  const map = [
    { pathTest: /\/romansolartime\.html|\/resources\//, snippet: "/snippets/project-submenu.html",       containerId: "project-submenu" },
    { pathTest: /\/metapolitics\//,                      snippet: "/snippets/metapolitics-submenu.html", containerId: "metapolitics-submenu" },
  ];

  const match = map.find(m => m.pathTest.test(location.pathname));
  if (!match) return;

  fetch(match.snippet, { cache: "no-store" })
    .then(res => { if (!res.ok) throw new Error("Failed to fetch submenu"); return res.text(); })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const submenu = doc.querySelector(".submenu");
      if (!submenu) return;

      // Mark active link
      const currentPath = window.location.pathname.replace(/\/+$/, "");
      submenu.querySelectorAll("a").forEach(link => {
        const hrefPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "");
        if (hrefPath === currentPath) link.classList.add("active");
      });

      const container = document.getElementById(match.containerId);
      if (container) container.appendChild(submenu);
      else console.warn(`No #${match.containerId} container found in page.`);
    })
    .catch(err => console.error("Failed to insert submenu:", err));
})();