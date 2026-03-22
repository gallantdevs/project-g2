import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getCoupons as svcGetCoupons,
  createCoupon as svcCreateCoupon,
  updateCoupon as svcUpdateCoupon,
  deleteCoupon as svcDeleteCoupon,
  validateCoupon as svcValidateCoupon,
  applyCoupon as svcApplyCoupon,
} from "../Services/couponService.js";

import { useGlobal } from "./GlobalContext.jsx";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CouponContext = createContext();

export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { refreshApp } = useGlobal();

  // 🔁 Fetch all coupons
  const refreshCoupon = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await svcGetCoupons();
      setCoupons(data.coupons || []);
      // toast.success("🎟️ Coupons loaded successfully!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
      console.log("Coupon", coupons);
    } catch (err) {
      console.error("❌ Error fetching coupons:", err);
      setError(err.message || "Failed to load coupons");

      toast.error("❌ Failed to load coupons!", {
        position: "top-center",
        transition: Bounce,
      });

      if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
        console.warn("Session expired — reloading app...");
        refreshApp();
      }
    } finally {
      setLoading(false);
    }
  }, [refreshApp]);

  // ➕ Create new coupon
  const add = useCallback(
    async (couponData) => {
      try {
        const result = await svcCreateCoupon(couponData);
        await refreshCoupon();
        if (result?.success) {
          toast.success("✅ Coupon created successfully!", {
            position: "top-center",
            transition: Bounce,
          });
        } else {
          toast.warn("⚠️ Failed to create coupon!", {
            position: "top-center",
            transition: Bounce,
          });
        }
        return result;
      } catch (err) {
        console.error("❌ Add coupon failed:", err);
        toast.error("❌ Error while creating coupon!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
        throw err;
      }
    },
    [refreshCoupon, refreshApp]
  );

  // ✏️ Update existing coupon
  const update = useCallback(
    async (id, data) => {
      try {
        const result = await svcUpdateCoupon(id, data);
        await refreshCoupon();
        toast.info("✏️ Coupon updated successfully!", {
          position: "top-center",
          transition: Bounce,
        });
        return result;
      } catch (err) {
        console.error("❌ Update coupon failed:", err);
        toast.error("❌ Failed to update coupon!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
        throw err;
      }
    },
    [refreshCoupon, refreshApp]
  );

  // ❌ Delete coupon
  const remove = useCallback(
    async (id) => {
      try {
        const result = await svcDeleteCoupon(id);
        await refreshCoupon();
        toast.success("🗑️ Coupon deleted successfully!", {
          position: "top-center",
          transition: Bounce,
        });
        return result;
      } catch (err) {
        console.error("❌ Delete coupon failed:", err);
        toast.error("❌ Failed to delete coupon!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
        throw err;
      }
    },
    [refreshCoupon, refreshApp]
  );

  // 🟡 Validate coupon (preview at checkout)
  const validate = useCallback(
    async (data) => {
      try {
        const result = await svcValidateCoupon(data);
        if (result?.valid) {
          toast.success("✅ Coupon is valid!", {
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
        console.error("❌ Coupon validation failed:", err);
        toast.error("❌ Error validating coupon!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
        throw err;
      }
    },
    [refreshApp]
  );

  // 💰 Apply coupon (final apply)
  const apply = useCallback(
    async (data) => {
      try {
        const result = await svcApplyCoupon(data);
        if (result?.success) {
          toast.success("🎉 Coupon applied successfully!", {
            position: "top-center",
            transition: Bounce,
          });
        } else {
          toast.warn("⚠️ Failed to apply coupon!", {
            position: "top-center",
            transition: Bounce,
          });
        }
        return result;
      } catch (err) {
        console.error("❌ Coupon apply failed:", err);
        toast.error("❌ Error applying coupon!", {
          position: "top-center",
          transition: Bounce,
        });
        if (err.message?.includes("401")) refreshApp();
        throw err;
      }
    },
    [refreshApp]
  );

  // 🧩 Load coupons on mount
  useEffect(() => {
    refreshCoupon();

    const handleCouponRefresh = () => {
      console.log("🔁 Refreshing coupons after update...");
      setCoupons([]);
      refreshCoupon();
    };

    window.addEventListener("coupon-refresh", handleCouponRefresh);
    return () =>
      window.removeEventListener("coupon-refresh", handleCouponRefresh);
  }, [refreshCoupon]);

  // 🧠 Context value
  const value = useMemo(
    () => ({
      coupons,
      loading,
      error,
      refreshCoupon,
      add,
      update,
      remove,
      validate,
      apply,
    }),
    [
      coupons,
      loading,
      error,
      refreshCoupon,
      add,
      update,
      remove,
      validate,
      apply,
    ]
  );

  return (
    <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
  );
};
