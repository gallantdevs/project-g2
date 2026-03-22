import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getCart as svcGetCart,
  addToCart as svcAddToCart,
  updateCartItem as svcUpdateCartItem,
  removeCartItem as svcRemoveCartItem,
  applyCoupon as svcApplyCoupon,
  clearCart as svcClearCart,
  addComboToCart as svcAddComboToCart,
  removeCoupon as svcRemoveCoupon,
} from "../Services/cartService.js";

import { useGlobal } from "./GlobalContext.jsx";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { refreshApp } = useGlobal();

  // 🔁 Refresh Cart
  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await svcGetCart();
      setCart(data || { items: [] });
      // toast.info("🛒 Cart refreshed!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      if (err.message?.includes("Unauthorized")) {
        refreshApp();
      }
      setError(err.message);
      // toast.error("❌ Failed to load cart!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } finally {
      setLoading(false);
    }
  }, [refreshApp]);

  // ➕ Add Item
  const add = useCallback(
    async (itemData) => {
      try {
        await svcAddToCart(itemData);
        await refreshCart();
        toast.success("✅ Item added to cart!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Add to cart failed:", err);
        toast.error("❌ Failed to add item!", {
          position: "top-center",
          transition: Bounce,
        });
        await refreshCart(); // fallback sync
      }
    },
    [refreshCart]
  );

  // ✏️ Update Item
  const update = useCallback(
    async (itemId, quantity) => {
      try {
        await svcUpdateCartItem(itemId, quantity);
        await refreshCart();
        toast.info("🛍️ Cart item updated!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Update cart failed:", err);
        toast.error("❌ Failed to update item!", {
          position: "top-center",
          transition: Bounce,
        });
      }
    },
    [refreshCart]
  );

  // ❌ Remove Item
  const remove = useCallback(
    async (itemId) => {
      try {
        await svcRemoveCartItem(itemId);
        await refreshCart();
        toast.success("🗑️ Item removed from cart!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Remove cart failed:", err);
        toast.error("❌ Failed to remove item!", {
          position: "top-center",
          transition: Bounce,
        });
      }
    },
    [refreshCart]
  );

  // 🎟️ Apply Coupon
  const apply = useCallback(
    async (couponCode) => {
      try {
        if (!cart?.items?.length)
          throw new Error("Your cart is empty, add products first!");

        const code =
          typeof couponCode === "string"
            ? couponCode.trim()
            : couponCode?.code || "";

        const cartItems = cart.items.map((item) => {
          const category = item.product?.category || item.category || {};
          return {
            _id: item.product?._id || item._id,
            category: {
              _id: category._id || null,
              slug: category.slug || category.name || "",
            },
            price: item.price,
            quantity: item.quantity,
          };
        });

        const data = {
          code,
          cartItems,
          cartTotal: cartItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          ),
          userId: sessionStorage.getItem("userId") || "",
        };

        const result = await svcApplyCoupon(data);
        if (result?.success) {
          setCart((prev) => ({
            ...prev,
            coupon: {
              code,
              discountAmount: result.discountAmount,
            },
          }));

          toast.success(`🎉 Coupon "${code}" applied successfully!`, {
            position: "top-center",
            transition: Bounce,
          });
        } else {
          toast.warn("⚠️ Invalid or expired coupon!", {
            position: "top-center",
            transition: Bounce,
          });
        }

        return result;
      } catch (err) {
        console.error("❌ Apply coupon failed:", err);
        toast.error("❌ Failed to apply coupon!", {
          position: "top-center",
          transition: Bounce,
        });
        throw err;
      }
    },
    [cart]
  );

  // ❌ Remove Coupon
  const removeCoupon = useCallback(async () => {
    try {
      await svcRemoveCoupon();
      await refreshCart();
      toast.info("🎟️ Coupon removed!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("❌ Remove coupon failed:", err);
      toast.error("❌ Failed to remove coupon!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    }
  }, [refreshCart]);

  // 🧹 Clear Cart
  const clear = useCallback(async () => {
    try {
      await svcClearCart();
      await refreshCart();
      toast.info("🧺 Cart cleared!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Clear cart failed:", err);
      toast.error("❌ Failed to clear cart!", {
        position: "top-center",
        transition: Bounce,
      });
    }
  }, [refreshCart]);

  // 🎁 Add Combo
  const addCombo = useCallback(
    async (comboData) => {
      try {
        await svcAddComboToCart(comboData);
        await refreshCart();
        toast.success("🎁 Combo added to cart!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Add combo failed:", err);
        toast.error("❌ Failed to add combo!", {
          position: "top-center",
          transition: Bounce,
        });
      }
    },
    [refreshCart]
  );

  // Load on Mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      refreshCart,
      add,
      update,
      remove,
      apply,
      removeCoupon,
      clear,
      addCombo,
    }),
    [
      cart,
      loading,
      error,
      refreshCart,
      add,
      update,
      remove,
      apply,
      removeCoupon,
      clear,
      addCombo,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
