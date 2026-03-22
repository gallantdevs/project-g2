const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/payment";

console.log("Payment API Base URL:", BASE_URL);


export const createOrder = async (amount) => {
  const res = await fetch(`${BASE_URL}/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create Razorpay order");
  }

  return res.json();
};

export const verifyPayment = async (paymentData) => {
  const res = await fetch(`${BASE_URL}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to verify payment");
  }

  return res.json();
};

export const getAllPayments = async () => {
  const res = await fetch(`${BASE_URL}/`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch payments");
  }

  return res.json();
};
