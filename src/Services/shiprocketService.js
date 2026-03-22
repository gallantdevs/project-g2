const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function checkDelivery(pincode) {
  try {
    const res = await fetch(`${BASE_URL}/shiprocket/check/${pincode}`);
    if (!res.ok) {
      throw new Error("Failed to check delivery");
    }
    return await res.json();
  } catch (error) {
    console.error("Error checking delivery:", error);
    return { success: false, message: error.message };
  }
}

// ✅ Track AWB
export async function trackAWB(awb, token) {
  try {
    const res = await fetch(`${BASE_URL}/shiprocket/track/${awb}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include", 
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { success: res.ok, rawText: text };
    }

    if (!res.ok) {
      return {
        success: false,
        message: json?.message || text || "Failed to fetch tracking",
      };
    }

    // success
    return { success: true, ...json };
  } catch (err) {
    console.error("trackAWB error:", err);
    return { success: false, message: err.message || "Track failed" };
  }
}
export async function createOrder(orderData) {
  try {
    const res = await fetch(`${BASE_URL}/shiprocket/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      throw new Error("Failed to create order");
    }
    return await res.json();
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, message: error.message };
  }
}
