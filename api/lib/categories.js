// Blob storage prefixes the admin panel is allowed to write to, and their
// human-readable labels for the admin UI. Add new categories here only.
const CATEGORIES = [
  { key: "site/logo", label: "Siglă site", single: true, kind: "image" },
  { key: "site/hero", label: "Poză hero (Acasă)", single: true, kind: "image" },
  { key: "video/clips", label: "Video galerie", single: false, kind: "video" },
  { key: "photos/grupa-2012-2013", label: "Poze — Grupa 2012-2013", single: false, kind: "image" },
  { key: "photos/grupa-2016-2017", label: "Poze — Grupa 2016-2017", single: false, kind: "image" },
  { key: "photos/grupa-2018-2019", label: "Poze — Grupa 2018-2019", single: false, kind: "image" },
  { key: "photos/copii-postari-18-19", label: "Poze — Copii postări 18-19", single: false, kind: "image" },
  { key: "photos/staff-tehnic", label: "Poze — Staff tehnic", single: false, kind: "image" },
];

const CATEGORY_KEYS = new Set(CATEGORIES.map((c) => c.key));
const SINGLE_KEYS = new Set(CATEGORIES.filter((c) => c.single).map((c) => c.key));

module.exports = { CATEGORIES, CATEGORY_KEYS, SINGLE_KEYS };
