(() => {
  // Step 1: Detect and handle embedded mode
  if (document.documentElement.classList.contains("embedded-mode")) return;
  const isEmbedded = new URLSearchParams(window.location.search).get("embedded") === "true";
  if (isEmbedded) {
    document.documentElement.classList.add("embedded-mode");
    return;
  }

  // Step 2: Determine path to mainnav file
  const path = window.location.pathname.includes("/resources/")
    ? "../snippets/mainnav.html"
    : "snippets/mainnav.html";

  // Step 3: Fetch and insert main navigation
  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error("Mainnav fetch failed with status " + res.status);
      return res.text();
    })
    .then(html => {
      const container = document.getElementById("mainnav");
      if (!container) return;

      container.innerHTML = html;

      // Step 4: Highlight active link
      const current = location.pathname.split("/").pop();
      container.querySelectorAll("a").forEach(link => {
        if (link.getAttribute("href") === current) {
          link.classList.add("active");
        }
      });
    })
    .catch(err => console.error("Failed to insert mainnav:", err));
})();