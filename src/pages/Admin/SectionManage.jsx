import React, { useContext, useState } from "react";
import { SectionContext } from "../../Context/SectionContext.jsx";
import styles from "./SectionManage.module.css";
import { AuthContext } from "./../../Context/AuthContext";

export default function SectionManage() {
  const {
    Allsections,
    sections,
    loading,
    error,
    addSection,
    editSection,
    removeSection,
  } = useContext(SectionContext);
  const { user } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    identifier: "",
    title: "",
    subtitle: "",
    tags: "",
    componentType: "carousel",
    order: "",
    isActive: true,
  });

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      identifier: "",
      title: "",
      subtitle: "",
      tags: "",
      componentType: "carousel",
      order: "",
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || "",
      identifier: s.identifier || "",
      title: s.title || "",
      subtitle: s.subtitle || "",
      tags: s.tags?.join(", ") || "",
      componentType: s.componentType || "carousel",
      order: s.order || "",
      isActive: s.isActive ?? true,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!user?.role === "admin")return alert("Something Went Wrong admin token missing")
    
    const payload = {
      ...form,
      order: Number(form.order),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    };

    try {
      if (editing?._id) {
        await editSection(editing._id, payload);
      } else {
        await addSection(payload);
      }
      close();
    } catch (err) {
      alert("Failed to save section: " + (err.message || "Unknown error"));
    }
  };

  const handleDelete = async (id) => {
     if(!user?.role === "admin")return alert("Something Went Wrong admin token missing")
    if (!confirm("Delete this section?")) return;
    try {
      await removeSection(id);
    } catch (err) {
      alert("Failed to delete section: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>Sections</h3>
        <button className={styles.btn} onClick={openCreate}>
          + Add Section
        </button>
      </div>

      {loading && <p>Loading sections...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Identifier</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Component</th>
              <th>Order</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Allsections.map((s) => (
              <tr key={s._id}>
                <td data-label="Name">{s.name}</td>
                <td data-label="Identifier">{s.identifier}</td>
                <td data-label="Title">{s.title}</td>
                <td data-label="Tags">{s.tags?.join(", ") || "-"}</td>
                <td data-label="Component">{s.componentType}</td>
                <td data-label="Order">{s.order}</td>
                <td data-label="Active">{s.isActive ? "Yes" : "No"}</td>
                <td data-label="Actions">
                  <div className={styles.rowActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => openEdit(s)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(s._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!Allsections.length && !loading && (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>
                  No sections available
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
              <h3>{editing ? "Edit Section" : "Add Section"}</h3>
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
                    Name
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                    />
                  </label>
                  <label className={styles.label}>
                    Identifier
                    <input
                      required
                      value={form.identifier}
                      onChange={(e) => setField("identifier", e.target.value)}
                    />
                  </label>
                  <label className={styles.label}>
                    Title
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value)}
                    />
                  </label>
                  <label className={styles.label}>
                    Tags
                    <input
                      value={form.tags}
                      onChange={(e) => setField("tags", e.target.value)}
                    />
                  </label>
                  <label className={styles.label}>
                    Component Type
                    <select
                      value={form.componentType}
                      onChange={(e) =>
                        setField("componentType", e.target.value)
                      }
                    >
                      <option value="carousel">Carousel</option>
                      <option value="grid">Grid</option>
                      <option value="scrollable">Scrollable</option>
                      <option value="CategoryCirlce">Category Circle</option>
                      <option value="banner">Banner</option>
                      <option value="discount">Discount</option>
                    </select>
                  </label>
                  <label className={styles.label}>
                    Order
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setField("order", e.target.value)}
                    />
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setField("isActive", e.target.checked)}
                    />
                    Active Section
                  </label>
                </div>
              </div>
              <div className={styles.modalFoot}>
                <button type="button" onClick={close}>
                  Cancel
                </button>
                <button type="submit">{editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}