import React, { useContext, useEffect, useMemo, useState } from "react";
import { PosterContext } from "../../Context/PosterContext.jsx";
import { ProductContext } from "../../Context/ProductContext.jsx";
import styles from "./PosterManage.module.css";
import { AuthContext } from "../../Context/AuthContext.jsx";

const normalize = (s) =>
  (s || "").toString().trim().toLowerCase().replace(/\s+/g, "-");

export default function PosterManage() {
  const {
    poster,
    loading,
    error,
    fetchPoster,
    addPoster,
    editPoster,
    removePoster,
  } = useContext(PosterContext) || {};

  const { categories } = useContext(ProductContext) || {};
  const { user } = useContext(AuthContext);

  const allCategories = Array.isArray(categories) ? categories : [];
  const subcategories = useMemo(
    () => allCategories.filter((c) => c.parentCategory),
    [allCategories]
  );

  const [rows, setRows] = useState(Array.isArray(poster) ? poster : []);
  useEffect(() => {
    setRows(Array.isArray(poster) ? poster : []);
  }, [poster]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    image: "",
    tag: "",
    category: "",
    subcategory: "",
    redirectUrl: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      image: "",
      tag: "",
      category: "",
      subcategory: "",
      redirectUrl: "",
      isActive: true,
    });
    setImageFile(null);
    setPreview("");
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || "",
      image: p.image || "",
      tag: p.tag || "",
      category: p.category?._id || p.category || "",
      subcategory: p.subcategory?._id || p.subcategory || "",
      redirectUrl: p.redirectUrl || "",
      isActive: !!p.isActive,
    });
    setPreview(p.image || "");
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setImageFile(null);
    setPreview("");
  };

  useEffect(() => {
    if (!form.tag) return;
    const selectedSub = subcategories.find((c) => c._id === form.subcategory);
    const selectedCat = allCategories.find((c) => c._id === form.category);
    const target = selectedSub || selectedCat;
    const categoryType = target?.parentCategory
      ? "subcategory"
      : target
      ? "main"
      : "general";
    const tagSlug = normalize(form.tag);
    if (target) {
      setForm((prev) => ({
        ...prev,
        redirectUrl: `/products/${categoryType}/${tagSlug}`,
      }));
    } else {
      setForm((prev) => ({ ...prev, redirectUrl: `/products/tag/${tagSlug}` }));
    }
  }, [form.category, form.subcategory, form.tag, allCategories, subcategories]);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("tag", form.tag || "");
      formData.append("category", form.category || "");
      formData.append("subcategory", form.subcategory || "");
      formData.append("redirectUrl", form.redirectUrl || "");
      formData.append("isActive", form.isActive);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (form.image) {
        formData.append("image", form.image);
      }

      if (editing?._id) {
        await editPoster(editing._id, formData, true);
      } else {
        await addPoster(formData, true);
      }

      close();
    } catch (err) {
      alert("Failed to save poster: " + (err.message || "Unknown error"));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this poster?")) return;
    try {
      await removePoster(id);
      if (editing?._id === id) close();
    } catch (err) {
      alert("Failed to delete poster: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>Posters</h3>
        <button className={styles.btn} onClick={openCreate}>
          + Add Poster
        </button>
      </div>

      {loading && <p>Loading posters...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Tag</th>
              <th>Category</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id} className={styles.tr}>
                <td data-label="Image" className={styles.cell}>
                  <img src={p.image} alt={p.title} className={styles.img} />
                </td>
                <td data-label="Title" className={styles.cell}>{p.title}</td>
                <td data-label="Tag" className={styles.cell}>{p.tag || "-"}</td>
                <td data-label="Category" className={styles.cell}>{p.category?.name || "-"}</td>
                <td data-label="Active" className={styles.cell}>{p.isActive ? "Yes" : "No"}</td>
                <td data-label="Actions" className={styles.cell}>
                  <div className={styles.rowActions}>
                    <button className={styles.btn} onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button
                      className={styles.btn}
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="6" className={styles.emptyRow}>
                  No posters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className={styles.backdrop} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{editing?._id ? "Edit Poster" : "Add Poster"}</h3>
              <button 
                onClick={close}
                className={styles.closeBtn}
                type="button"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.grid}>
                  <label className={styles.label}>
                    Title
                    <input
                      required
                      name="title"
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value)}
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.label}>
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={styles.input}
                    />
                  </label>

                  {preview && (
                    <div className={styles.previewBox}>
                      <img
                        src={preview}
                        alt="preview"
                        className={styles.previewImg}
                      />
                    </div>
                  )}

                  <label className={styles.label}>
                    Tag (e.g. festival-sale)
                    <input
                      name="tag"
                      value={form.tag}
                      onChange={(e) => setField("tag", e.target.value)}
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.label}>
                    Main Category (optional)
                    <select
                      name="category"
                      value={form.category}
                      onChange={(e) => setField("category", e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Select</option>
                      {allCategories
                        .filter((c) => !c.parentCategory)
                        .map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className={styles.label}>
                    Subcategory (optional)
                    <select
                      name="subcategory"
                      value={form.subcategory}
                      onChange={(e) => setField("subcategory", e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Select</option>
                      {subcategories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.label}>
                    Redirect URL (auto)
                    <input
                      name="redirectUrl"
                      value={form.redirectUrl}
                      readOnly
                      className={styles.input}
                    />
                  </label>

                  <div className={styles.check}>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "12px",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        background: "none",
                        boxShadow: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={(e) => setField("isActive", e.target.checked)}
                      />
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.modalFoot}>
                <button type="button" onClick={close}>
                  Cancel
                </button>
                <button type="submit">
                  {editing?._id ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}