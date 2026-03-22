import { useContext, useEffect, useMemo, useState } from "react";
import styles from "./CategoryManage.module.css";
import { ProductContext } from "../../Context/ProductContext";
import { AuthContext } from "../../Context/AuthContext";

const normalize = (s) =>
  (s || "").toString().trim().toLowerCase().replace(/\s+/g, "-");

export default function CategoryManage() {
  const {
    categories,
    refreshCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useContext(ProductContext) || {};
  const { user } = useContext(AuthContext);

  const [list, setList] = useState(Array.isArray(categories) ? categories : []);
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [category, setCategory] = useState({
    name: "",
    slug: "",
    description: "",
    parentCategory: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setList(Array.isArray(categories) ? categories : []);
  }, [categories]);

  const parentsOnly = useMemo(
    () => (Array.isArray(list) ? list.filter((c) => !c.parentCategory) : []),
    [list]
  );

  useEffect(() => {
    if (category.name)
      setCategory((prev) => ({ ...prev, slug: normalize(category.name) }));
  }, [category.name]);

  const parentNameOf = (c) => {
    if (!c.parentCategory) return "-";
    const pid =
      typeof c.parentCategory === "string"
        ? c.parentCategory
        : c.parentCategory?._id;
    const p = list.find((x) => x._id === pid);
    return p?.name || c.parentCategory?.name || "—";
  };

  const openCreate = () => {
    setCategory({
      name: "",
      slug: "",
      description: "",
      parentCategory: "",
    });
    setCreateOpen(true);
  };
  const closeCreate = () => setCreateOpen(false);

  const handleCreate = async () => {
    if (user?.role !== "admin" && user?.role !== "subadmin")
      return alert("Unauthorized: Admin role required");
    try {
      setSaving(true);
      const payload = {
        name: category.name,
        slug: category.slug,
        description: category.description,
        categoryType: category.parentCategory ? "subcategory" : "main",
        parentCategory: category.parentCategory || null,
        isActive: true,
      };

      await addCategory(payload);
      await refreshCategories();
      closeCreate();
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (cat) => {
    setEditing({
      _id: cat._id,
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      parentCategory:
        typeof cat.parentCategory === "string"
          ? cat.parentCategory
          : cat.parentCategory?._id || "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (user?.role !== "admin" && user?.role !== "subadmin")
      return alert("Unauthorized: Admin role required");

    try {
      setSaving(true);
      const payload = {
        name: editing.name,
        slug: normalize(editing.slug || editing.name),
        description: editing.description,
        isActive: editing.isActive,
        categoryType: editing.parentCategory ? "subcategory" : "main",
        parentCategory: editing.parentCategory || null,
      };
      await updateCategory(editing._id, payload);
      await refreshCategories();
      closeEdit();
    } finally {
      setSaving(false);
    }
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const remove = async (id) => {
    if (user?.role !== "admin" && user?.role !== "subadmin")
      return alert("Unauthorized: Admin role required");

    if (!confirm("Delete this category?")) return;
    await deleteCategory(id);
    await refreshCategories();
  };

  return (
    <div className={styles.container}>
      <div className={styles.headRow}>
        <h2 className={styles.heading}>Categories</h2>
        <button className={styles.button} onClick={openCreate}>
          + Add Category
        </button>
      </div>

      <div className={styles.listWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Type</th>
              <th>Parent</th>
              <th>Status</th> {/* ✅ Status Column added */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id}>
                <td data-label="Name">{c.name}</td>
                <td data-label="Slug">{c.slug}</td>
                <td data-label="Type">
                  {c.parentCategory ? "subcategory" : "main"}
                </td>
                <td data-label="Parent">{parentNameOf(c)}</td>
                <td data-label="Status">
                  {" "}
                  {/* ✅ Status Badge added */}
                  <span
                    className={
                      c.isActive ? styles.statusActive : styles.statusInactive
                    }
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className={styles.rowActions}>
                    <button className={styles.btn} onClick={() => openEdit(c)}>
                      Edit
                    </button>
                    <button
                      className={styles.btn}
                      onClick={() => remove(c._id)}
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

      {/* Create Modal */}
      {createOpen && (
        <div className={styles.modalBackdrop} onClick={closeCreate}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Add Category</h3>
              <button className={styles.btn} onClick={closeCreate}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.form}>
                <label>
                  Name
                  <input
                    className={styles.input}
                    value={category.name}
                    onChange={(e) =>
                      setCategory((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Slug
                  <input
                    className={styles.input}
                    value={category.slug}
                    readOnly
                  />
                </label>
                <label>
                  Description
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={category.description}
                    onChange={(e) =>
                      setCategory((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Parent
                  <select
                    className={styles.input}
                    value={category.parentCategory}
                    onChange={(e) =>
                      setCategory((s) => ({
                        ...s,
                        parentCategory: e.target.value,
                      }))
                    }
                  >
                    <option value="">No Parent (Main)</option>
                    {parentsOnly.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btn}
                disabled={saving}
                onClick={handleCreate}
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && editing && (
        <div className={styles.modalBackdrop} onClick={closeEdit}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Category</h3>
              <button className={styles.btn} onClick={closeEdit}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.form}>
                <label>
                  Name
                  <input
                    className={styles.input}
                    value={editing.name}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Slug
                  <input
                    className={styles.input}
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, slug: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Description
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={editing.description}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, description: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Parent
                  <select
                    className={styles.input}
                    value={editing.parentCategory || ""}
                    onChange={(e) =>
                      setEditing((s) => ({
                        ...s,
                        parentCategory: e.target.value,
                      }))
                    }
                  >
                    <option value="">No Parent</option>
                    {parentsOnly.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.checkboxLabel}>
                  Active Status
                  <div className={styles.switchWrapper}>
                    <input
                      type="checkbox"
                      id="isActiveToggle"
                      className={styles.switchInput}
                      checked={editing.isActive}
                      onChange={(e) =>
                        setEditing((s) => ({
                          ...s,
                          isActive: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="isActiveToggle"
                      className={styles.switchSlider}
                    ></label>
                    <span className={styles.statusText}>
                      {editing.isActive
                        ? "Visible in Menu"
                        : "Hidden from Menu"}
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btn}
                disabled={saving}
                onClick={saveEdit}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
