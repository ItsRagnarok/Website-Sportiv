const { del } = require("@vercel/blob");
const { isAuthenticated } = require("./lib/auth");

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Neautentificat. Te rugăm intră din nou în panoul de admin." });
    return;
  }

  const { url } = await readJsonBody(req);

  if (!url || typeof url !== "string" || !url.startsWith("https://")) {
    res.status(400).json({ error: "URL invalid." });
    return;
  }

  try {
    await del(url);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Eroare la ștergere: " + (err && err.message ? err.message : String(err)) });
  }
};
