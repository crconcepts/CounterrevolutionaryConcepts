(() => {
  if (document.documentElement.classList.contains("embedded-mode")) return;
  const isEmbedded = new URLSearchParams(location.search).get("embedded") === "true";
  if (isEmbedded) { document.documentElement.classList.add("embedded-mode"); return; }

  const mount = document.getElementById("mainnav");
  if (!mount) return;

  fetch("/snippets/mainnav.html", { cache: "no-store" })
    .then(res => { if (!res.ok) throw new Error("Failed to fetch mainnav.html"); return res.text(); })
    .then(html => {
      // Parse so we can run external scripts afterwards
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      mount.innerHTML = doc.body.innerHTML;

      // Mark active link in inline (desktop) menu
      const current = window.location.pathname.replace(/\/+$/, "");
      mount.querySelectorAll(".mainnav-inline a").forEach(a => {
        const path = new URL(a.href, window.location.origin).pathname.replace(/\/+$/, "");
        if (path === current) a.classList.add("active");
      });

      // Execute external scripts from the fetched HTML (e.g., hamburger-nav.js)
      const externalScripts = doc.querySelectorAll('script[src]');
      externalScripts.forEach(s => {
        const script = document.createElement('script');
        script.src = s.getAttribute('src');
        script.async = false;
        document.body.appendChild(script);
      });
    })
    .catch(err => console.error("Failed to insert mainnav:", err));
})();