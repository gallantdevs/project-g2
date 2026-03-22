import { AuthContext } from "../Context/AuthContext.jsx";
import { useContext } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/poster";
console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);


// 🟢 Get all posters
export const getPoster = async () => {
  const res = await fetch(`${BASE_URL}`);
  if (!res.ok) throw new Error("Failed to fetch posters");
  return res.json();
};

export const getActivePosters = async () => {
  const res = await fetch(`${BASE_URL}/active`);
  if (!res.ok) throw new Error("Failed to fetch active posters");
  return res.json();
};


export const createPoster = async (posterData, isMultipart = false, token) => {
  const headers = isMultipart ? {} : { "Content-Type": "application/json" };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: headers, 
    body: isMultipart ? posterData : JSON.stringify(posterData),
  });
  if (!res.ok) throw new Error("Failed to create poster");
  return res.json();
};

export const updatePoster = async (id, posterData, isMultipart = false, token) => {
  const headers = isMultipart ? {} : { "Content-Type": "application/json" };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: headers, 
    body: isMultipart ? posterData : JSON.stringify(posterData),
  });
  if (!res.ok) throw new Error("Failed to update poster");
  return res.json();
};

export const deletePoster = async (id, token) => {
  const headers = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: headers, 
  });
  if (!res.ok) throw new Error("Failed to delete poster");
  return res.json();
};