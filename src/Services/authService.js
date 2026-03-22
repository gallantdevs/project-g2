const BASE = import.meta?.env?.VITE_API_URL || "http://localhost:1200/api";

const postRequest = async (url, body, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const getRequest = async (url, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { headers, credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const putRequest = async (url, body, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const sendOtp = (mobile) => postRequest("/auth/send-otp", { mobile });
export const verifyOtp = (mobile, otp) =>
  postRequest("/auth/verify-otp", { mobile, otp });
export const completeOnboarding = (mobile, fullName, email) =>
  postRequest("/auth/complete-onboarding", { mobile, fullName, email });
export const getProfile = (token) => getRequest("/user/me", token);
export const updateProfile = (token, data) =>
  putRequest("/user/update", data, token);
