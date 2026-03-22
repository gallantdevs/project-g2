export const norm = (s) =>
  (s || "").toString().trim().toLowerCase().replace(/\s+/g, "-");

export const slugify = norm;

export const catSlugOf = (p) => {
  const c = p?.category;
  if (!c) return "";
  if (typeof c === "string") return slugify(c);
  return slugify(c.slug || c.name || "");
};

export const catTypeOf = (p) => {
  const c = p?.category;
  if (!c || typeof c === "string") return "";
  return (
    c.categoryType ||
    (c.parentCategory ? "subcategory" : "main") ||
    ""
  ).toLowerCase();
};

export const catNameOf = (p) => {
  const c = p?.category;
  if (!c) return "";
  return typeof c === "string" ? c : c.name || "";
};

export const facetByRoute = (slug, categoryName) => {
  const s = norm(slug || categoryName || "");
  if (s.includes("printed")) return "fit";
  if (s.includes("plain")) return "sleeves";
  if (s.includes("polo")) return "fit";
  return null;
};

export const inPriceBucket = (price, bucket) => {
  if (!bucket) return true;
  if (bucket === "0-499") return price <= 499;
  if (bucket === "500-799") return price >= 500 && price <= 799;
  if (bucket === "800-1199") return price >= 800 && price <= 1199;
  if (bucket === "1200+") return price >= 1200;
  return true;
};

export const toggleArrayValue = (setFn, arr, val) =>
  setFn(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
