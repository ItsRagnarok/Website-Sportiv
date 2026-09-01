// ------------------------------------------------------------------
// Applies admin-panel overrides (logo, hero) and additions (extra
// gallery photos/clips) on top of the site's static defaults.
//
// Fails silently if the admin panel hasn't been set up yet, or the API
// isn't reachable (e.g. viewing the site off Vercel) — the static
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

    items.forEach((item) => {
      const figure = document.createElement("figure");
      figure.className = "photo-item";
      const img = document.createElement("img");
      img.src = item.url;
      img.alt = grid.dataset.alt || "Poză A.C. Club Neamț";
      img.loading = "lazy";
      figure.appendChild(img);
      grid.appendChild(figure);
    });
  });

  const videoGrid = document.querySelector(".video-grid");
  const extraClips = data["video/clips"];
  if (videoGrid && extraClips && extraClips.length) {
    extraClips.forEach((clip) => {
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
      caption.textContent = "Antrenament";

      card.appendChild(embed);
      card.appendChild(caption);
      videoGrid.appendChild(card);
    });
  }
})();
