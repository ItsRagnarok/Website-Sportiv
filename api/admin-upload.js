const { put, list, del } = require("@vercel/blob");
const { isAuthenticated } = require("./lib/auth");
const { CATEGORY_KEYS, SINGLE_KEYS } = require("./lib/categories");

const MAX_BYTES = 15 * 1024 * 1024;

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(req.body)) {
      resolve(req.body);
      return;
    }
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Neautentificat. Te rugăm intră din nou în panoul de admin." });
    return;
  }

  const category = req.query.category;
  const filenameParam = req.query.filename || `upload-${Date.now()}`;

  if (!category || !CATEGORY_KEYS.has(category)) {
    res.status(400).json({ error: "Categorie invalidă." });
    return;
  }

  try {
    const body = await getRawBody(req);

    if (!body || body.length === 0) {
      res.status(400).json({ error: "Fișierul e gol." });
      return;
    }
    if (body.length > MAX_BYTES) {
      res.status(400).json({ error: "Fișier prea mare (limită 15MB)." });
      return;
    }

    // Logo/hero are single-image slots — clear whatever was there before.
    if (SINGLE_KEYS.has(category)) {
      const { blobs } = await list({ prefix: `${category}/` });
      await Promise.all(blobs.map((b) => del(b.url)));
    }

    const safeName = String(filenameParam).replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `${category}/${Date.now()}-${safeName}`;
    const contentType = req.headers["content-type"] || "application/octet-stream";

    const blob = await put(pathname, body, { access: "public", contentType });

    res.status(200).json({ ok: true, url: blob.url, pathname: blob.pathname });
  } catch (err) {
    res.status(500).json({ error: "Eroare la încărcare: " + (err && err.message ? err.message : String(err)) });
  }
}

// Uploads are sent as a raw binary body, not JSON — tell the Vercel Node
// runtime not to pre-parse it so the stream is still readable above.
handler.config = { api: { bodyParser: false } };

module.exports = handler;
