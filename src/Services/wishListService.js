const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ GET — Fetch wishlist of a user
export const getWishlist = async (userId, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/wishlist/${userId}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch wishlist");
  return await res.json();
};

// ✅ POST — Add product to wishlist
export const addToWishlist = async (payload, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/wishlist/add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `HTTP ${res.status}`);
  }
  return await res.json();
};

// ✅ PUT — Update note or item details
export const updateWishlist = async (id, payload, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/wishlist/update/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || "Failed to update wishlist");
  }
  return await res.json();
};

// ✅ DELETE — Remove single wishlist item
export const removeFromWishlist = async (id, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/wishlist/remove/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || "Failed to remove wishlist item");
  }
  return await res.json();
};

// ✅ DELETE — Clear all wishlist items of user
export const clearWishlist = async (userId, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/wishlist/clear/${userId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || "Failed to clear wishlist");
  }
  return await res.json();
};
