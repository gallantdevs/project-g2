 

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/combo";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }
  return response.json();
};

export const createCombo = async (formData, token) => { 
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    throw new Error("Authorization token is missing.");
  }

  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: headers, 
    body: formData, 
  });
  return handleResponse(response);
};

export const getCombos = async () => {
  const response = await fetch(`${BASE_URL}`);
  return handleResponse(response);
};

export const getComboBySlug = async (slug) => {
  const response = await fetch(`${BASE_URL}/${slug}`);
  return handleResponse(response);
};

export const updateCombo = async (id, formData, token) => { 
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    throw new Error("Authorization token is missing.");
  }

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: headers, 
    body: formData, 
  });
  return handleResponse(response);
};

// ❌ Delete Combo by ID
export const deleteCombo = async (id, token) => { 
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    throw new Error("Authorization token is missing.");
  }

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: headers, 
  });
  return handleResponse(response);
};