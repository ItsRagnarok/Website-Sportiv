// ------------------------------------------------------------------
// Admin panel: password login + upload/delete for site images & video.
// Mirrors the category list in api/lib/categories.js — keep both in sync.
// ------------------------------------------------------------------
const ADMIN_CATEGORIES = [
  { key: "site/logo", label: "Siglă site", hint: "Înlocuiește sigla din antet și subsol. O poză nouă o înlocuiește pe cea veche.", single: true, kind: "image" },
  { key: "site/hero", label: "Poză hero (Acasă)", hint: "Poza mare din capul paginii principale. O poză nouă o înlocuiește pe cea veche.", single: true, kind: "image" },
  { key: "video/clips", label: "Video galerie", hint: "Clipuri adăugate aici apar suplimentar în secțiunea Video din Galerie.", single: false, kind: "video" },
  { key: "photos/grupa-2012-2013", label: "Poze — Grupa 2012-2013", hint: "", single: false, kind: "image" },
  { key: "photos/grupa-2016-2017", label: "Poze — Grupa 2016-2017", hint: "", single: false, kind: "image" },
  { key: "photos/grupa-2018-2019", label: "Poze — Grupa 2018-2019", hint: "", single: false, kind: "image" },
  { key: "photos/copii-postari-18-19", label: "Poze — Copii postări 18-19", hint: "", single: false, kind: "image" },
  { key: "photos/staff-tehnic", label: "Poze — Staff tehnic", hint: "", single: false, kind: "image" },
];

const loginBox = document.getElementById("admin-login-box");
const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("admin-login-error");
const passwordInput = document.getElementById("admin-password");
const logoutBtn = document.getElementById("admin-logout");
const categoriesRoot = document.getElementById("admin-categories");

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
  categoriesRoot.hidden = false;
  renderCategories();
  loadAllData();
}

function showLoggedOut() {
  loginBox.hidden = false;
  logoutBtn.hidden = true;
  categoriesRoot.hidden = true;
  categoriesRoot.innerHTML = "";
}

function renderCategories() {
  categoriesRoot.innerHTML = "";
  ADMIN_CATEGORIES.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "admin-category";
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

    const dropzone = document.createElement("label");
    dropzone.className = "admin-dropzone";
    dropzone.textContent = cat.kind === "video"
      ? "Click sau trage aici un clip video (.mp4, max 15MB)"
      : "Click sau trage aici o poză (max 15MB)";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = cat.kind === "video" ? "video/*" : "image/*";
    dropzone.appendChild(fileInput);
    section.appendChild(dropzone);

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

    const status = document.createElement("p");
    status.className = "admin-status";
    section.appendChild(status);

    const grid = document.createElement("div");
    grid.className = "admin-thumb-grid";
    section.appendChild(grid);

    categoriesRoot.appendChild(section);
  });
}

function setStatus(section, message, type) {
  const status = section.querySelector(".admin-status");
  status.textContent = message || "";
  status.className = "admin-status" + (type ? ` ${type}` : "");
}

async function uploadFile(cat, file, section) {
  setStatus(section, "Se încarcă...", "");
  try {
    const params = new URLSearchParams({ category: cat.key, filename: file.name });
    const res = await fetch(`/api/admin-upload?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Eroare la încărcare.");
    setStatus(section, "Încărcat cu succes.", "success");
    loadCategoryData(cat, section);
  } catch (err) {
    setStatus(section, err.message || "Eroare la încărcare.", "error");
  }
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

function renderThumbs(cat, section, items) {
  const grid = section.querySelector(".admin-thumb-grid");
  grid.innerHTML = "";

  if (!items || !items.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "Niciun fișier încărcat încă.";
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

async function loadCategoryData(cat, section) {
  try {
    const res = await fetch("/api/gallery-data");
    const data = await res.json();
    renderThumbs(cat, section, data[cat.key]);
  } catch {
    renderThumbs(cat, section, []);
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
    const section = categoriesRoot.querySelector(`[data-key="${cat.key}"]`);
    if (section) renderThumbs(cat, section, data[cat.key]);
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
