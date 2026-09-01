const crypto = require("crypto");

const SESSION_COOKIE = "admin_session";
const SESSION_DAYS = 7;

function getSecret() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD nu este setat în variabilele de mediu Vercel.");
  }
  return crypto.createHash("sha256").update(password).digest();
}

function signExpiry(expiry) {
  const hmac = crypto.createHmac("sha256", getSecret()).update(String(expiry)).digest("hex");
  return `${expiry}.${hmac}`;
}

function createSessionToken() {
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return signExpiry(expiry);
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;

  const [expiryStr, providedHmac] = token.split(".");
  const expiry = Number(expiryStr);
  if (!expiry || Number.isNaN(expiry) || Date.now() > expiry) return false;

  let expectedHmac;
  try {
    expectedHmac = signExpiry(expiry).split(".")[1];
  } catch {
    return false;
  }

  const a = Buffer.from(providedHmac, "hex");
  const b = Buffer.from(expectedHmac, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(val);
  });
  return cookies;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

function sessionCookieHeader(token) {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
    SESSION_DAYS * 24 * 60 * 60
  }`;
}

function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

module.exports = {
  createSessionToken,
  isAuthenticated,
  safeEqual,
  sessionCookieHeader,
  clearSessionCookieHeader,
};
