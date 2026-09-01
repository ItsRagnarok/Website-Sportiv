const { createSessionToken, safeEqual, sessionCookieHeader } = require("./lib/auth");

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

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({
      error: "Panoul de administrare nu este configurat încă (lipsește ADMIN_PASSWORD din Vercel).",
    });
    return;
  }

  const { password } = await readJsonBody(req);

  if (!password || !safeEqual(password, adminPassword)) {
    res.status(401).json({ error: "Parolă incorectă." });
    return;
  }

  const token = createSessionToken();
  res.setHeader("Set-Cookie", sessionCookieHeader(token));
  res.status(200).json({ ok: true });
};
