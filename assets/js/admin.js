// ------------------------------------------------------------------
// Admin panel: password login + view/upload/delete for site images
// and video, with visibility into (and one-click import of) whatever
// is already baked into the site's HTML as static defaults.
//
// Mirrors the category list in api/lib/categories.js — keep both in
// sync when adding a category.
// ------------------------------------------------------------------

function numberedDefaults(dir, count, prefix) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const n = String(i).padStart(2, "0");
    items.push({ src: `${dir}/${n}.jpg`, filename: `${prefix}-${n}.jpg` });
  }
  return items;
}

const ADMIN_CATEGORIES = [
  {
    key: "site/logo",
    label: "Siglă site",
    hint: "Înlocuiește sigla din antet și subsol. O poză nouă o înlocuiește pe cea veche.",
    group: "Identitate site",
    single: true,
    kind: "image",
    fallbackSrc: "assets/img/logo-official.jpg",
  },
  {
    key: "site/hero",
    label: "Poză hero (Acasă)",
    hint: "Poza mare din capul paginii principale. O poză nouă o înlocuiește pe cea veche.",
    group: "Identitate site",
    single: true,
    kind: "image",
    fallbackSrc: "assets/img/hero.jpg",
  },
  {
    key: "video/clips",
    label: "Video galerie",
    hint: "Clipurile care apar în secțiunea Video din pagina Galerie.",
    group: "Galerie video",
    single: false,
    kind: "video",
    defaults: [
      { src: "assets/video/clip1.mp4", filename: "antrenament-grupa-2015-2016.mp4", poster: "assets/video/poster1.jpg" },
      { src: "assets/video/clip2.mp4", filename: "antrenament-exercitiu-cu-mingea.mp4", poster: "assets/video/poster2.jpg" },
      { src: "assets/video/clip3.mp4", filename: "antrenament-joc-pe-teren.mp4", poster: "assets/video/poster3.jpg" },
    ],
  },
  {
    key: "photos/grupa-2012-2013",
    label: "Grupa 2012-2013",
    hint: "",
    group: "Galerie foto",
    single: false,
    kind: "image",
    defaults: numberedDefaults("assets/img/galerie/grupa-2012-2013", 12, "poza"),
  },
  {
    key: "photos/grupa-2016-2017",
    label: "Grupa 2016-2017",
    hint: "",
    group: "Galerie foto",
    single: false,
    kind: "image",
    defaults: numberedDefaults("assets/img/galerie/grupa-2016-2017", 12, "poza"),
  },
  {
    key: "photos/grupa-2018-2019",
    label: "Grupa 2018-2019",
    hint: "",
    group: "Galerie foto",
    single: false,
    kind: "image",
    defaults: numberedDefaults("assets/img/galerie/grupa-2018-2019", 12, "poza"),
  },
  {
    key: "photos/copii-postari-18-19",
    label: "Copii postări 18-19",
    hint: "Fiecare poză e denumită după copilul din ea — numele apare automat sub poză pe site.",
    group: "Galerie foto",
    single: false,
    kind: "image",
    defaults: [
      { src: "assets/img/galerie/copii-postari-18-19/01.jpg", filename: "doroftei-matei.jpg" },
      { src: "assets/img/galerie/copii-postari-18-19/02.jpg", filename: "nicuta-matteo.jpg" },
      { src: "assets/img/galerie/copii-postari-18-19/03.jpg", filename: "edi-culbece.jpg" },
      { src: "assets/img/galerie/copii-postari-18-19/04.jpg", filename: "luca-oancea.jpg" },
      { src: "assets/img/galerie/copii-postari-18-19/05.jpg", filename: "todiras-casian.jpg" },
      { src: "assets/img/galerie/copii-postari-18-19/06.jpg", filename: "irian-dimitri.jpg" },
      { src: "assets/img/galerie/copii-postari-18-19/07.jpg", filename: "stachie-tudor.jpg" },
    ],
  },
  {
    key: "photos/staff-tehnic",
    label: "Staff tehnic",
    hint: "",
    group: "Galerie foto",
    single: false,
    kind: "image",
    defaults: numberedDefaults("assets/img/galerie/staff-tehnic", 12, "poza"),
  },
];

const loginBox = document.getElementById("admin-login-box");
const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("admin-login-error");
const passwordInput = document.getElementById("admin-password");
const logoutBtn = document.getElementById("admin-logout");
const layoutRoot = document.getElementById("admin-layout");
const sidebarRoot = document.getElementById("admin-sidebar");
const categoriesRoot = document.getElementById("admin-categories");

function categoryAnchor(key) {
  return "cat-" + key.replace(/\//g, "-");
}

async function checkSession() {
  try {
    const res = await fetch("/api/admin-session");
    const data = await res.json();
    return Boolean(data.authenticated);
  } catch {
    return false;
  }
}

function showLoggedIn() {
  loginBox.hidden = true;
  logoutBtn.hidden = false;
  layoutRoot.hidden = false;
  renderSidebar();
  renderCategories();
  loadAllData();
}

function showLoggedOut() {
  loginBox.hidden = false;
  logoutBtn.hidden = true;
  layoutRoot.hidden = true;
  sidebarRoot.innerHTML = "";
  categoriesRoot.innerHTML = "";
}

function renderSidebar() {
  sidebarRoot.innerHTML = "";
  let lastGroup = null;

  ADMIN_CATEGORIES.forEach((cat) => {
    if (cat.group !== lastGroup) {
      const groupTitle = document.createElement("p");
      groupTitle.className = "admin-sidebar-group";
      groupTitle.textContent = cat.group;
      sidebarRoot.appendChild(groupTitle);
      lastGroup = cat.group;
    }
    const link = document.createElement("a");
    link.href = `#${categoryAnchor(cat.key)}`;
    link.textContent = cat.label;
    sidebarRoot.appendChild(link);
  });
}

function renderCategories() {
  categoriesRoot.innerHTML = "";

  ADMIN_CATEGORIES.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "admin-category";
    section.id = categoryAnchor(cat.key);
    section.dataset.key = cat.key;

    const h2 = document.createElement("h2");
    h2.textContent = cat.label;
    section.appendChild(h2);

    if (cat.hint) {
      const hint = document.createElement("p");
      hint.className = "admin-category-hint";
      hint.textContent = cat.hint;
      section.appendChild(hint);
    }

    if (cat.single) {
      section.appendChild(buildSingleSlot(cat, section));
    } else {
      section.appendChild(buildImportBlock(cat, section));
      section.appendChild(buildDropzone(cat, section));

      const status = document.createElement("p");
      status.className = "admin-status";
      section.appendChild(status);

      const gridLabel = document.createElement("p");
      gridLabel.className = "admin-subheading";
      gridLabel.textContent = "Încărcate acum (poți șterge oricând):";
      section.appendChild(gridLabel);

      const grid = document.createElement("div");
      grid.className = "admin-thumb-grid";
      section.appendChild(grid);
    }

    categoriesRoot.appendChild(section);
  });
}

function buildSingleSlot(cat, section) {
  const row = document.createElement("div");
  row.className = "admin-single-slot";

  const preview = document.createElement("div");
  preview.className = "admin-current-preview";
  preview.innerHTML = `
    <span class="admin-current-label">Poza activă acum</span>
    <img alt="Poza curentă">
    <span class="admin-current-source"></span>
  `;
  row.appendChild(preview);

  row.appendChild(buildDropzone(cat, section));

  const wrapper = document.createElement("div");
  wrapper.appendChild(row);

  const status = document.createElement("p");
  status.className = "admin-status";
  wrapper.appendChild(status);

  return wrapper;
}

function buildDropzone(cat, section) {
  const dropzone = document.createElement("label");
  dropzone.className = "admin-dropzone";
  dropzone.textContent = cat.kind === "video"
    ? "Click sau trage aici un clip video (.mp4, max 15MB)"
    : "Click sau trage aici o poză (max 15MB)";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = cat.kind === "video" ? "video/*" : "image/*";
  dropzone.appendChild(fileInput);

  ["dragover", "dragenter"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, () => dropzone.classList.remove("dragover"))
  );
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) uploadFile(cat, file, section);
  });
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) uploadFile(cat, file, section);
    fileInput.value = "";
  });

  return dropzone;
}

function buildImportBlock(cat, section) {
  const block = document.createElement("div");
  block.className = "admin-import-block";
  block.hidden = true; // shown only if this category still has un-imported static defaults

  const note = document.createElement("p");
  note.className = "admin-import-note";
  const count = (cat.defaults || []).length;
  note.textContent = `Site-ul are deja ${count} ${cat.kind === "video" ? "clipuri" : "poze"} puse direct în cod, care nu apar mai jos și nu pot fi șterse de aici — pentru asta trebuie mai întâi importate în panou:`;
  block.appendChild(note);

  const previewStrip = document.createElement("div");
  previewStrip.className = "admin-static-preview-strip";
  (cat.defaults || []).forEach((item) => {
    if (cat.kind === "video") {
      const media = document.createElement("video");
      media.src = item.src;
      media.muted = true;
      if (item.poster) media.poster = item.poster;
      previewStrip.appendChild(media);
    } else {
      const media = document.createElement("img");
      media.src = item.src;
      previewStrip.appendChild(media);
    }
  });
  block.appendChild(previewStrip);

  const importBtn = document.createElement("button");
  importBtn.type = "button";
  importBtn.className = "btn btn-primary admin-import-btn";
  importBtn.textContent = `Importă cele ${count} ${cat.kind === "video" ? "clipuri" : "poze"} implicite`;
  importBtn.addEventListener("click", () => importDefaults(cat, section, importBtn));
  block.appendChild(importBtn);

  return block;
}

function setStatus(section, message, type) {
  const status = section.querySelector(".admin-status");
  if (!status) return;
  status.textContent = message || "";
  status.className = "admin-status" + (type ? ` ${type}` : "");
}

async function uploadBlob(cat, blob, filename, contentType) {
  const params = new URLSearchParams({ category: cat.key, filename });
  const res = await fetch(`/api/admin-upload?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": contentType || blob.type || "application/octet-stream" },
    body: blob,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Eroare la încărcare.");
  return data;
}

async function uploadFile(cat, file, section) {
  setStatus(section, "Se încarcă...", "");
  try {
    await uploadBlob(cat, file, file.name, file.type);
    setStatus(section, "Încărcat cu succes.", "success");
    loadCategoryData(cat, section);
  } catch (err) {
    setStatus(section, err.message || "Eroare la încărcare.", "error");
  }
}

async function importDefaults(cat, section, button) {
  const items = cat.defaults || [];
  button.disabled = true;
  for (let i = 0; i < items.length; i++) {
    setStatus(section, `Se importă ${i + 1}/${items.length}...`, "");
    try {
      const res = await fetch(items[i].src);
      const blob = await res.blob();
      await uploadBlob(cat, blob, items[i].filename, blob.type);
    } catch (err) {
      setStatus(section, `Eroare la importul fișierului ${i + 1}: ${err.message || err}`, "error");
      button.disabled = false;
      return;
    }
  }
  setStatus(section, "Import terminat.", "success");
  loadCategoryData(cat, section);
}

async function deleteItem(cat, item, section) {
  if (!window.confirm("Ștergi definitiv acest fișier?")) return;
  setStatus(section, "Se șterge...", "");
  try {
    const res = await fetch("/api/admin-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Eroare la ștergere.");
    setStatus(section, "Șters.", "success");
    loadCategoryData(cat, section);
  } catch (err) {
    setStatus(section, err.message || "Eroare la ștergere.", "error");
  }
}

function renderSingleSlot(cat, section, items) {
  const preview = section.querySelector(".admin-current-preview");
  const img = preview.querySelector("img");
  const sourceLabel = preview.querySelector(".admin-current-source");
  const current = items && items[0];

  if (current) {
    img.src = current.url;
    sourceLabel.textContent = "din panoul de admin — apasă mai jos ca s-o înlocuiești";
  } else {
    img.src = cat.fallbackSrc;
    sourceLabel.textContent = "implicită din site — nu a fost înlocuită încă";
  }
}

function renderThumbs(cat, section, items) {
  const grid = section.querySelector(".admin-thumb-grid");
  const importBlock = section.querySelector(".admin-import-block");

  if (importBlock) {
    const hasDefaults = (cat.defaults || []).length > 0;
    importBlock.hidden = !hasDefaults || Boolean(items && items.length);
  }

  if (!grid) return;
  grid.innerHTML = "";

  if (!items || !items.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "Niciun fișier încărcat din panou încă.";
    grid.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const thumb = document.createElement("div");
    thumb.className = "admin-thumb";

    const media = cat.kind === "video" ? document.createElement("video") : document.createElement("img");
    media.src = item.url;
    if (cat.kind === "video") media.muted = true;
    thumb.appendChild(media);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "admin-thumb-delete";
    delBtn.setAttribute("aria-label", "Șterge");
    delBtn.textContent = "×";
    delBtn.addEventListener("click", () => deleteItem(cat, item, section));
    thumb.appendChild(delBtn);

    grid.appendChild(thumb);
  });
}

function renderCategoryData(cat, section, items) {
  if (cat.single) {
    renderSingleSlot(cat, section, items);
  } else {
    renderThumbs(cat, section, items);
  }
}

async function loadCategoryData(cat, section) {
  try {
    const res = await fetch("/api/gallery-data");
    const data = await res.json();
    renderCategoryData(cat, section, data[cat.key]);
  } catch {
    renderCategoryData(cat, section, []);
  }
}

async function loadAllData() {
  let data = {};
  try {
    const res = await fetch("/api/gallery-data");
    data = await res.json();
  } catch {
    data = {};
  }
  ADMIN_CATEGORIES.forEach((cat) => {
    const section = categoriesRoot.querySelector(`[data-key="${CSS.escape(cat.key)}"]`);
    if (section) renderCategoryData(cat, section, data[cat.key]);
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  try {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Parolă incorectă.");
    passwordInput.value = "";
    showLoggedIn();
  } catch (err) {
    loginError.textContent = err.message || "Eroare la autentificare.";
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/admin-logout", { method: "POST" });
  } catch {
    // ignore — we still log the UI out below
  }
  showLoggedOut();
});

(async function init() {
  const authenticated = await checkSession();
  if (authenticated) {
    showLoggedIn();
  } else {
    showLoggedOut();
  }
})();
