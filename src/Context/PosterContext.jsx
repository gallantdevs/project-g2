import React, { createContext, useState, useEffect, useCallback, useContext } from "react"; 
import {
  getPoster,
  createPoster,
  updatePoster,
  deletePoster,
} from "../Services/posterService.js";
import { useGlobal } from "./GlobalContext.jsx";
import { AuthContext } from "./AuthContext.jsx"; 
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const PosterContext = createContext();

export const PosterProvider = ({ children }) => {
  const [poster, setPoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { refreshApp } = useGlobal();
  const { token } = useContext(AuthContext); 

  /* ======================================================
     🖼️ FETCH ALL POSTERS
  ====================================================== */
  const fetchPoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const postersData = await getPoster();
      setPoster(Array.isArray(postersData) ? postersData : []);
    } catch (err) {
      console.error("Error fetching posters:", err);
      setError(err.message || "Failed to load posters");
      setPoster([]);
      if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
        console.warn("Poster fetch unauthorized — refreshing app...");
        refreshApp();
      }
    } finally {
      setLoading(false);
    }
  }, [refreshApp]);

  /* ======================================================
     ➕ ADD POSTER
  ====================================================== */
  const addPoster = useCallback(async (formData, isMultipart = false) => {
    try {
      setLoading(true);
      await createPoster(formData, isMultipart, token);
      await fetchPoster(); // refresh list after add
      toast.success("✅ Poster added successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Error adding poster:", err);
      setError(err.message || "Failed to create poster");
      toast.error("❌ Failed to add poster!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPoster, token]);

  /* ======================================================
     ✏️ UPDATE POSTER
  ====================================================== */
  const editPoster = useCallback(async (id, formData, isMultipart = false) => {
    try {
      setLoading(true);
      await updatePoster(id, formData, isMultipart, token);
      await fetchPoster();
      toast.info("✏️ Poster updated successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Error updating poster:", err);
      setError(err.message || "Failed to update poster");
      toast.error("❌ Failed to update poster!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPoster, token]); 

  /* ======================================================
     🗑️ DELETE POSTER
  ====================================================== */
  const removePoster = useCallback(async (id) => {
    try {
      setLoading(true);
      await deletePoster(id, token);
      setPoster((prev) => prev.filter((p) => p._id !== id)); // local update
      toast.success("🗑️ Poster deleted successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Error deleting poster:", err);
      setError(err.message || "Failed to delete poster");
      toast.error("❌ Failed to delete poster!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* ======================================================
     🔁 AUTO FETCH ON MOUNT
  ====================================================== */
  useEffect(() => {
    fetchPoster();
  }, [fetchPoster]);

  return (
    <PosterContext.Provider
      value={{
        poster,
        loading,
        error,
        fetchPoster,
        addPoster,
        editPoster,
        removePoster,
      }}
    >
      {children}
    </PosterContext.Provider>
  );
};