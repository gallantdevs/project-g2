const BASE_URL = import.meta.env.VITE_API_BASE_URL+ "/coupon";

/* 🔐 Get token from localStorage (set at login) */
const getToken = () => sessionStorage.getItem("token");

/* 🟢 1️⃣ Get All Active Coupons (for UI display) */
export const getCoupons = async () => {
  try {
    const res = await fetch(`${BASE_URL}`);
    if (!res.ok) throw new Error(`Failed to fetch coupons: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("❌ getCoupons Error:", error.message);
    throw error;
  }
};

/* 🟢 2️⃣ Create New Coupon (Admin/Subadmin) */
export const createCoupon = async (couponData) => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token, authorization denied");

    const res = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify(couponData),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        data?.message || `Failed to create coupon (Status ${res.status})`;
      throw new Error(message);
    }
    return data;
  } catch (error) {
    console.error("❌ createCoupon Error:", error.message);
    throw error;
  }
};

/* 🟡 3️⃣ Validate Coupon (Before Checkout) */
export const validateCoupon = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Coupon validation failed");
    }

    return await res.json();
  } catch (error) {
    console.error("❌ validateCoupon Error:", error.message);
    throw error;
  }
};

/* 🔒 4️⃣ Apply Coupon (After Order Confirm) */
export const applyCoupon = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Coupon apply failed");
    }

    return await res.json();
  } catch (error) {
    console.error("❌ applyCoupon Error:", error.message);
    throw error;
  }
};

/* ✏️ 5️⃣ Update Coupon (Admin/Subadmin) */
export const updateCoupon = async (id, data) => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token, authorization denied");

    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update coupon");
    }

    return await res.json();
  } catch (error) {
    console.error("❌ updateCoupon Error:", error.message);
    throw error;
  }
};

/* 🗑️ 6️⃣ Delete Coupon (Admin/Subadmin) */
export const deleteCoupon = async (id) => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token, authorization denied");

    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }, 
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete coupon");
    }

    return await res.json();
  } catch (error) {
    console.error("❌ deleteCoupon Error:", error.message);
    throw error;
  }
};
