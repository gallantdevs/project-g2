import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createOrder,
  getOrders,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
  updateOrderPayment,
  downloadInvoice,
  dispatchOrderService,
  requestReturnService,
  updateReturnStatusService,
  markReturnReceivedService,
  processRefundService,
} from "../Services/orderService.js";
import { useAuth } from "./AuthContext.jsx";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     🧾 1️⃣ CREATE ORDER
  ===================================================== */
  const placeOrder = async (orderData) => {
    try {
      setLoading(true);
      const res = await createOrder(orderData, token);
      if (res.success) {
        setOrders((prev) => [res.order, ...prev]);
        toast.success("🧾 Order placed successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      setError(err.message || "Order creation failed");
      toast.error("❌ Failed to place order!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     📦 2️⃣ FETCH ALL ORDERS (Admin)
  ===================================================== */
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(token);
      if (res.success) {
        setOrders(res.orders);
        // toast.info("📦 Orders loaded successfully!", {
        //   position: "top-center",
        //   transition: Bounce,
        // });
      }
      return res.orders;
    } catch (err) {
      setError(err.message || "Failed to fetch all orders");
      // toast.error("❌ Failed to fetch orders!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🧍 3️⃣ FETCH USER ORDERS
  ===================================================== */
  const fetchUserOrders = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await getOrdersByUser(user._id, token);
      if (res.success) setOrders(res.orders);
    } catch (err) {
      setError(err.message || "Failed to fetch user orders");
      // toast.error("❌ Failed to fetch your orders!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🚚 4️⃣ UPDATE ORDER STATUS (Admin)
  ===================================================== */
  const updateStatus = async (orderId, statusData) => {
    try {
      const res = await updateOrderStatus(orderId, statusData, token);
      if (res.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...res.order } : order
          )
        );
        toast.info("🔄 Order status updated!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      setError(err.message || "Failed to update order");
      toast.error("❌ Failed to update order status!", {
        position: "top-center",
        transition: Bounce,
      });
    }
  };

  /* =====================================================
     ❌ 5️⃣ DELETE ORDER (Admin)
  ===================================================== */
  const removeOrder = async (orderId) => {
    try {
      const res = await deleteOrder(orderId, token);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        toast.success("🗑️ Order deleted successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      setError(err.message || "Failed to delete order");
      toast.error("❌ Failed to delete order!", {
        position: "top-center",
        transition: Bounce,
      });
    }
  };

  /* =====================================================
     💳 6️⃣ UPDATE PAYMENT DETAILS
  ===================================================== */
  const updateOrderAfterPayment = useCallback(
    async (orderId, paymentDetails) => {
      setLoading(true);
      try {
        const updatedOrder = await updateOrderPayment(
          orderId,
          paymentDetails,
          token
        );
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...updatedOrder } : order
          )
        );
        toast.success("💰 Payment updated successfully!", {
          position: "top-center",
          transition: Bounce,
        });
        return updatedOrder;
      } catch (err) {
        console.error("Error updating order after payment:", err);
        setError(err.message || "Failed to update order");
        toast.error("❌ Payment update failed!", {
          position: "top-center",
          transition: Bounce,
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /* =====================================================
     📄 7️⃣ DOWNLOAD INVOICE
  ===================================================== */
  const handleDownloadInvoice = async (orderId) => {
    try {
      setLoading(true);
      await downloadInvoice(orderId, token);
      toast.success("📄 Invoice downloaded successfully!", {
        position: "top-center",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Error downloading invoice:", err.message);
      setError(err.message || "Failed to download invoice");
      toast.error("❌ Failed to download invoice!", {
        position: "top-center",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🔁 8️⃣ REQUEST RETURN (User)
  ===================================================== */
  const requestReturn = async (orderId, reason) => {
    try {
      setLoading(true);
      const res = await requestReturnService(orderId, reason, token);
      if (res.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...res.order } : order
          )
        );
        toast.info("🔁 Return request submitted!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      console.error("Error requesting return:", err.message);
      setError(err.message || "Failed to request return");
      toast.error("❌ Failed to request return!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🧾 9️⃣ UPDATE RETURN STATUS (Admin)
  ===================================================== */
  const updateReturnStatus = async (orderId, status) => {
    try {
      setLoading(true);
      const res = await updateReturnStatusService(orderId, status, token);
      if (res.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, returnRequest: { ...order.returnRequest, status } }
              : order
          )
        );
        toast.info(`🔄 Return status updated to "${status}"`, {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      setError(err.message || "Failed to update return status");
      toast.error("❌ Failed to update return status!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🚀 🔟 DISPATCH ORDER (Admin)
  ===================================================== */
  const dispatchOrder = async (orderId) => {
    try {
      setLoading(true);
      const res = await dispatchOrderService(orderId, token);
      if (res.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...res.order } : order
          )
        );
        toast.success("🚚 Order dispatched successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      setError(err.message || "Shiprocket dispatch failed");
      toast.error("❌ Dispatch failed!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     📦 1️⃣1️⃣ MARK RETURN RECEIVED (Admin)
  ===================================================== */
  const markReturnReceived = async (orderId) => {
    try {
      setLoading(true);
      const res = await markReturnReceivedService(orderId, token);
      if (res.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, returnRequest: res.order.returnRequest }
              : order
          )
        );
        toast.success("📦 Return received successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      setError(err.message || "Failed to mark return as received");
      toast.error("❌ Failed to mark return as received!", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     💸 1️⃣2️⃣ PROCESS REFUND (Admin)
  ===================================================== */
  const processRefund = async (orderId) => {
    try {
      setLoading(true);
      const res = await processRefundService(orderId, token);
      if (res.success) {
        toast.success("💸 Refund processed successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      toast.error("❌ Refund failed: " + err.message, {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     ⚡ Auto-load user orders
  ===================================================== */
  useEffect(() => {
    if (user && user._id) fetchUserOrders();
  }, [user]);

  useEffect(() => {
    if (user && token) {
      if (user.role === "admin" || user.role === "subadmin") {
        fetchAllOrders();
      } else {
        fetchUserOrders();
      }
    }
  }, [user, token]); 
  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        placeOrder,
        fetchAllOrders,
        fetchUserOrders,
        updateStatus,
        removeOrder,
        updateOrderAfterPayment,
        handleDownloadInvoice,
        dispatchOrder,
        requestReturn,
        updateReturnStatus,
        markReturnReceived,
        processRefund,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
