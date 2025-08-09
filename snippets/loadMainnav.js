<script>
(() => {
  // 1) Respect embedded mode (same behavior as your original)
  if (document.documentElement.classList.contains("embedded-mode")) return;
  const isEmbedded = new URLSearchParams(location.search).get("embedded") === "true";
  if (isEmbedded) {
    document.documentElement.classList.add("embedded-mode");
    return;
  }

  // 2) Mount point
  const mount = document.getElementById("mainnav");
  if (!mount) return;

  // 3) Always fetch from ROOT so it works in subfolders
  fetch("/snippits/mainnav.html", { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error("mainnav fetch " + res.status);
      return res.text();
    })
    .then(html => {
      // 4) Parse the fetched HTML
      const doc = new DOMParser().parseFromString(html, "text/html");
      const nav = doc.querySelector("nav.mainnav");
      if (!nav) throw new Error("No <nav class='mainnav'> in /snippits/mainnav.html");

      // 5) Normalize all links to root-absolute (defensive)
      nav.querySelectorAll("a[href]").forEach(a => {
        const href = a.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("/")) {
          a.setAttribute("href", "/" + href.replace(/^\/+/, ""));
        }
      });

      // 6) Inject the nav (replacing any previous content)
      mount.innerHTML = "";
      mount.appendChild(nav);

      // 7) Active-link highlight (handles '/' vs '/index.html')
      const current = location.pathname.replace(/\/+$/, "") || "/";
      mount.querySelectorAll("a[href]").forEach(a => {
        const path = new URL(a.href, location.origin).pathname.replace(/\/+$/, "") || "/";
        if (
          path === current ||
          (current === "/" && (path === "/" || path === "/index.html"))
        ) {
          a.classList.add("active");
        }
      });

      // 8) Execute any external <script src="..."> found in the fetched HTML
      //    (e.g. /snippits/hamburger-nav.js). Inline scripts in mainnav.html are ignored on purpose.
      const externalScripts = doc.querySelectorAll('script[src]');
      externalScripts.forEach(s => {
        const script = document.createElement('script');
        script.src = s.src;               // preserves absolute path like /snippits/hamburger-nav.js
        script.async = false;             // keep order
        document.body.appendChild(script);
      });
    })
    .catch(err => console.error("Failed to insert mainnav:", err));
})();
</script>