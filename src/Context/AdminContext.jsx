import React, { createContext, useState, useEffect } from "react";
import {
  createSubAdmin,
  getAllUsers,
  getAllSubAdmins,
  toggleUserStatus,
  toggleSubAdminStatus,
} from "../Services/adminService.js";
import { toast, Bounce } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
    if (storedUser?.role) setRole(storedUser.role);
  }, []);

  // ✅ Fetch all users
  const fetchUsers = async () => {
    if (!token) {
      // toast.warn("⛔ No token found, skipping fetchUsers", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
      return;
    }

    try {
      setLoading(true);
      const res = await getAllUsers(token);
      if (res.success) {
        setUsers(res.users);
        // toast.success("👥 Users loaded successfully!", {
        //   position: "top-center",
        //   transition: Bounce,
        // });
      } else {
        setUsers([]);
        // toast.warn("⚠️ No users found", {
        //   position: "top-center",
        //   transition: Bounce,
        // });
      }
    } catch (err) {
      console.error("Error fetching users:", err.message);
      setUsers([]);
      // toast.error("❌ Failed to fetch users!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch all subadmins (admin only)
  const fetchSubadmins = async () => {
    if (role !== "admin") {
      console.warn("Skipped subadmin fetch — not an admin");
      return;
    }
    if (!token) {
      // toast.warn("⛔ No token found, skipping subadmin fetch", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
      return;
    }

    try {
      setLoading(true);
      const res = await getAllSubAdmins(token);
      if (res.success) {
        setSubadmins(
          res.subadmins.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        // toast.success("🧑‍💼 Subadmins loaded successfully!", {
        //   position: "top-center",
        //   transition: Bounce,
        // });
      } else {
        setSubadmins([]);
        // toast.warn("⚠️ No subadmins found", {
        //   position: "top-center",
        //   transition: Bounce,
        // });
      }
    } catch (err) {
      if (err.message?.includes("Access denied")) {
        // toast.error("🚫 Access denied while fetching subadmins", {
        //   position: "top-center",
        //   transition: Bounce,
        // });
      } else {
        console.error("Error fetching subadmins:", err.message);
        // toast.error("❌ Failed to fetch subadmins!", {
        //   position: "top-center",
        //   transition: Bounce,
        // });
      }
      setSubadmins([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create Subadmin (Admin Only)
  const handleCreateSubAdmin = async (data) => {
    if (!token) {
      toast.warn("⛔ No token found, cannot create subadmin", {
        position: "top-center",
        transition: Bounce,
      });
      return;
    }
    try {
      const res = await createSubAdmin(data, token);
      if (res.success) {
        toast.success("🎉 Subadmin created successfully!", {
          position: "top-center",
          transition: Bounce,
        });
        fetchSubadmins();
      } else {
        toast.warn("⚠️ Failed to create subadmin", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      console.error("Create subadmin error:", err.message);
      // toast.error("❌ Error creating subadmin", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    }
  };

  // ✅ Toggle User Active/Inactive
  const handleToggleUserStatus = async (id) => {
    if (!token) {
      // toast.warn("⛔ No token found, cannot toggle user", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
      return;
    }
    try {
      const res = await toggleUserStatus(id, token);
      if (res.success) {
        toast.info("🔁 User status updated successfully!", {
          position: "top-center",
          transition: Bounce,
        });
        fetchUsers();
      } else {
        toast.warn("⚠️ Failed to update user status", {
          position: "top-center",
          transition: Bounce,
        });
      }
    } catch (err) {
      console.error("Toggle user status error:", err.message);
      toast.error("❌ Error updating user status", {
        position: "top-center",
        transition: Bounce,
      });
    }
  };

  // ✅ Toggle Subadmin Active/Inactive
  const handleToggleSubAdminStatus = async (id) => {
    if (!token) {
      toast.warn("⛔ No token found, cannot toggle subadmin", {
        position: "top-center",
        transition: Bounce,
      });
      return;
    }
    try {
      const res = await toggleSubAdminStatus(id, token);
      if (res.success) {
        toast.info("🔁 Subadmin status updated successfully!", {
          position: "top-center",
          transition: Bounce,
        });
        fetchSubadmins();
      } else {
        toast.warn("⚠️ Failed to update subadmin status", {
          position: "top-center",
          transition: Bounce,
        });
      }
    } catch (err) {
      console.error("Toggle subadmin status error:", err.message);
      toast.error("❌ Error updating subadmin status", {
        position: "top-center",
        transition: Bounce,
      });
    }
  };

  // ✅ Auto-fetch on mount
  useEffect(() => {
    if (!token) return;
    const fetchAll = async () => {
      setLoading(true);
      await fetchUsers();
      await fetchSubadmins();
      setLoading(false);
    };
    fetchAll();
  }, [role, token]);

  return (
    <AdminContext.Provider
      value={{
        users,
        subadmins,
        loading,
        role,
        token,
        fetchUsers,
        fetchSubadmins,
        handleCreateSubAdmin,
        handleToggleUserStatus,
        handleToggleSubAdminStatus,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
