const { list } = require("@vercel/blob");
const { CATEGORIES } = require("./lib/categories");

module.exports = async function handler(req, res) {
  const result = {};

  await Promise.all(
    CATEGORIES.map(async ({ key }) => {
      try {
        const { blobs } = await list({ prefix: `${key}/` });
        result[key] = blobs
          .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
          .map((b) => ({ url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt }));
      } catch {
        // Blob storage not configured yet, or a transient error — the
        // public site just falls back to its baked-in defaults for this
        // category instead of failing the whole request.
        result[key] = [];
      }
    })
  );

  res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
  res.status(200).json(result);
};
