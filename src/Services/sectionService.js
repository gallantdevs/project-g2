const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/section";;


export const getSections = async () => {
  const response = await fetch(`${BASE_URL}/sections`);
  if (!response.ok) throw new Error("Failed to fetch sections");
  return await response.json();
};

export const getActiveSections = async () => {
  const response = await fetch(`${BASE_URL}/sections/active`);
  if (!response.ok) throw new Error("Failed to fetch active sections");
  return await response.json();
};

export const createSection = async (sectionData) => {
  const response = await fetch(`${BASE_URL}/sections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sectionData),
  });
  if (!response.ok) throw new Error("Failed to create section");
  return await response.json();
};

export const updateSection = async (id, sectionData) => {
  const response = await fetch(`${BASE_URL}/sections/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sectionData),
  });
  if (!response.ok) throw new Error("Failed to update section");
  return await response.json();
};

export const deleteSection = async (id) => {
  const response = await fetch(`${BASE_URL}/sections/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete section");
  return await response.json();
};
