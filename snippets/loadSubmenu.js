<script>
(() => {
  // Step 1: Avoid loading in embedded mode (keep your existing behaviour)
  if (document.documentElement.classList.contains("embedded-mode")) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("embedded") === "true") {
    document.documentElement.classList.add("embedded-mode");
    return;
  }

  // Step 2: Map URL prefixes to submenu snippet + container ID
  const pathname = window.location.pathname;
  const maps = [
    { prefix: "/resources/",    snippet: "/snippets/project-submenu.html",      containerId: "project-submenu" },
    { prefix: "/metapolitics/", snippet: "/snippets/metapolitics-submenu.html", containerId: "metapolitics-submenu" }
  ];

  const match = maps.find(m => pathname.startsWith(m.prefix));
  if (!match) return; // no submenu for this path

  // Step 3: Fetch and parse submenu HTML
  fetch(match.snippet, { cache: "no-cache" })
    .then(res => {
      if (!res.ok) throw new Error("Submenu fetch failed with status " + res.status);
      return res.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const submenu = doc.querySelector("nav.subnav");
      if (!submenu) {
        console.warn("No <nav class='subnav'> found in submenu HTML.");
        return;
      }

      // Step 4: Highlight the active link
      const currentPath = window.location.pathname.replace(/\/+$/, "");
      submenu.querySelectorAll("a").forEach(link => {
        const hrefPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "");
        if (hrefPath === currentPath) link.classList.add("active");
      });

      // Step 5: Insert into correct container
      const container = document.getElementById(match.containerId);
      if (container) {
        container.appendChild(submenu);
      } else {
        console.warn(`No #${match.containerId} container found in page.`);
      }
    })
    .catch(err => console.error("Failed to insert submenu:", err));
})();
</script>