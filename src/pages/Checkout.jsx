import React, { useContext, useState, useMemo } from "react";
import styles from "./Checkout.module.css";
import { CartContext } from "../Context/CartContext.jsx";
import { CouponContext } from "../Context/CouponContext.jsx";
import { AuthContext } from "../Context/AuthContext.jsx";
import { useOrder } from "../Context/OrderContext.jsx";
import { usePayment } from "../Context/PaymentContext.jsx";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cart, removeCoupon, apply, clear } = useContext(CartContext);
  const { coupons } = useContext(CouponContext);
  const { user } = useContext(AuthContext);

  const { placeOrder, updateOrderAfterPayment, handleDownloadInvoice } =
    useOrder();

  const { initiatePayment, loading: paymentLoading } = usePayment();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Online");
  const [showCouponSidebar, setShowCouponSidebar] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);

  const items = cart?.items || [];

  const totals = useMemo(() => {
    const totalSellingPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = totalSellingPrice > 1000 ? 0 : 49;
    const couponDiscount = cart?.coupon?.discountAmount || 0;
    const totalAmount = totalSellingPrice + shipping - couponDiscount;
    return { totalSellingPrice, shipping, couponDiscount, totalAmount };
  }, [items, cart]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("⚠️ Please enter a coupon code.");
      return;
    }
    try {
      setApplying(true);
      setCouponMessage("");
      const result = await apply(couponCode.trim());
      if (result?.success) {
        setCouponMessage(
          `✅ ${result.message} You saved ₹${result.discountAmount}`
        );
        setTimeout(() => {
          setShowCouponSidebar(false);
          setCouponCode("");
          setCouponMessage("");
        }, 2000);
      } else {
        setCouponMessage("❌ Invalid or expired coupon!");
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to apply coupon.";
      setCouponMessage(`❌ ${errorMsg}`);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setCouponMessage("✅ Coupon removed successfully");
      setTimeout(() => setCouponMessage(""), 2000);
    } catch {
      setCouponMessage("❌ Failed to remove coupon");
    }
  };

  const handlePlaceOrder = async () => {
    if (
      !address.fullName ||
      !address.mobile ||
      !address.address ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      alert("⚠️ Please fill all address fields!");
      return;
    }

    const orderData = {
      user: user?._id,
    cartItems: items.map((i) => ({
  product: i.productId || i.product?._id,
  quantity: i.quantity,
  price: i?.isCombo
    ? Number(i.comboTotalPrice || 0) / Number(i.comboItemCount || 1)
    : Number(i.price || 0),
  color: i.color || i.variant?.color,
  size: i.size || i.variant?.size,

  isCombo: !!i.isCombo,
  comboId: i.comboId || null,
  comboSlug: i.comboSlug || null,
  comboTotalPrice: i.comboTotalPrice || null,
  comboItemCount: i.comboItemCount || null,
})),

      totalAmount: totals.totalSellingPrice,
      finalAmount: totals.totalAmount,
      shippingAddress: {
        name: address.fullName,
        mobile: address.mobile,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      paymentMethod: paymentMethod,
      couponCode: cart?.coupon?.code || null,
      paymentStatus: paymentMethod === "Online" ? "initiated" : "Pending",
    };
    console.log(
      "DEBUG: Data being sent to backend:",
      JSON.stringify(orderData, null, 2)
    );
    try {
      setOrderLoading(true);

      console.log("Creating order in local DB...");

      const createdOrderResponse = await placeOrder(orderData);

      if (!createdOrderResponse?.success || !createdOrderResponse?.order) {
        throw new Error("Failed to create order in database.");
      }

      const createdOrder = createdOrderResponse.order;
      if (paymentMethod === "COD") {
        alert("✅ Order placed successfully (COD)!");
        setOrderSuccess(true);
        setLastOrderId(createdOrder._id);
        clear();
      } else if (paymentMethod === "Online") {
        console.log("Initiating Razorpay payment...");

        const paymentResult = await initiatePayment(
          createdOrder.finalAmount,
          createdOrder._id,
          {
            name: address.fullName,
            email: address.email,
            mobile: address.mobile,
          }
        );

        console.log("Payment successful, updating order status...");

        console.log("Payment successful, updating order status...");
        await updateOrderAfterPayment(createdOrder._id, {
          paymentStatus: "Paid",
          razorpayPaymentId: paymentResult.razorpay_payment_id,
        });

        // alert("✅ Order placed and payment successful!");
        setOrderSuccess(true);
        setLastOrderId(createdOrder._id);
        clear();
      }
    } catch (err) {
      console.error("Order failed:", err);
      alert(`❌ Order Failed: ${err.message}`);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.checkoutContainer}>
        <div className={styles.addressSection}>
          <h2>Delivery Address</h2>
          <form className={styles.addressForm}>
            <div className={styles.row}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={address.fullName}
                onChange={handleAddressChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={address.email}
                onChange={handleAddressChange}
              />
            </div>

            <div className={styles.row}>
              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={address.mobile}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pin Code"
                value={address.pincode}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div className={styles.row}>
              <input
                type="text"
                name="city"
                placeholder="City / District"
                value={address.city}
                onChange={handleAddressChange}
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={address.state}
                onChange={handleAddressChange}
                required
              />
            </div>

            <textarea
              name="address"
              placeholder="Address (House No, Street, Area)"
              value={address.address}
              onChange={handleAddressChange}
              rows="3"
              required
            ></textarea>

            <h2 style={{ marginTop: "20px" }}>Payment Method</h2>
            <div className={styles.paymentOptions}>
              <label
                className={`${styles.paymentOption} ${
                  paymentMethod === "Online" ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={paymentMethod === "Online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💳 Pay Online</span>
              </label>
              <label
                className={`${styles.paymentOption} ${
                  paymentMethod === "COD" ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💵 Cash on Delivery (COD)</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              className={styles.continueBtn}
              disabled={orderLoading || paymentLoading}
            >
              {orderLoading
                ? "Placing Order..."
                : paymentLoading
                ? "Processing Payment..."
                : paymentMethod === "Online"
                ? "Proceed to Pay"
                : "Place Order (COD)"}
            </button>
          </form>
        </div>

        <div className={styles.summarySection}>
          <button
            className={styles.viewCoupons}
            onClick={() => setShowCouponSidebar(true)}
          >
            🎫 View All Coupons & Rewards →
          </button>

          {cart?.coupon && (
            <div className={styles.rewardsApplied}>
              <p>🎁 Coupon Applied: {cart.coupon.code}</p>
              <p className={styles.savingText}>
                You saved ₹{cart.coupon.discountAmount}
              </p>
              <button onClick={handleRemoveCoupon} className={styles.removeBtn}>
                Remove
              </button>
            </div>
          )}

          <h2>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Cart Total</span>
            <span>₹{totals.totalSellingPrice}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>
              {totals.shipping === 0 ? "Free" : `₹${totals.shipping}`}
            </span>
          </div>
          {totals.couponDiscount > 0 && (
            <div className={styles.summaryRow}>
              <span>Coupon Discount</span>
              <span className={styles.green}>-₹{totals.couponDiscount}</span>
            </div>
          )}
          <div className={styles.totalRow}>
            <strong>Total Payable</strong>
            <strong>₹{totals.totalAmount}</strong>
          </div>
        </div>
      </div>

      <div
        className={`${styles.couponSidebar} ${
          showCouponSidebar ? styles.open : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <div>
            <h3>Available Coupons</h3>
            <p className={styles.cartTotal}>
              Cart Total: ₹{totals.totalAmount}
            </p>
          </div>
          <button onClick={() => setShowCouponSidebar(false)}>
            <IoClose size={22} />
          </button>
        </div>

        <div className={styles.sidebarContent}>
          <div className={styles.couponInputBox}>
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button
              className={styles.applyInputBtn}
              onClick={handleApplyCoupon}
              disabled={applying}
            >
              {applying ? "Applying..." : "Apply"}
            </button>
          </div>

          {couponMessage && (
            <div
              className={`${styles.couponMsg} ${
                couponMessage.includes("✅")
                  ? styles.successMsg
                  : styles.errorMsg
              }`}
            >
              {couponMessage}
            </div>
          )}

          <div className={styles.bestOffers}>
            <h4>🎁 Best Offers for You</h4>
            {coupons.length === 0 ? (
              <p className={styles.noCoupons}>No coupons available.</p>
            ) : (
              coupons.map((coupon) => {
                const now = new Date();
                const isExpired =
                  coupon.expireAt && new Date(coupon.expireAt) < now;
                const isActive = coupon.active && !isExpired;

                const cartTotal =
                  totals.totalSellingPrice || totals.totalAmount;
                const meetsMinPurchase =
                  !coupon.minPurchase || cartTotal >= coupon.minPurchase;

                let isApplicableCategory = true;
                if (coupon.categories?.length > 0) {
                  const cartCategories = items.map((item) =>
                    item.product?.category?.name?.toLowerCase()
                  );
                  const couponCategoryNames = coupon.categories.map((c) =>
                    typeof c === "string"
                      ? c.toLowerCase()
                      : c.name?.toLowerCase() || c.slug?.toLowerCase()
                  );
                  isApplicableCategory = couponCategoryNames.some((cat) =>
                    cartCategories.includes(cat)
                  );
                }

                let isApplicableProduct = true;
                if (coupon.productIds?.length > 0) {
                  const cartProducts = items.map((item) =>
                    item.product?._id?.toString()
                  );
                  const couponProductIds = coupon.productIds.map((p) =>
                    typeof p === "string" ? p : p._id?.toString()
                  );
                  isApplicableProduct = couponProductIds.some((p) =>
                    cartProducts.includes(p)
                  );
                }

                const isValidCoupon =
                  isActive &&
                  meetsMinPurchase &&
                  isApplicableCategory &&
                  isApplicableProduct;

                let disabledReason = "";
                if (!isActive) disabledReason = "Expired or inactive";
                else if (!meetsMinPurchase)
                  disabledReason = `Min purchase ₹${coupon.minPurchase}`;
                else if (!isApplicableCategory && !isApplicableProduct)
                  disabledReason = "Not applicable to your cart";

                return (
                  <div key={coupon._id} className={styles.offerCard}>
                    <div className={styles.offerLeft}>
                      <div>
                        <h5 className={styles.offerTitle}>
                          {coupon.code}
                          {!isActive && (
                            <span className={styles.expiredText}>
                              &nbsp;(Expired)
                            </span>
                          )}
                        </h5>
                        <p className={styles.offerDesc}>
                          {coupon.description ||
                            (coupon.discountType === "percentage"
                              ? `${coupon.discountValue}% off`
                              : `Flat ₹${coupon.discountValue} off`)}
                        </p>

                        <p className={styles.categoryText}>
                          {coupon.categories?.length
                            ? `Valid on: ${coupon.categories
                                .map((c) =>
                                  typeof c === "string"
                                    ? c
                                    : c.name || c.slug || "category"
                                )
                                .join(", ")}`
                            : "All products"}
                        </p>

                        {coupon.minPurchase > 0 && (
                          <p className={styles.addMoreText}>
                            Min purchase ₹{coupon.minPurchase}
                          </p>
                        )}

                        {!isValidCoupon && (
                          <p
                            style={{
                              color: "#d32f2f",
                              fontSize: "12px",
                              fontWeight: "600",
                              marginTop: "5px",
                            }}
                          >
                            ⚠️ {disabledReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {isValidCoupon ? (
                      <button
                        className={styles.applyOfferBtn}
                        onClick={() => setCouponCode(coupon.code)}
                        disabled={applying}
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        className={styles.applyOfferBtn}
                        disabled
                        title={disabledReason}
                      >
                        Not Eligible
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showCouponSidebar && (
        <div
          className={styles.sidebarBackdrop}
          onClick={() => setShowCouponSidebar(false)}
        ></div>
      )}
      {orderSuccess && lastOrderId && (
        <div className={styles.invoiceDownloadBox}>
          <h3>🎉 Order Confirmed!</h3>
          <p>Your invoice is ready to download.</p>
          <button
            onClick={() => handleDownloadInvoice(lastOrderId)}
            className={styles.downloadBtn}
          >
            ⬇️ Download Invoice (PDF)
          </button>
          <button
            onClick={() => navigate("/my-orders")}
            className={styles.continueBtn}
            style={{ marginTop: "12px" }}
          >
            View My Orders →
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
