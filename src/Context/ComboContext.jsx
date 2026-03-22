import React, { createContext, useState, useEffect, useContext } from "react";
import {
  createCombo,
  getCombos,
  getComboBySlug,
  updateCombo,
  deleteCombo,
} from "../Services/comboService.js";
import { AuthContext } from "./AuthContext.jsx";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ComboContext = createContext();

export const ComboProvider = ({ children }) => {
  const [combos, setCombos] = useState([]);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    fetchCombos();
  }, []);

  /* ======================================================
     🔵 Get All Combos
  ====================================================== */
  const fetchCombos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCombos();

      // ✅ Debug logs
      // console.log("🎁 API Response:", data);
      // console.log("🎁 Is Array?", Array.isArray(data));
      // console.log("🎁 Length:", data?.length);

      setCombos(data);

   
      // if (data && data.length > 0) {
      //   // toast.success(`🎁 ${data.length} combo(s) loaded!`, {
      //   //   position: "top-center",
      //   //   transition: Bounce,
      //   // });
      // } else {
      //   toast.info("ℹ️ No combos found in database", {
      //     position: "top-center",
      //     transition: Bounce,
      //   });
      // }
    } catch (err) {
      console.error("❌ Fetch Combos Error:", err);
      setError(err.message);
      // toast.error("❌ Failed to fetch combos!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     🟢 Create New Combo
  ====================================================== */
  const addCombo = async (comboData) => {
    setLoading(true);
    try {
      const data = await createCombo(comboData, token);
      setCombos((prev) => [...prev, data.combo]);
      toast.success("✅ New combo created successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`❌ Failed to create combo! ${err.message}`, {
        position: "top-center",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     🔵 Get Combo By Slug
  ====================================================== */
  const fetchComboBySlug = async (slug) => {
    setLoading(true);
    try {
      const combo = await getComboBySlug(slug);
      setSelectedCombo(combo);
      // toast.info(`ℹ️ Combo "${combo?.title || slug}" loaded`, {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } catch (err) {
      setError(err.message);
      // toast.error("❌ Failed to load combo details!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } finally {
      setLoading(false);
    }
  };
  /* ======================================================
     ✏️ Update Combo
  ====================================================== */
  const editCombo = async (id, updatedData) => {
    setLoading(true);
    try {
      const updated = await updateCombo(id, updatedData, token);
      setCombos((prev) =>
        prev.map((combo) =>
          combo._id === id ? updated.combo || updated : combo
        )
      );
      toast.info("📝 Combo updated successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`❌ Failed to update combo! ${err.message}`, {
        position: "top-center",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  }; /* ======================================================
     ❌ Delete Combo
  ====================================================== */

  const removeCombo = async (id) => {
    setLoading(true);
    try {
      await deleteCombo(id, token);
      setCombos((prev) => prev.filter((combo) => combo._id !== id));
      toast.success("🗑️ Combo deleted successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`❌ Failed to delete combo! ${err.message}`, {
        position: "top-center",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComboContext.Provider
      value={{
        combos,
        selectedCombo,
        loading,
        error,
        fetchCombos,
        addCombo,
        editCombo,
        removeCombo,
        fetchComboBySlug,
      }}
    >
            {children}   {" "}
    </ComboContext.Provider>
  );
};
