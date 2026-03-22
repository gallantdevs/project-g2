import React, { useContext, useEffect, useMemo, useState } from "react";
import { ComboContext } from "../../Context/ComboContext";
import { ProductContext } from "../../Context/ProductContext";
import styles from "./ComboManager.module.css";
import { AuthContext } from "../../Context/AuthContext";

const emptyForm = {
  name: "",
  slug: "",
  comboPrice: "",
  minSelection: 2,
  maxSelection: 2,
  products: [],
  section: null,
  isActive: true,
  thumbnailImage: "",
};

export default function ComboManager() {
  const {
    combos,
    addCombo,
    editCombo,
    removeCombo,
    fetchCombos,
    loading,
    error,
  } = useContext(ComboContext);
  const { products } = useContext(ProductContext);
  const { user, token } = useContext(AuthContext);

  const [form, setForm] = useState(emptyForm);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchCombos();
  }, []);

  const filteredProducts = useMemo(() => {
    return Array.isArray(products)
      ? products.filter((p) =>
          p.variants?.some(
            (v) => Array.isArray(v.images) && v.images.length > 0
          )
        )
      : [];
  }, [products]);

  const openEdit = (combo) => {
    if (combo) {
      setCurrent(combo);
      setForm({
        name: combo.name,
        slug: combo.slug,
        comboPrice: combo.comboPrice,
        minSelection: combo.minSelection,
        maxSelection: combo.maxSelection,
        products: Array.isArray(combo.products)
          ? combo.products.map((p) => p._id || p)
          : [],
        section: combo.section?._id || combo.section || null,
        isActive: combo.isActive,
        thumbnailImage: combo.thumbnailImage || "",
      });
      setPreview(combo.thumbnailImage || "");
      setImageFile(null);
    } else {
      setCurrent(null);
      setForm(emptyForm);
      setPreview("");
      setImageFile(null);
    }
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setForm(emptyForm);
    setCurrent(null);
    setImageFile(null);
    setPreview("");
  };

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const setField = (key, value) => {
    setForm((prev) => {
      if (key === "name") {
        const autoSlug = generateSlug(value);
        return { ...prev, name: value, slug: autoSlug };
      }
      return { ...prev, [key]: value };
    });
  };

  const toggleProductSelection = (id) => {
    setIsUpdating(true);
    setForm((prev) => {
      const exists = prev.products.includes(id);
      const updated = exists
        ? prev.products.filter((pid) => pid !== id)
        : [...prev.products, id];
      return { ...prev, products: updated };
    });
    setTimeout(() => setIsUpdating(false), 120);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allowedRoles = ["admin", "subadmin"];
    if (!user || !token || !allowedRoles.includes(user.role)) {
      return alert("Unauthorized: Admin role required.");
    }

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("slug", form.slug);
    formData.append("comboPrice", Number(form.comboPrice));
    formData.append("minSelection", Number(form.minSelection));
    formData.append("maxSelection", Number(form.maxSelection));
    formData.append("isActive", form.isActive);
    if (form.section) {
      formData.append("section", form.section);
    }

    if (!Array.isArray(form.products) || form.products.length === 0) {
      alert("Please select at least one product for this combo.");
      return;
    }
    form.products.forEach((productId) => {
      formData.append("products", productId);
    });

    if (imageFile) {
      formData.append("thumbnailImage", imageFile);
    } else if (current?._id && form.thumbnailImage) {
      formData.append("thumbnailImage", form.thumbnailImage);
    } else if (!current?._id && !imageFile) {
      alert("Please select a thumbnail image for the new combo.");
      return;
    }

    try {
      if (current?._id) {
        await editCombo(current._id, formData);
      } else {
        await addCombo(formData);
      }

      close();
      fetchCombos();
    } catch (err) {
      console.error("Combo save error:", err);
      alert(`Failed to save combo: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    const allowedRoles = ["admin", "subadmin"];
    if (!user || !token || !allowedRoles.includes(user.role)) {
      return alert("Unauthorized: Admin role required.");
    }

    if (window.confirm("Are you sure you want to delete this combo?")) {
      await removeCombo(id);
      fetchCombos();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🎁 Combo Manager</h3>
        <div className={styles.actions}>
          <button className={styles.btnAdd} onClick={() => openEdit(null)}>
            ➕ Add Combo
          </button>
          <button
            className={styles.btnRefresh}
            onClick={fetchCombos}
            disabled={loading}
          >
            {loading ? "⏳ Loading..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>⏳ Loading combos...</p>
        </div>
      ) : combos.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>📦 No combos available</p>
          <p className={styles.emptySubtext}>Click "+ Add Combo" to create one</p>
        </div>
      ) : (
        <div className={styles.comboGrid}>
          {combos.map((combo) => (
            <div key={combo._id} className={styles.comboCard}>
              <div className={styles.cardThumb}>
                {combo.thumbnailImage ? (
                  <img
                    src={combo.thumbnailImage}
                    alt={combo.name}
                    className={styles.thumbImg}
                  />
                ) : (
                  <div className={styles.thumbPlaceholder}>No Image</div>
                )}
              </div>

              <div className={styles.cardContent}>
                <h4 className={styles.cardTitle}>{combo.name}</h4>

                <p className={styles.cardSlug}>{combo.slug}</p>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Price</span>
                    <span className={styles.infoValue}>₹{combo.comboPrice}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Products</span>
                    <span className={styles.infoValue}>{combo.products?.length || 0}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status</span>
                    <span className={`${styles.infoValue} ${combo.isActive ? styles.active : styles.inactive}`}>
                      {combo.isActive ? "✅ Active" : "❌ Inactive"}
                    </span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.btnEdit}
                    onClick={() => openEdit(combo)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className={styles.btnDelete}
                    onClick={() => handleDelete(combo._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className={styles.modalBackdrop} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{current ? "✏️ Edit Combo" : "➕ Create Combo"}</h3>
              <button
                className={styles.closeBtn}
                onClick={close}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <label>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                  placeholder="Enter combo name"
                />
              </label>

              <label>
                Slug
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  required
                  placeholder="Auto-generated slug"
                />
              </label>

              <label>
                Combo Price (₹)
                <input
                  type="number"
                  value={form.comboPrice}
                  onChange={(e) => setField("comboPrice", e.target.value)}
                  required
                  placeholder="Enter price"
                />
              </label>

              <div className={styles.twoCols}>
                <label>
                  Min Selection
                  <input
                    type="number"
                    value={form.minSelection}
                    onChange={(e) => setField("minSelection", e.target.value)}
                  />
                </label>
                <label>
                  Max Selection
                  <input
                    type="number"
                    value={form.maxSelection}
                    onChange={(e) => setField("maxSelection", e.target.value)}
                  />
                </label>
              </div>

              <label>
                Thumbnail Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>

              {preview && (
                <div className={styles.thumbPreviewBox}>
                  <img
                    src={preview}
                    alt="Preview"
                    className={styles.thumbPreviewImg}
                  />
                </div>
              )}

              <h4>Select Products</h4>
              <div className={styles.productGrid}>
                {filteredProducts.length === 0 ? (
                  <p className={styles.empty}>No products available</p>
                ) : (
                  filteredProducts.map((p) => {
                    const img = p.variants?.[0]?.images?.[0]?.url || "";
                    const selected = form.products.includes(p._id);
                    return (
                      <div
                        key={p._id}
                        className={`${styles.productCard} ${
                          selected ? styles.selected : ""
                        }`}
                        onClick={() => toggleProductSelection(p._id)}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={p.title}
                            className={styles.productImg}
                          />
                        ) : (
                          <div className={styles.placeholderImg}>No Image</div>
                        )}
                        <p className={styles.productName}>{p.title}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                />
                Active Combo
              </label>

              <div className={styles.modalFooter}>
                <button type="submit" className={styles.btnPrimary} disabled={isUpdating}>
                  {current ? "Update Combo" : "Create Combo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
