(() => {
  const run = async () => {
    const menus = Array.from(document.querySelectorAll(".submenu"));
    if (!menus.length) return;

    const cache = new Map();

    const getTitleFor = async (href) => {
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return null;
        const key = url.pathname + url.search;
        if (cache.has(key)) return cache.get(key);

        const res = await fetch(url.toString(), { cache: "force-cache" });
        if (!res.ok) return null;
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, "text/html");
        const pageTitle = (doc.querySelector("title")?.textContent || "").trim();
        const h1Title = (doc.querySelector("h1")?.textContent || "").trim();
        const best = pageTitle || h1Title || null;
        cache.set(key, best);
        return best;
      } catch { return null; }
    };

    for (const menu of menus) {
      const links = Array.from(menu.querySelectorAll("a[href]"));
      await Promise.all(links.map(async (a) => {
        const title = await getTitleFor(a.getAttribute("href"));
        if (title) a.textContent = title;
      }));
    }
  };

  if (document.readyState === "complete" || document.readyState === "interactive") run();
  else document.addEventListener("DOMContentLoaded", run);
})();