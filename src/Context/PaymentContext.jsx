import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  createOrder,
  verifyPayment,
  getAllPayments,
} from "../Services/PaymentService.js";
import { useGlobal } from "./GlobalContext.jsx";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { refreshApp } = useGlobal();

  /* ======================================================
     💰 FETCH PAYMENTS (Admin or User)
  ====================================================== */
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const paymentsData = await getAllPayments();
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);

      // toast.info("💳 Payments fetched successfully!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Failed to load payments");
      setPayments([]);

      // toast.error("❌ Failed to fetch payments!", {
      //   position: "top-center",
      //   transition: Bounce,
      // });

      if (err.message?.includes("401")) {
        console.warn("Payment fetch unauthorized — refreshing app...");
        refreshApp();
      }
    } finally {
      setLoading(false);
    }
  }, [refreshApp]);

  /* ======================================================
     💳 INITIATE PAYMENT (Razorpay Integration)
  ====================================================== */
  const initiatePayment = useCallback(
    async (amountToPay, createdOrderId, prefillData = {}) => {
      setLoading(true);
      setLoading(true);
      setError(null);

      try {
        const order = await createOrder(amountToPay);
        toast.info("🕐 Payment process started...", {
          position: "top-center",
          transition: Bounce,
        });

        return new Promise((resolve, reject) => {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: "INR",
            name: "Kairoz World",
            description: "Payment Transaction",
            order_id: order.id,

            handler: async (response) => {
              try {
                toast.info("🧾 Verifying payment...", {
                  position: "top-center",
                  transition: Bounce,
                });

                const verificationData = {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: order.amount,
                  orderId: createdOrderId,
                };

                const result = await verifyPayment(verificationData);

                if (result.success) {
                  await fetchPayments();
                  toast.success("✅ Payment verified successfully!", {
                    position: "top-center",
                    transition: Bounce,
                  });
                  setLoading(false);
                  resolve(result);
                } else {
                  toast.error("❌ Payment verification failed!", {
                    position: "top-center",
                    transition: Bounce,
                  });
                  throw new Error("Payment verification failed");
                }
              } catch (err) {
                console.error("Payment verification error:", err);
                setError(err.message);
                setLoading(false);
                toast.error("❌ " + err.message, {
                  position: "top-center",
                  transition: Bounce,
                });
                reject(err);
              }
            },

            modal: {
              ondismiss: () => {
                console.log("Payment modal dismissed");
                toast.warn("⚠️ Payment cancelled by user!", {
                  position: "top-center",
                  transition: Bounce,
                });
                setLoading(false);
                reject(new Error("Payment cancelled by user"));
              },
            },
            prefill: {
              name: prefillData.name || "Customer Name",
              email: prefillData.email || "customer@example.com",
              contact: prefillData.mobile || "9999999999",
            },
            theme: {
              color: "#3399cc",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      } catch (err) {
        console.error("Error initiating payment:", err);
        setError(err.message || "Failed to create order");
        toast.error("❌ Error initiating payment!", {
          position: "top-center",
          transition: Bounce,
        });
        setLoading(false);
        throw err;
      }
    },
    [fetchPayments, refreshApp]
  );

  /* ======================================================
     🧩 Load Payments on Mount
  ====================================================== */
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <PaymentContext.Provider
      value={{
        payments,
        loading,
        error,
        fetchPayments,
        initiatePayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
