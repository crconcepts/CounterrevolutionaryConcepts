(() => {
  // Step 1: Avoid loading in embedded mode
  if (document.documentElement.classList.contains("embedded-mode")) return;
  const isEmbedded = new URLSearchParams(window.location.search).get("embedded") === "true";
  if (isEmbedded) {
    document.documentElement.classList.add("embedded-mode");
    return;
  }

  // Step 2: Resolve correct path to submenu file
  const path = window.location.pathname.includes("/resources/")
    ? "../snippets/project-submenu.html"
    : "snippets/project-submenu.html";

  // Step 3: Fetch and insert submenu
  fetch(path)
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

      // Step 4: Highlight active link
      const currentPath = window.location.pathname.replace(/\/+$/, "");
      submenu.querySelectorAll("a").forEach(link => {
        const hrefPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "");
        if (hrefPath === currentPath) {
          link.classList.add("active");
        }
      });

      // Step 5: Insert submenu into DOM
      const container = document.getElementById("project-submenu");
      if (container) {
        container.appendChild(submenu);
      } else {
        console.warn("No #project-submenu container found in page.");
      }
    })
    .catch(err => console.error("Failed to insert submenu:", err));
})();