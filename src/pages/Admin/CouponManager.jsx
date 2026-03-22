import React, { useContext, useState, useMemo, useEffect } from "react";
import { CartContext } from "../../Context/CartContext.jsx";
import { CouponContext } from "../../Context/CouponContext.jsx";
import { ProductContext } from "../../Context/ProductContext.jsx";
import styles from "./CouponManager.module.css";
import { AuthContext } from "../../Context/AuthContext.jsx";

const emptyForm = {
  code: "",
  discountType: "FLAT",
  discountValue: "",
  minPurchase: 0,
  categories: [],
  startAt: "",
  expireAt: "",
  active: true,
  maxUses: "",
  perUserLimit: "",
};

export default function CouponManager() {
  const { coupons, add, update, remove, refreshCoupon, loading, error } =
    useContext(CouponContext);
  const { user } = useContext(AuthContext);

  const { categories } = useContext(ProductContext) || { categories: [] };

  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const openEdit = (coupon) => {
    if (coupon) {
      setCurrent(coupon);

      const selectedCategoryIds =
        coupon.categories?.map((cat) =>
          typeof cat === "object" ? cat._id : cat
        ) || [];

      setForm({
        code: coupon.code,
        discountType: coupon.discountType || "FLAT",
        discountValue: coupon.discountValue,
        minPurchase: coupon.minPurchase || 0,
        categories: selectedCategoryIds,
        startAt: coupon.startAt ? coupon.startAt.slice(0, 10) : "",
        expireAt: coupon.expireAt ? coupon.expireAt.slice(0, 10) : "",
        active: coupon.active,
        maxUses: coupon.maxUses || "",
        perUserLimit: coupon.perUserLimit || "",
      });
    } else {
      setCurrent(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setForm(emptyForm);
    setCurrent(null);
  };

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.role === "admin" || user.role === "subadmin") {
      if (!form.code.trim()) return alert("Coupon code is required!");
      if (!form.discountValue || isNaN(form.discountValue))
        return alert("Enter a valid discount value.");

      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
        categories: form.categories.map((id) => id),
      };

      try {
        if (current?._id) await update(current._id, payload);
        else await add(payload);

        close();
        refreshCoupon();
      } catch (err) {
        console.error("Coupon save error:", err);
        alert("Failed to save coupon. Check console for details.");
      }
    } else {
      alert("Token Expired. Please login again.");
    }
  };

  const handleDelete = async (id) => {
    if (!user.role === "admin" || !user.role === "subadmin")
      return alert("Token Expired. Please login first.");
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      await remove(id);
      refreshCoupon();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🎟️ Coupon Manager</h3>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => openEdit(null)}>
            + Add Coupon
          </button>
          <button
            className={styles.btn}
            onClick={refreshCoupon}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : coupons.length === 0 ? (
        <p className={styles.empty}>No coupons available.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Purchase</th>
                <th>Active</th>
                <th>Expires</th>
                <th>Categories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td data-label="Code">{c.code}</td>
                  <td data-label="Type">{c.discountType}</td>
                  <td data-label="Value">
                    {c.discountType === "FLAT"
                      ? `₹${c.discountValue}`
                      : `${c.discountValue}%`}
                  </td>
                  <td data-label="Min Purchase">₹{c.minPurchase}</td>
                  <td data-label="Active">{c.active ? "✅" : "❌"}</td>
                  <td data-label="Expires">
                    {c.expireAt ? new Date(c.expireAt).toLocaleDateString() : "—"}
                  </td>
                  <td data-label="Categories">
                    {c.categories && c.categories.length > 0
                      ? c.categories
                          .map((cat) =>
                            typeof cat === "object" ? cat.name : cat
                          )
                          .join(", ")
                      : "All"}
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actions}>
                      <button className={styles.btn} onClick={() => openEdit(c)}>
                        Edit
                      </button>
                      <button
                        className={`${styles.btn} ${styles.delete}`}
                        onClick={() => handleDelete(c._id)}
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

      {open && (
        <div className={styles.modalBackdrop} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{current ? "Edit Coupon" : "Create Coupon"}</h3>
              <button 
                className={styles.closeBtn} 
                onClick={close} 
                type="button" 
                aria-label="Close modal">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <label>
                Code
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value.toUpperCase())}
                  required
                />
              </label>

              <label>
                Discount Type
                <select
                  value={form.discountType}
                  onChange={(e) => setField("discountType", e.target.value)}
                >
                  <option value="FLAT">FLAT</option>
                  <option value="PERCENT">PERCENT</option>
                </select>
              </label>

              <label>
                Discount Value
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setField("discountValue", e.target.value)}
                  required
                />
              </label>

              <label>
                Min Purchase (₹)
                <input
                  type="number"
                  value={form.minPurchase}
                  onChange={(e) => setField("minPurchase", e.target.value)}
                />
              </label>

              <label>
                Categories (Hold Ctrl/Cmd to select multiple)
                <div className={styles.selectWrapper}>
                  <select
                    multiple
                    value={form.categories}
                    onChange={(e) =>
                      setField(
                        "categories",
                        Array.from(e.target.selectedOptions, (opt) => opt.value)
                      )
                    }
                  >
                    {categories
                      ?.filter((cat) => cat.slug?.toLowerCase() !== "combos")
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </label>

              <div className={styles.twoCols}>
                <label>
                  Start Date
                  <input
                    type="date"
                    value={form.startAt}
                    onChange={(e) => setField("startAt", e.target.value)}
                  />
                </label>
                <label>
                  Expiry Date
                  <input
                    type="date"
                    value={form.expireAt}
                    onChange={(e) => setField("expireAt", e.target.value)}
                  />
                </label>
              </div>

              <div className={styles.twoCols}>
                <label>
                  Max Uses (optional)
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setField("maxUses", e.target.value)}
                  />
                </label>
                <label>
                  Per User Limit (optional)
                  <input
                    type="number"
                    value={form.perUserLimit}
                    onChange={(e) => setField("perUserLimit", e.target.value)}
                  />
                </label>
              </div>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setField("active", e.target.checked)}
                />
                Active Coupon
              </label>

              <div className={styles.modalFooter}>
                <button type="submit" className={styles.btnPrimary}>
                  {current ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}