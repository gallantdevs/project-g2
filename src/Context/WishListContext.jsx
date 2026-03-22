import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  getWishlist,
  addToWishlist,
  updateWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../Services/wishListService.js";

import { useGlobal } from "./GlobalContext.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { toast, Bounce } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

export const WishListContext = createContext();

export const WishListProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { refreshApp } = useGlobal();
  const { user, token } = useContext(AuthContext);

  /* ======================================================
     🔄 FETCH WISHLIST
  ====================================================== */
  const refreshWishlist = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const data = await getWishlist(user._id, token);
      setWishlist(Array.isArray(data) ? data : []);
      // toast.info("💖 Wishlist loaded successfully!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(err.message || "Failed to fetch wishlist");

      toast.error("❌ Failed to load wishlist!", {
        position: "top-center",
        transition: Bounce,
      });

      if (err.message?.includes("401")) refreshApp();
    } finally {
      setLoading(false);
    }
  }, [user, token, refreshApp]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  /* ======================================================
     ➕ ADD ITEM TO WISHLIST
  ====================================================== */
  const addWishlistItem = useCallback(
    async (productId, note = "") => {
      try {
        const payload = { userId: user._id, productId, note };
        await addToWishlist(payload, token);
        await refreshWishlist();
        toast.success("✅ Added to wishlist!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Add wishlist error:", err);
        toast.error("❌ Failed to add item to wishlist!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [user, token, refreshWishlist, refreshApp]
  );

  /* ======================================================
     ✏️ UPDATE WISHLIST NOTE
  ====================================================== */
  const updateWishlistNote = useCallback(
    async (id, note) => {
      try {
        await updateWishlist(id, { note }, token);
        await refreshWishlist();
        toast.info("📝 Wishlist note updated!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Update wishlist error:", err);
        toast.error("❌ Failed to update wishlist note!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [token, refreshWishlist, refreshApp]
  );

  /* ======================================================
     ❌ REMOVE ITEM FROM WISHLIST
  ====================================================== */
  const removeWishlistItem = useCallback(
    async (id) => {
      try {
        await removeFromWishlist(id, token);
        await refreshWishlist();
        toast.success("🗑️ Item removed from wishlist!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Remove wishlist error:", err);
        toast.error("❌ Failed to remove item!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
      }
    },
    [token, refreshWishlist, refreshApp]
  );

  /* ======================================================
     🧹 CLEAR ENTIRE WISHLIST
  ====================================================== */
  const clearAllWishlist = useCallback(async () => {
    try {
      await clearWishlist(user._id, token);
      setWishlist([]);
      toast.warn("🧹 Wishlist cleared!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Clear wishlist error:", err);
      toast.error("❌ Failed to clear wishlist!", {
        position: "top-center",
        transition: Bounce,
      });
      if (err.message?.includes("401")) refreshApp();
    }
  }, [user, token, refreshApp]);

  /* ======================================================
     🧠 CONTEXT VALUE
  ====================================================== */
  const value = useMemo(
    () => ({
      wishlist,
      loading,
      error,
      refreshWishlist,
      addWishlistItem,
      updateWishlistNote,
      removeWishlistItem,
      clearAllWishlist,
    }),
    [
      wishlist,
      loading,
      error,
      refreshWishlist,
      addWishlistItem,
      updateWishlistNote,
      removeWishlistItem,
      clearAllWishlist,
    ]
  );

  return (
    <WishListContext.Provider value={value}>
      {children}
    </WishListContext.Provider>
  );
};
