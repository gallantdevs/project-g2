import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  getSections,
  getActiveSections,
  createSection,
  updateSection,
  deleteSection,
} from "../Services/sectionService.js";
import { useGlobal } from "./GlobalContext.jsx";
import { toast, Bounce } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

export const SectionContext = createContext();

export const SectionProvider = ({ children }) => {
  const [sections, setSections] = useState([]);
  const [Allsections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { refreshApp } = useGlobal();

  /* ======================================================
     🧱 DEFAULT SECTIONS (Fallback)
  ====================================================== */
  const getDefaultSections = useCallback(
    () => [
      {
        _id: "default-1",
        name: "Main Carousel",
        identifier: "main-carousel",
        title: "Main Banner",
        tags: ["festival", "Festive-Sale"],
        componentType: "carousel",
        order: 1,
        isActive: true,
      },
      {
        _id: "default-2",
        name: "Super Saving Combos",
        identifier: "super-saving-combos",
        title: "SUPER Saving Combos",
        subtitle: "Loved by 4 millions",
        tags: ["super-saving-combos"],
        componentType: "scrollable",
        order: 2,
        isActive: true,
      },
      {
        _id: "default-3",
        name: "Categories",
        identifier: "categories",
        title: "Most Wanted Categories",
        tags: [
          "shirt",
          "shorts",
          "t-shirt",
          "jeans",
          "trouser",
          "cargo-joggers",
          "cargo",
        ],
        componentType: "grid",
        order: 3,
        isActive: true,
      },
      {
        _id: "default-4",
        name: "Back to College",
        identifier: "back-to-college",
        title: "Back To College",
        subtitle: "Styles to Slay This Semester",
        tags: ["back-to-college"],
        componentType: "scrollable",
        order: 4,
        isActive: true,
      },
    ],
    []
  );

  /* ======================================================
     📦 FETCH SECTIONS
  ====================================================== */
  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActiveSections();
      const allSection = await getSections();

      const AllSectionsorted = allSection.sort((a, b) => a.order - b.order);
      const sorted = data.sort((a, b) => a.order - b.order);

      setSections(sorted);
      setAllSections(AllSectionsorted);

      // toast.success("📦 Sections loaded successfully!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } catch (err) {
      console.error("Error fetching sections:", err);
      setError(err.message || "Failed to load sections");

      // toast.error("❌ Failed to load sections!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });

      if (err.message?.includes("401")) {
        refreshApp();
      } else {
        // toast.warn("⚠️ Using default sections due to error.", {
        //   position: "top-center",
        //   transition: Bounce,
        // });
        setSections(getDefaultSections());
        setAllSections(getDefaultSections());
      }
    } finally {
      setLoading(false);
    }
  }, [getDefaultSections, refreshApp]);

  /* ======================================================
     ➕ ADD SECTION
  ====================================================== */
  const addSection = async (section) => {
    try {
      await createSection(section);
      await fetchSections();
      toast.success("✅ Section added successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Error adding section:", err);
      toast.error("❌ Failed to add section!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    }
  };

  /* ======================================================
     ✏️ UPDATE SECTION
  ====================================================== */
  const editSection = async (id, section) => {
    try {
      await updateSection(id, section);
      await fetchSections();
      toast.info("✏️ Section updated successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Error updating section:", err);
      toast.error("❌ Failed to update section!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    }
  };

  /* ======================================================
     🗑️ DELETE SECTION
  ====================================================== */
  const removeSection = async (id) => {
    try {
      await deleteSection(id);
      await fetchSections();
      toast.success("🗑️ Section deleted successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error("❌ Failed to delete section!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    }
  };

  /* ======================================================
     🔁 AUTO FETCH ON MOUNT
  ====================================================== */
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return (
    <SectionContext.Provider
      value={{
        Allsections,
        sections,
        loading,
        error,
        fetchSections,
        addSection,
        editSection,
        removeSection,
      }}
    >
      {children}
    </SectionContext.Provider>
  );
};
