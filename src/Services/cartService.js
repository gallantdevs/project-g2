const BASE_URL = import.meta.env.VITE_API_BASE_URL  + "/cart";

// 🔒 Helper: Add JWT token to header
function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* Get Cart */
export const getCart = async () => {
  const res = await fetch(`${BASE_URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to fetch cart");
  return data;
};

/* Add Item to Cart */
export const addToCart = async (cartItem) => {
  const res = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(cartItem),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to add item to cart");
  return data;
};

/* Update Cart Item Quantity */
export const updateCartItem = async (itemId, quantity) => {
  const res = await fetch(`${BASE_URL}/item/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ quantity }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to update cart item");
  }

  console.log("cartService response:", data);

  return data;
};

/* Remove Cart Item */
export const removeCartItem = async (itemId) => {
  const res = await fetch(`${BASE_URL}/remove/${itemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || "Failed to remove item");
  return data;
};

/* Clear Cart */
export const clearCart = async () => {
  const res = await fetch(`${BASE_URL}/clear`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to clear cart");
  return data;
};

/* Apply Coupon */
export const applyCoupon = async (data) => {
  try {
    const {
      code,
      cartItems = [],
      cartTotal = 0,
      mrpTotal = 0,
      userId = "",
    } = data || {};

    if (!code) throw new Error("Coupon code missing!");

    const res = await fetch(`${BASE_URL}/apply-coupon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        code,
        cartItems,
        cartTotal,
        mrpTotal,
        userId,
      }),
    });

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        responseData.message ||
          responseData.error ||
          "Failed to apply coupon"
      );
    }

    return {
      success: responseData.success,
      message: responseData.message,
      discountAmount: responseData.discountAmount || responseData.discount || 0,
      finalAmount: responseData.finalAmount || cartTotal,
      cart: responseData.cart || {},
    };
  } catch (error) {
    console.error("❌ applyCoupon Service Error:", error);
    throw error;
  }
};

/* Add Combo to Cart */
export const addComboToCart = async (comboData) => {
  const res = await fetch(`${BASE_URL}/add-combo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(comboData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to add combo to cart");
  return data;
};


export const removeCoupon = async () => {
  const res = await fetch(`${BASE_URL}/remove-coupon`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to remove coupon");
  return data;
};
