import { useContext, useEffect, useMemo, useState } from "react";
import { ProductContext } from "../../../Context/ProductContext";
import styles from "./ProductTable.module.css";
import { AuthContext } from "../../../Context/AuthContext.jsx";
import { uploadImages } from "../../../Services/productsService.js"; 
import { toast } from "react-toastify";

const emptyVariant = {
  color: "",
  images: [],
  sizes: [
    { size: "S", totalQty: 0, reservedQty: 0 },
    { size: "M", totalQty: 0, reservedQty: 0 },
  ],
};

const emptyCoupon = {
  code: "",
  discountType: "percent",
  value: 0,
  minPurchase: 0,
  maxDiscount: null,
  expiryDate: "",
  isActive: true,
};

export default function ProductTable() {
  const {
    products,
    categories,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useContext(ProductContext) || {};
  const { user, token } = useContext(AuthContext);

  const rowsFromCtx = Array.isArray(products) ? products : [];
  const [rows, setRows] = useState(rowsFromCtx);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setRows(rowsFromCtx);
  }, [rowsFromCtx]);

  const allCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  const openEdit = (p) => {
    setCurrent(p || null);
    const seed = {
      _id: p?._id || null,
      title: p?.title || "",
      slug: p?.slug || "",
      sku: p?.sku || "",
      description: p?.description || "",
      brand: p?.brand || "",
      category: p?.category?._id || p?.category || "",
      parentCategory: p?.parentCategory?._id || p?.parentCategory || "",
      tags: Array.isArray(p?.tags) ? p.tags.join(", ") : "",
      price: p?.price ?? 0,
      discountPrice: p?.discountPrice ?? "",
      stock: {
        totalQty: p?.stock?.totalQty ?? 0,
        reservedQty: p?.stock?.reservedQty ?? 0,
        lowStockThreshold: p?.stock?.lowStockThreshold ?? 5,
        isInStock: p?.stock?.isInStock ?? true,
      },
      variants:
        Array.isArray(p?.variants) && p.variants.length
          ? p.variants.map((v) => ({
              ...v,
              images: Array.isArray(v.images) ? v.images : [],
              sizes: Array.isArray(v.sizes)
                ? v.sizes.map((s) => ({
                    size: s.size || "",
                    totalQty: Number(s.totalQty) || 0,
                    reservedQty: Number(s.reservedQty) || 0,
                  }))
                : [],
            }))
          : [emptyVariant],
      coupons: Array.isArray(p?.coupons)
        ? p.coupons.map((c) => ({
            ...c,
            expiryDate: c.expiryDate
              ? new Date(c.expiryDate).toISOString().slice(0, 10)
              : "",
          }))
        : [],
      offer: {
        discountType: p?.offer?.discountType || "",
        value: p?.offer?.value ?? 0,
        startDate: p?.offer?.startDate ? p.offer.startDate.slice(0, 10) : "",
        endDate: p?.offer?.endDate ? p.offer.endDate.slice(0, 10) : "",
        isActive: !!p?.offer?.isActive,
      },
      isFeatured: !!p?.isFeatured,
      
      details: p?.details
        ? Object.entries(p.details).map(([key, value]) => ({ key, value }))
        : [],
      gst: p?.gst || 0,
    };
    setForm(seed);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setCurrent(null);
    setForm(null);
  };

  const slugify = (str) =>
    str
      ?.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const setOffer = (k, v) =>
    setForm((prev) => ({ ...prev, offer: { ...prev.offer, [k]: v } }));

  const setStock = (k, v) =>
    setForm((prev) => ({ ...prev, stock: { ...prev.stock, [k]: v } }));

  const changeVariant = (idx, patch) =>
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx ? { ...v, ...patch } : v
      ),
    }));

  const addVariant = () =>
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, emptyVariant],
    }));

  const removeVariant = (idx) =>
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));

  const changeVariantImage = (variantIdx, imageIdx, url) =>
    setForm((prev) => {
      const newVariants = prev.variants.map((v, i) => {
        if (i === variantIdx) {
          const newImages = [...v.images];
          newImages[imageIdx] = {
            url,
            alt:
              newImages[imageIdx]?.alt ||
              (v.color
                ? `${v.color} product image ${imageIdx + 1}`
                : `product image ${imageIdx + 1}`),
          };
          return { ...v, images: newImages };
        }
        return v;
      });
      return { ...prev, variants: newVariants };
    });

  const addImageToVariant = (variantIdx) =>
    setForm((prev) => {
      const newVariants = prev.variants.map((v, i) => {
        if (i === variantIdx) {
          const existing = Array.isArray(v.images) ? v.images : [];
          return { ...v, images: [...existing, { url: "", alt: "" }] };
        }
        return v;
      });
      return { ...prev, variants: newVariants };
    });

  const removeImageFromVariant = (variantIdx, imageIdx) =>
    setForm((prev) => {
      const newVariants = prev.variants.map((v, i) => {
        if (i === variantIdx) {
          const newImages = v.images.filter((_, j) => j !== imageIdx);
          return { ...v, images: newImages };
        }
        return v;
      });
      return { ...prev, variants: newVariants };
    });

  const changeCoupon = (idx, k, v) =>
    setForm((prev) => ({
      ...prev,
      coupons: prev.coupons.map((c, i) => (i === idx ? { ...c, [k]: v } : c)),
    }));

  const addCoupon = () =>
    setForm((prev) => ({ ...prev, coupons: [...prev.coupons, emptyCoupon] }));

  const removeCoupon = (idx) =>
    setForm((prev) => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== idx),
    }));
const addDetail = () =>
    setForm((prev) => ({
      ...prev,
      details: [...(Array.isArray(prev.details) ? prev.details : []), { key: "", value: "" }],
    }));

  const removeDetail = (idx) =>
    setForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== idx),
    }));

  const changeDetail = (idx, field, value) =>
    setForm((prev) => ({
      ...prev,
      details: prev.details.map((d, i) =>
        i === idx ? { ...d, [field]: value } : d
      ),
    }));
  const handleImageUpload = async (event, variantIdx, imageIdx) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    
    formData.append("images", file);

    setUploading(true);
    const uploadToast = toast.loading("Uploading image...");

    try {
      const res = await uploadImages(formData, token);

      if (res.files && res.files.length > 0) {
        const newUrl = res.files[0].url; 
        changeVariantImage(variantIdx, imageIdx, newUrl);

        toast.update(uploadToast, {
          render: "Upload successful!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        throw new Error("No file URL returned from server.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.update(uploadToast, {
        render: `Upload failed: ${err.message}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setUploading(false);
      event.target.value = null;
    }
  };

  const normalizePayload = () => {
    const payload = { ...form };

    payload.price = Number(payload.price) || 0;
    if (payload.discountPrice !== "")
      payload.discountPrice = Number(payload.discountPrice);
    else delete payload.discountPrice;

    if (typeof payload.tags === "string") {
      payload.tags = payload.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (!Array.isArray(payload.tags)) {
      payload.tags = [];
    }

    if (payload.offer) {
      payload.offer.startDate = payload.offer.startDate
        ? new Date(payload.offer.startDate).toISOString()
        : null;
      payload.offer.endDate = payload.offer.endDate
        ? new Date(payload.offer.endDate).toISOString()
        : null;
      if (!payload.offer.discountType) payload.offer.discountType = null;
    }

    if (
      !payload.parentCategory &&
      payload.category &&
      Array.isArray(categories)
    ) {
      const sub = categories.find((c) => c._id === payload.category);
      if (sub?.parentCategory) payload.parentCategory = sub.parentCategory;
    }

    if (payload.stock) {
      payload.stock.totalQty = Number(payload.stock.totalQty) || 0;
      payload.stock.reservedQty = Number(payload.stock.reservedQty) || 0;
      payload.stock.lowStockThreshold =
        Number(payload.stock.lowStockThreshold) || 5;
    }

    payload.variants = payload.variants.map((v) => ({
      ...v,
      images: v.images.filter((img) => img.url),
      sizes: Array.isArray(v.sizes)
        ? v.sizes.map((s) => ({
            size: s.size,
            totalQty: Number(s.totalQty) || 0,
            reservedQty: Number(s.reservedQty) || 0,
          }))
        : [],
    }));

    payload.coupons = payload.coupons
      .filter((c) => c.code && c.value > 0)
      .map((c) => ({
        ...c,
        value: Number(c.value) || 0,
        minPurchase: Number(c.minPurchase) || 0,
        maxDiscount:
          c.maxDiscount === null || c.maxDiscount === ""
            ? null
            : Number(c.maxDiscount) || 0,
        expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString() : null,
      }));

    return {
      title: payload.title,
      slug: payload.slug,
      sku: payload.sku,
      description: payload.description,
      brand: payload.brand,
      category: payload.category,
      parentCategory: payload.parentCategory || null,
      tags: payload.tags,
      price: payload.price,
      ...(payload.discountPrice !== undefined
        ? { discountPrice: payload.discountPrice }
        : {}),
      gst: payload.gst || 0,
      stock: payload.stock,
      variants: payload.variants,
      offer: payload.offer,
     coupons: payload.coupons,
      isFeatured: payload.isFeatured,
details: Array.isArray(payload.details)
  ? payload.details.reduce((acc, curr) => {
      const key = typeof curr?.key === "string"
        ? curr.key.trim()
        : String(curr?.key ?? "").trim();

      if (!key) return acc;

      const raw = curr?.value;
      const val =
        typeof raw === "string" ? raw.trim()
        : raw == null ? ""
        : (typeof raw === "object" ? JSON.stringify(raw) : String(raw));

      acc[key] = val;
      return acc;
    }, {})
  : (payload.details && typeof payload.details === "object" && !Array.isArray(payload.details)
      ? payload.details
      : {}),

    };
  };

  const refresh = async () => {
    setLoading(true);
    await refreshProducts();
    setLoading(false);
  };

  const save = async () => {
    const body = normalizePayload();
    console.log("product to added", body);

    if (current?._id) await updateProduct(current._id, body);
    else await addProduct(body);
    await refresh();
    close();
  };

  const remove = async (id) => {
    if (!confirm("Delete product?")) return;
    await deleteProduct(id);
    await refresh();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Products</h3>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => openEdit(null)}>
            + Add Product
          </button>
          <button className={styles.btn} onClick={refresh} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading ? (
        "Loading..."
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table} cellPadding="8">
            <thead className={styles.thead}>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>GST (%)</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className={styles.tr}>
                  <td data-label="Title">{p.title}</td>
                  <td data-label="Category">{p.category?.name || "-"}</td>
                  <td data-label="Price">₹{p.discountPrice ?? p.price}</td>
                  <td data-label="GST (%)">{p.gst ? `${p.gst}%` : "-"}</td>
                  <td data-label="Featured">{p.isFeatured ? "Yes" : "No"}</td>
                  <td data-label="Actions">
                    <div className={styles.actions}>
                      <button
                        className={styles.btn}
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.btn}
                        onClick={() => remove(p._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && form && (
        <div className={styles.modalBackdrop} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
                           {" "}
              <h3>{current?._id ? "Edit Product" : "Create Product"}</h3>       
                   {" "}
              <button
                className={styles.closeBtn}
                onClick={close}
                type="button"
                aria-label="Close modal"
              >
                                ✕              {" "}
              </button>
                         {" "}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <label>
                  Title
                  <input
                    value={form.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setField("title", newTitle);
                      setForm((prev) => {
                        const wasAutoGenerated =
                          !prev.slug ||
                          prev.slug === slugify(prev.title || "") ||
                          prev.slug === prev.title?.toLowerCase();

                        if (wasAutoGenerated) {
                          return { ...prev, slug: slugify(newTitle) };
                        }
                        return prev;
                      });
                    }}
                  />
                </label>

                <label>
                  Slug
                  <input
                    value={form.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                  />
                </label>
                <label>
                  SKU
                  <input
                    value={form.sku}
                    onChange={(e) => setField("sku", e.target.value)}
                  />
                </label>
                <label>
                  Brand
                  <input
                    value={form.brand}
                    onChange={(e) => setField("brand", e.target.value)}
                  />
                </label>
                <label>
                  Subcategory
                  <select
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {allCategories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Parent (optional _id)
                  <input
                    value={form.parentCategory || ""}
                    onChange={(e) => setField("parentCategory", e.target.value)}
                  />
                </label>

                <label>
                  Price (₹)
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                  />
                </label>

                <label>
                  Discount Price (₹)
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={(e) => setField("discountPrice", e.target.value)}
                  />
                </label>

                <label>
                  GST (%)
                  <input
                    type="number"
                    value={form.gst || ""}
                    onChange={(e) =>
                      setField("gst", Number(e.target.value) || 0)
                    }
                    placeholder="Enter GST in %"
                  />
                </label>

                <label>
                                    Tags (comma separated)                  {" "}
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setField("tags", e.target.value)}
                    placeholder="e.g. casual, cotton shirt, menswear"
                  />
                                 {" "}
                </label>
                <label className={styles.checkbox}>
                  Featured
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setField("isFeatured", e.target.checked)}
                  />
                </label>
              </div>

              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </label>

              <fieldset className={styles.fieldset}>
                <legend>Stock Management</legend>
                <div className={styles.stockContainer}>
                  <label>
                    Total Qty
                    <input
                      type="number"
                      value={form.stock.totalQty}
                      onChange={(e) => setStock("totalQty", e.target.value)}
                    />
                  </label>
                  <label>
                    Reserved Qty
                    <input
                      type="number"
                      value={form.stock.reservedQty}
                      onChange={(e) => setStock("reservedQty", e.target.value)}
                    />
                  </label>
                  <label>
                    Low Stock Threshold
                    <input
                      type="number"
                      value={form.stock.lowStockThreshold}
                      onChange={(e) =>
                        setStock("lowStockThreshold", e.target.value)
                      }
                    />
                  </label>
                  <label className={styles.checkbox}>
                    In Stock
                    <input
                      type="checkbox"
                      checked={form.stock.isInStock}
                      onChange={(e) => setStock("isInStock", e.target.checked)}
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className={styles.fieldset}>
                <legend>Offer</legend>
                <div className={styles.formGrid}>
                  <label>
                    Type
                    <select
                      value={form.offer.discountType || ""}
                      onChange={(e) => setOffer("discountType", e.target.value)}
                    >
                      <option value="">None</option>
                      <option value="percent">Percent</option>
                      <option value="flat">Flat</option>
                    </select>
                  </label>
                  <label>
                    Value
                    <input
                      type="number"
                      value={form.offer.value}
                      onChange={(e) =>
                        setOffer("value", Number(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label>
                    Start
                    <input
                      type="date"
                      value={form.offer.startDate || ""}
                      onChange={(e) => setOffer("startDate", e.target.value)}
                    />
                  </label>
                  <label>
                    End
                    <input
                      type="date"
                      value={form.offer.endDate || ""}
                      onChange={(e) => setOffer("endDate", e.target.value)}
                    />
                  </label>
                  <label className={styles.checkbox}>
                    Active
                    <input
                      type="checkbox"
                      checked={form.offer.isActive}
                      onChange={(e) => setOffer("isActive", e.target.checked)}
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className={styles.fieldset}>
                <legend>Variants</legend>
                {form.variants.map((v, idx) => (
                  <div key={idx} className={styles.variantContainer}>
                    <div className={styles.variantRowHeader}>
                      <label>
                        Color
                        <input
                          value={v.color || ""}
                          onChange={(e) =>
                            changeVariant(idx, { color: e.target.value })
                          }
                        />
                      </label>
                      <div className={styles.sizeTable}>
                        <h4>Sizes & Stock</h4>
                        <table className={styles.sizeTableInner}>
                          <thead>
                            <tr>
                              <th>Size</th>
                              <th>Total Qty</th>
                              <th>Reserved Qty</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {v.sizes.map((s, sIdx) => (
                              <tr key={sIdx}>
                                <td>
                                  <input
                                    type="text"
                                    value={s.size}
                                    onChange={(e) => {
                                      const newSizes = [...v.sizes];
                                      newSizes[sIdx].size = e.target.value;
                                      changeVariant(idx, { sizes: newSizes });
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={s.totalQty}
                                    onChange={(e) => {
                                      const newSizes = [...v.sizes];
                                      newSizes[sIdx].totalQty =
                                        Number(e.target.value) || 0;
                                      changeVariant(idx, { sizes: newSizes });
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={s.reservedQty}
                                    onChange={(e) => {
                                      const newSizes = [...v.sizes];
                                      newSizes[sIdx].reservedQty =
                                        Number(e.target.value) || 0;
                                      changeVariant(idx, { sizes: newSizes });
                                    }}
                                  />
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className={styles.btn}
                                    onClick={() => {
                                      const newSizes = v.sizes.filter(
                                        (_, i) => i !== sIdx
                                      );
                                      changeVariant(idx, { sizes: newSizes });
                                    }}
                                    style={{
                                      background: "#f8d7da",
                                      color: "#721c24",
                                    }}
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <button
                          type="button"
                          className={styles.btn}
                          onClick={() => {
                            const newSizes = [
                              ...v.sizes,
                              { size: "", totalQty: 0, reservedQty: 0 },
                            ];
                            changeVariant(idx, { sizes: newSizes });
                          }}
                        >
                          + Add Size
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => removeVariant(idx)}
                        style={{
                          alignSelf: "flex-end",
                          background: "#f8d7da",
                          color: "#721c24",
                        }}
                      >
                        Remove Variant
                      </button>
                    </div>

                    <div className={styles.imageSection}>
                      <h4>Images for {v.color || "New Variant"}</h4>
                      {v.images.map((img, imageIdx) => (
                        <div key={imageIdx} className={styles.imageInputRow}>
                          <label>
                            Image URL {imageIdx + 1}
                            <input
                              value={img.url || ""}
                              readOnly
                              placeholder="Upload an image to get URL"
                            />
                          </label>

                          <label className={styles.uploadBtnLabel}>
                            {uploading ? "..." : "Upload"}
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className={styles.fileInput}
                              disabled={uploading}
                              onChange={(e) =>
                                handleImageUpload(e, idx, imageIdx)
                              }
                            />
                          </label>

                          <button
                            type="button"
                            className={styles.btn}
                            onClick={() =>
                              removeImageFromVariant(idx, imageIdx)
                            }
                            style={{
                              alignSelf: "flex-end",
                              background: "#f8d7da",
                              color: "#721c24",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => addImageToVariant(idx)}
                      >
                        + Add Image URL
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.btn}
                  onClick={addVariant}
                  style={{ marginTop: "15px" }}
                >
                  + Add New Variant (Color)
                </button>
              </fieldset>

              <fieldset className={styles.fieldset}>
                <legend>Coupons</legend>
                {form.coupons.map((c, idx) => (
                  <div key={idx} className={styles.couponContainer}>
                    <div className={styles.couponGrid}>
                      <label>
                        Code (Required)
                        <input
                          value={c.code || ""}
                          onChange={(e) =>
                            changeCoupon(idx, "code", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Value (₹/%)
                        <input
                          type="number"
                          value={c.value}
                          onChange={(e) =>
                            changeCoupon(
                              idx,
                              "value",
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </label>
                      <label>
                        Type
                        <select
                          value={c.discountType}
                          onChange={(e) =>
                            changeCoupon(idx, "discountType", e.target.value)
                          }
                        >
                          <option value="percent">Percent (%)</option>
                          <option value="flat">Flat (₹)</option>
                        </select>
                      </label>
                      <label>
                        Min Purchase (₹)
                        <input
                          type="number"
                          value={c.minPurchase}
                          onChange={(e) =>
                            changeCoupon(
                              idx,
                              "minPurchase",
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </label>
                      <label>
                        Max Discount (₹, Optional)
                        <input
                          type="number"
                          value={c.maxDiscount === null ? "" : c.maxDiscount}
                          onChange={(e) =>
                            changeCoupon(
                              idx,
                              "maxDiscount",
                              e.target.value === ""
                                ? null
                                : Number(e.target.value) || 0
                            )
                          }
                        />
                      </label>
                      <label>
                        Expiry Date
                        <input
                          type="date"
                          value={c.expiryDate || ""}
                          onChange={(e) =>
                            changeCoupon(idx, "expiryDate", e.target.value)
                          }
                        />
                      </label>
                      <label className={styles.checkbox}>
                        Active
                        <input
                          type="checkbox"
                          checked={c.isActive}
                          onChange={(e) =>
                            changeCoupon(idx, "isActive", e.target.checked)
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => removeCoupon(idx)}
                        style={{
                          alignSelf: "flex-end",
                          background: "#f8d7da",
                          color: "#721c24",
                        }}
                      >
                        Remove Coupon
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.btn}
                  onClick={addCoupon}
                  style={{ marginTop: "15px" }}
                >
                  + Add New Coupon
                </button>
              </fieldset>

              <label>
                Details (JSON)
                <fieldset className={styles.fieldset}>
                <legend>Product Details (Specifications)</legend>
                {Array.isArray(form.details) && form.details.map((detail, idx) => (
                  <div key={idx} className={styles.detailRow}>
                    <input
                      type="text"
                      placeholder="Specification Name (e.g., Fabric)"
                      value={detail.key}
                      onChange={(e) => changeDetail(idx, "key", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Specification Value (e.g., Cotton)"
                      value={detail.value}
                      onChange={(e) =>
                        changeDetail(idx, "value", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeDetail(idx)}
                      className={styles.btnRemoveDetail}
                    >
                      ✕
                    </button>
                  </div>
              ))}
                <button
                  type="button"
                  className={styles.btn}
                  onClick={addDetail}
                  style={{ 
                    marginTop: "15px", 
                    background: "var(--success)", 
                    color: "white", 
                    border: "none" 
                  }}
                >
                  + Add Specification
                </button>
              </fieldset>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btn} onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
