// ------------------------------------------------------------------
// Applies admin-panel content (logo, hero, gallery photos/clips) on
// top of the site's static defaults.
//
// Rule: for a given photo/video category, if the admin panel has ANY
// uploaded items for it, those items REPLACE the static ones baked
// into the page (no duplicates). If the admin hasn't touched that
// category yet, the static defaults already in the HTML are left
// exactly as they are.
//
// Fails silently if the admin panel hasn't been set up yet, or the
// API isn't reachable (e.g. viewing the site off Vercel) — the static
// content already in the page keeps working either way.
// ------------------------------------------------------------------
(async function () {
  let data;
  try {
    const res = await fetch("/api/gallery-data");
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return;
  }

  const logo = data["site/logo"] && data["site/logo"][0];
  if (logo) {
    document.querySelectorAll('img[src*="logo-official.jpg"]').forEach((img) => {
      img.src = logo.url;
    });
  }

  const hero = data["site/hero"] && data["site/hero"][0];
  const heroImg = document.querySelector(".hero-media img");
  if (hero && heroImg) {
    heroImg.src = hero.url;
  }

  // Derives a human label from an uploaded file's storage path, e.g.
  // "photos/copii-postari-18-19/1788300000000-doroftei-matei.jpg"
  // -> "Doroftei Matei". Falls back to null if nothing usable remains.
  function labelFromPathname(pathname) {
    const filename = (pathname || "").split("/").pop() || "";
    const withoutExt = filename.replace(/\.[a-zA-Z0-9]+$/, "");
    const withoutTimestamp = withoutExt.replace(/^\d{10,}-/, "");
    const words = withoutTimestamp.replace(/[-_]+/g, " ").trim();
    if (!words) return null;
    return words.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const photoCategoryKeys = [
    "grupa-2012-2013",
    "grupa-2016-2017",
    "grupa-2018-2019",
    "copii-postari-18-19",
    "staff-tehnic",
  ];

  photoCategoryKeys.forEach((categoryKey) => {
    const grid = document.querySelector(`.photo-grid[data-category="${categoryKey}"]`);
    const items = data[`photos/${categoryKey}`];
    if (!grid || !items || !items.length) return;

    grid.innerHTML = "";

    items.forEach((item) => {
      const figure = document.createElement("figure");
      figure.className = "photo-item";

      const img = document.createElement("img");
      img.src = item.url;
      img.loading = "lazy";

      const derivedLabel = categoryKey === "copii-postari-18-19" ? labelFromPathname(item.pathname) : null;
      img.alt = derivedLabel || grid.dataset.alt || "Poză A.C. Club Neamț";
      figure.appendChild(img);

      if (derivedLabel) {
        const caption = document.createElement("figcaption");
        caption.textContent = derivedLabel;
        figure.appendChild(caption);
      }

      grid.appendChild(figure);
    });
  });

  const videoGrid = document.querySelector(".video-grid");
  const clips = data["video/clips"];
  if (videoGrid && clips && clips.length) {
    videoGrid.innerHTML = "";

    clips.forEach((clip) => {
      const card = document.createElement("div");
      card.className = "video-card";

      const embed = document.createElement("div");
      embed.className = "video-embed";

      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;

      const source = document.createElement("source");
      source.src = clip.url;
      source.type = "video/mp4";
      video.appendChild(source);
      embed.appendChild(video);

      const caption = document.createElement("p");
      caption.className = "video-card-caption";
      caption.textContent = labelFromPathname(clip.pathname) || "Antrenament";

      card.appendChild(embed);
      card.appendChild(caption);
      videoGrid.appendChild(card);
    });
  }
})();
