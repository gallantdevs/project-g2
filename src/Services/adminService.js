import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin`;

const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const handleError = (err) => {
  console.error("API Error:", err.response?.data || err.message);
  throw err.response?.data || { success: false, message: "Server error occurred" };
};

export const createSubAdmin = async (formData) => {
  try {
    const { data } = await axios.post(`${API_URL}/create-subadmin`, formData, getAuthHeader());
    return data;
  } catch (err) {
    handleError(err);
  }
};

export const getAllUsers = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/users`, getAuthHeader());
    return data;
  } catch (err) {
    handleError(err);
  }
};

export const toggleUserStatus = async (id) => {
  try {
    const { data } = await axios.put(`${API_URL}/toggle-user/${id}`, {}, getAuthHeader());
    return data;
  } catch (err) {
    handleError(err);
  }
};

export const getAllSubAdmins = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/subadmins`, getAuthHeader());
    return data;
  } catch (err) {
    handleError(err);
  }
};

export const toggleSubAdminStatus = async (id) => {
  try {
    const { data } = await axios.put(`${API_URL}/toggle-subadmin/${id}`, {}, getAuthHeader());
    return data;
  } catch (err) {
    handleError(err);
  }
};


