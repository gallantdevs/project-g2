const BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/product/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  // console.log("Product Data", data);

  return data.products || [];
};

export const postProduct = async (product, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/product/products`, {
    method: "POST",
    headers,
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `HTTP ${res.status}`);
  }
  return await res.json();
};

export const updateProduct = async (id, product, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/product/products/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || "Failed to update product");
  }
  return await res.json();
};

export const removeProduct = async (id, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/product/products/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || "Failed to delete product");
  }
  return await res.json();
};

// CATEGORIES
export const postCategory = async (category) => {
  const res = await fetch(`${BASE_URL}/category/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `HTTP ${res.status}`);
  }
  return await res.json();
};

export const getCategories = async () => {
  const res = await fetch(`${BASE_URL}/category/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return (await res.json()) || [];
};

export const getCategoryTree = async () => {
  const res = await fetch(`${BASE_URL}/category/categories/tree`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return (await res.json()) || [];
};

export const updateCategory = async (id, category) => {
  const res = await fetch(`${BASE_URL}/category/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || "Failed to update category");
  }
  return await res.json();
};

export const removeCategory = async (id) => {
  const res = await fetch(`${BASE_URL}/category/categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || "Failed to delete category");
  }
  return await res.json();
};


// 🔼 UPLOAD IMAGES
export const uploadImages = async (formData, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers,
    body: formData, 
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || "Failed to upload files");
  }
  return await res.json();
};