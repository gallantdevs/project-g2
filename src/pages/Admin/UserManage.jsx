import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../Context/AdminContext.jsx";
import { AuthContext } from "../../Context/AuthContext.jsx";
import styles from "./userManage.module.css";

const emptyForm = {
  fullName: "",
  email: "",
  mobile: "",
  role: "user",
  gender: "",
  dob: "",
  isActive: true,
};

export default function UserManage() {
  const {
    users,
    subadmins,
    handleCreateSubAdmin,
    handleToggleUserStatus,
    handleToggleSubAdminStatus,
    fetchUsers,
    fetchSubadmins,
  } = useContext(AdminContext);

  const { user } = useContext(AuthContext);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchUsers();
    fetchSubadmins();
  }, [user]);

  if (user.role !== "admin") {
    alert("Access denied! Only admin can create or promote subadmins.");
    return;
  }

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openEdit = (userData) => {
    if (userData) {
      setCurrent(userData);
      setForm({
        fullName: userData.fullName || "",
        email: userData.email || "",
        mobile: userData.mobile || "",
        role: userData.role || "user",
        gender: userData.gender || "",
        dob: userData.dob ? userData.dob.slice(0, 10) : "",
        isActive: userData.isActive,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mobile.trim()) {
      alert("Mobile number is required!");
      return;
    }

    if (user.role !== "admin") {
      alert("Access denied! Only admin can create or promote subadmins.");
      return;
    }

    const payload = { ...form };
    try {
      setLoading(true);
      if (form.role === "subadmin") {
        await handleCreateSubAdmin(payload);
        alert("✅ Subadmin created or promoted successfully!");
      } else {
        alert("Currently only Subadmin creation is supported.");
      }
      close();
      await Promise.all([fetchUsers(), fetchSubadmins()]);
    } catch (err) {
      console.error("User save error:", err);
      alert("❌ Failed to save user. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

const handleToggle = async (userData) => {
  if (userData._id === user._id) {
    alert("⚠️ You cannot block or deactivate your own account!");
    return;
  }
  const isSubadmin = userData.role === "subadmin";
  const confirmMsg = userData.isActive
    ? `Are you sure you want to block this ${isSubadmin ? "Subadmin" : "User"}?`
    : `Unblock this ${isSubadmin ? "Subadmin" : "User"}?`;
  if (!window.confirm(confirmMsg)) return;

  try {
    setLoading(true);
    if (isSubadmin) {
      await handleToggleSubAdminStatus(userData._id);
      await fetchSubadmins();
    } else {
      await handleToggleUserStatus(userData._id);
      await fetchUsers();
    }
  } catch (err) {
    console.error("Toggle status error:", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>👥 User & Subadmin Manager</h3>
        <div className={styles.actions}>
          {user?.role === "admin" && (
            <button className={styles.btn} onClick={() => openEdit(null)}>
              + Add User / Subadmin
            </button>
          )}
          <button
            className={styles.btn}
            onClick={() => {
              fetchUsers();
              fetchSubadmins();
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <section className={styles.section}>
        <h4>Users</h4>
        {loading ? (
          <p>Loading users...</p>
        ) : users?.length ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td data-label="Name">{u.fullName || "—"}</td>
                    <td data-label="Mobile">{u.mobile}</td>
                    <td data-label="Email">{u.email || "—"}</td>
                    <td data-label="Status">{u.isActive ? "✅ Active" : "❌ Blocked"}</td>
                    <td data-label="Actions">
                      <div className={styles.actionButtons}>
                        <button className={styles.btn} onClick={() => openEdit(u)}>
                          Edit
                        </button>
                        <button
                          className={`${styles.btn} ${styles.delete}`}
                          onClick={() => handleToggle(u)}
                        >
                          {u.isActive ? "Block" : "Unblock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.empty}>No users found.</p>
        )}
      </section>

      <section className={styles.section}>
        <h4>Subadmins</h4>
        {subadmins?.length ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subadmins.map((s) => (
                  <tr key={s._id}>
                    <td data-label="Name">{s.fullName || "—"}</td>
                    <td data-label="Mobile">{s.mobile}</td>
                    <td data-label="Email">{s.email || "—"}</td>
                    <td data-label="Status">{s.isActive ? "✅ Active" : "❌ Blocked"}</td>
                    <td data-label="Actions">
                      <div className={styles.actionButtons}>
                        <button className={styles.btn} onClick={() => openEdit(s)}>
                          Edit
                        </button>
                        <button
                          className={`${styles.btn} ${styles.delete}`}
                          onClick={() => handleToggle(s)}
                        >
                          {s.isActive ? "Block" : "Unblock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.empty}>No subadmins found.</p>
        )}
      </section>

      {open && (
        <div className={styles.modalBackdrop} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{current ? "Edit User" : "Add User / Subadmin"}</h3>
              <button 
                className={styles.closeBtn} 
                onClick={close}
                type="button"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <label>
                Full Name
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </label>
              <label>
                Mobile
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) => setField("mobile", e.target.value)}
                  required
                />
              </label>
              <label>
                Role
                <select
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="subadmin">Subadmin</option>
                </select>
              </label>
              <label>
                Gender
                <select
                  value={form.gender}
                  onChange={(e) => setField("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                DOB
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setField("dob", e.target.value)}
                />
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                />
                Active
              </label>

              <div className={styles.modalFooter}>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : current
                    ? "Update"
                    : "Create Subadmin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}