const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/order";

/* =====================================================
   🧾 1️⃣ CREATE NEW ORDER
   ===================================================== */
export const createOrder = async (orderData, token) => {
  try {
    const res = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create order");
    return data;
  } catch (err) {
    console.error("❌ Error creating order:", err.message);
    throw err;
  }
};

/* =====================================================
   📦 2️⃣ GET ALL ORDERS (Admin)
   ===================================================== */
export const getOrders = async (token) => {
  try {
    const res = await fetch(`${BASE_URL}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
    return data;
  } catch (err) {
    console.error("❌ Error fetching all orders:", err.message);
    throw err;
  }
};

/* =====================================================
   🧍 3️⃣ GET ORDERS BY USER ID
   ===================================================== */
export const getOrdersByUser = async (userId, token) => {
  try {
    const res = await fetch(`${BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch user orders");
    return data;
  } catch (err) {
    console.error("❌ Error fetching user orders:", err.message);
    throw err;
  }
};

/* =====================================================
   🚚 4️⃣ UPDATE ORDER STATUS (Admin)
   ===================================================== */
export const updateOrderStatus = async (orderId, data, token) => {
  try {
    const res = await fetch(`${BASE_URL}/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to update order");
    return result;
  } catch (err) {
    console.error("❌ Error updating order status:", err.message);
    throw err;
  }
};

export const updateOrderPayment = async (orderId, paymentData, token) => {
  const res = await fetch(`${BASE_URL}/${orderId}/payment`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(paymentData),
  });
  if (!res.ok) throw new Error("Failed to update order payment status");
  return res.json();
};

/* =====================================================
   ❌ 5️⃣ DELETE ORDER (Admin)
   ===================================================== */
export const deleteOrder = async (orderId, token) => {
  try {
    const res = await fetch(`${BASE_URL}/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete order");
    return data;
  } catch (err) {
    console.error("❌ Error deleting order:", err.message);
    throw err;
  }
};

/* =====================================================
   📄 6️⃣ DOWNLOAD ORDER INVOICE (PDF)
   ===================================================== */
export const downloadInvoice = async (orderId, token) => {
  try {
    const res = await fetch(`${BASE_URL}/invoice/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) throw new Error("Failed to download invoice");

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice_${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    console.error("❌ Error downloading invoice:", err.message);
    throw err;
  }
};

/* =====================================================
  🚀 7️⃣ DISPATCH ORDER (Shiprocket Integration - Admin)
  ===================================================== */
export const dispatchOrderService = async (orderId, token) => {
  try {
    const res = await fetch(`${BASE_URL}/${orderId}/dispatch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage =
        data.message ||
        data.details ||
        "Failed to dispatch order via Shiprocket";
      throw new Error(errorMessage);
    }
    return data;
  } catch (err) {
    console.error("❌ Error dispatching order:", err.message);
    throw err;
  }
};

/* =====================================================
  🔁 8️⃣ REQUEST RETURN (User)
  ===================================================== */
export const requestReturnService = async (orderId, reason, token) => {
  try {
    const res = await fetch(`${BASE_URL}/${orderId}/return`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to request return");

    return data;
  } catch (err) {
    console.error("❌ Error requesting return:", err.message);
    throw err;
  }
};

/* =====================================================
  🧾 9️⃣ UPDATE RETURN STATUS (Admin)
  ===================================================== */
export const updateReturnStatusService = async (orderId, status, token) => {
  try {
    const res = await fetch(`${BASE_URL}/${orderId}/return-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to update return status");

    return data;
  } catch (err) {
    console.error("❌ Error updating return status:", err.message);
    throw err;
  }
};

/* =====================================================
  📦 🔁 10️⃣ MARK RETURN RECEIVED (Admin)
  ===================================================== */
export const markReturnReceivedService = async (orderId, token) => {
  try {
    const res = await fetch(`${BASE_URL}/${orderId}/return-receive`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to mark return as received");

    return data;
  } catch (err) {
    console.error("❌ Error marking return received:", err.message);
    throw err;
  }
};

/* =====================================================
  💸 11️⃣ PROCESS REFUND (Admin)
  ===================================================== */
export const processRefundService = async (orderId, token) => {
  try {
    const res = await fetch(`${BASE_URL}/${orderId}/refund`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to process refund");

    return data;
  } catch (err) {
    console.error("❌ Error processing refund:", err.message);
    throw err;
  }
};
