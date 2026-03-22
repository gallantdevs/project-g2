import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import {
  getProducts,
  getCategories,
  getCategoryTree,
  postProduct,
  updateProduct as svcUpdateProduct,
  removeProduct as svcRemoveProduct,
  postCategory,
  updateCategory as svcUpdateCategory,
  removeCategory as svcRemoveCategory,
} from "../Services/productsService.js";

import { useGlobal } from "./GlobalContext.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { refreshApp } = useGlobal();
  const { token } = useContext(AuthContext);

  /* ======================================================
     📦 REFRESH PRODUCTS
  ====================================================== */
  const refreshProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
      // toast.success("📦 Products loaded successfully!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
      // toast.error("❌ Failed to load products!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });

      if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        console.warn("Unauthorized in products — refreshing app...");
        refreshApp();
      }
    }
  }, [refreshApp]);

  /* ======================================================
     🗂️ REFRESH CATEGORIES
  ====================================================== */
  const refreshCategories = useCallback(async () => {
    try {
      const [list, tree] = await Promise.all([getCategories(), getCategoryTree()]);
      setCategories(Array.isArray(list) ? list : []);
      setCategoryTree(Array.isArray(tree) ? tree : []);
      // toast.info("🗂️ Categories loaded successfully!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to load categories");
      // toast.error("❌ Failed to load categories!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });

      if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        console.warn("Unauthorized in categories — refreshing app...");
        refreshApp();
      }
    }
  }, [refreshApp]);

  /* ======================================================
     🔁 REFRESH EVERYTHING
  ====================================================== */
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c, t] = await Promise.all([
        getProducts(),
        getCategories(),
        getCategoryTree(),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
      setCategoryTree(Array.isArray(t) ? t : []);
      // toast.success("🔄 Products & Categories refreshed!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Something went wrong");
      toast.error("❌ Failed to refresh data!", {
        position: "top-center",
        transition: Bounce,
      });

      if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        console.warn("Unauthorized in refreshAll — reloading app...");
        refreshApp();
      }
    } finally {
      setLoading(false);
    }
  }, [refreshApp]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /* ======================================================
     🏷️ CATEGORY CRUD
  ====================================================== */
  const addCategory = useCallback(
    async (payload) => {
      try {
        await postCategory(payload);
        await refreshCategories();
        toast.success("✅ Category added successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Add category error:", err);
        toast.error("❌ Failed to add category!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [refreshCategories, refreshApp]
  );

  const updateCategory = useCallback(
    async (id, payload) => {
      try {
        await svcUpdateCategory(id, payload);
        await refreshCategories();
        toast.info("✏️ Category updated successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Update category error:", err);
        toast.error("❌ Failed to update category!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [refreshCategories, refreshApp]
  );

  const deleteCategory = useCallback(
    async (id) => {
      try {
        await svcRemoveCategory(id);
        await refreshCategories();
        toast.success("🗑️ Category deleted successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Delete category error:", err);
        toast.error("❌ Failed to delete category!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [refreshCategories, refreshApp]
  );

  /* ======================================================
     🛒 PRODUCT CRUD
  ====================================================== */
  const addProduct = useCallback(
    async (payload) => {
      try {
        await postProduct(payload, token);
        await refreshProducts();
        toast.success("🆕 Product added successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Add product error:", err);
        toast.error("❌ Failed to add product!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [refreshProducts, refreshApp, token]
  );

  const updateProduct = useCallback(
    async (id, payload) => {
      try {
        await svcUpdateProduct(id, payload, token);
        await refreshProducts();
        toast.info("✏️ Product updated successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Update product error:", err);
        toast.error("❌ Failed to update product!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [refreshProducts, refreshApp, token]
  );

  const deleteProduct = useCallback(
    async (id) => {
      try {
        await svcRemoveProduct(id, token);
        await refreshProducts();
        toast.success("🗑️ Product deleted successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Delete product error:", err);
        toast.error("❌ Failed to delete product!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [refreshProducts, refreshApp, token]
  );

  /* ======================================================
     🧠 CONTEXT VALUE
  ====================================================== */
  const value = useMemo(
    () => ({
      products,
      categories,
      categoryTree,
      loading,
      error,
      refreshAll,
      refreshProducts,
      refreshCategories,
      addCategory,
      updateCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct,
    }),
    [
      products,
      categories,
      categoryTree,
      loading,
      error,
      refreshAll,
      refreshProducts,
      refreshCategories,
      addCategory,
      updateCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct,
    ]
  );

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
