import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { CartContext } from "../Context/CartContext.jsx";
import { CouponContext } from "../Context/CouponContext.jsx";
import { ProductContext } from "../Context/ProductContext.jsx";
import styles from "./Cart.module.css";
import { FaTrash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const comboQuantityOptions = Array.from({ length: 10 }, (_, i) => i + 1).map(
  (q) => ({ value: q, label: `Qty: ${q}` })
);
const regularQuantityOptions = Array.from({ length: 10 }, (_, i) => i + 1).map(
  (q) => ({ value: q, label: `${q}` })
);

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "38px",
    height: "38px",
    fontSize: "14px",
    borderColor: "#ddd",
    boxShadow: "none",
    "&:hover": { borderColor: "#ccc" },
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "38px",
    padding: "0 8px",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "38px",
  }),
  menu: (provided) => ({
    ...provided,
    fontSize: "14px",
    zIndex: 5,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#e0e8f5"
      : state.isFocused
      ? "#f0f0f0"
      : "white",
    color: "black",
    cursor: "pointer",
  }),
};

const Cart = () => {
  const { cart, remove, update, apply, removeCoupon } = useContext(
    CartContext
  ) || {
    cart: { items: [] },
  };
  const { coupons } = useContext(CouponContext) || { coupons: [] };
  const { categories: allCategories } = useContext(ProductContext) || {
    categories: [],
  };

  const categoryMap = useMemo(() => {
    if (!allCategories || allCategories.length === 0) return {};
    return allCategories.reduce((map, category) => {
      map[category._id] = category.name;
      return map;
    }, {});
  }, [allCategories]);

  const [showModal, setShowModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isComboRemoval, setIsComboRemoval] = useState(false);

  const [showCouponSidebar, setShowCouponSidebar] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  const [initialCouponCleared, setInitialCouponCleared] = useState(false);

  const items = cart?.items || [];
  const navigate = useNavigate();

  useEffect(() => {
    if (cart?.coupon && !initialCouponCleared && removeCoupon) {
      removeCoupon().catch((err) => {});
      setInitialCouponCleared(true);
    }
  }, [cart?.coupon, removeCoupon, initialCouponCleared]);

  const { comboGroups, regularItems } = useMemo(() => {
    if (!items || items.length === 0)
      return { comboGroups: {}, regularItems: [] };

    const combos = {};
    const regular = [];

    items.forEach((item) => {
      if (item.isCombo && item.comboId) {
        if (!combos[item.comboId]) {
          combos[item.comboId] = {
            comboId: item.comboId,
            comboSlug: item.comboSlug,
            comboTotalPrice: item.comboTotalPrice,
            comboItemCount: item.comboItemCount,
            quantity: item.quantity,
            items: [],
          };
        }
        combos[item.comboId].items.push(item);
      } else {
        regular.push(item);
      }
    });

    return { comboGroups: combos, regularItems: regular };
  }, [items]);

  const totals = useMemo(() => {
    const totalMrp = items.reduce(
      (sum, item) => sum + (item.mrp || item.price) * item.quantity,
      0
    );

    const totalSellingPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalDiscount = items.reduce(
      (sum, item) =>
        sum + ((item.mrp || item.price) - item.price) * item.quantity,
      0
    );

    const shipping = totalSellingPrice > 1000 ? 0 : 49;
    const couponDiscount = cart?.coupon?.discountAmount || 0;
    const totalAmount = totalSellingPrice + shipping - couponDiscount;

    return {
      totalMrp,
      totalSellingPrice,
      totalDiscount,
      shipping,
      couponDiscount,
      totalAmount: totalAmount < 0 ? 0 : totalAmount,
    };
  }, [items, cart]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty > 0) {
      try {
        const result = await update(itemId, newQty);

        if (result?.couponRemoved) {
          const removedCoupon = result.removedCouponCode || "Coupon";
          setCouponMessage(
            `⚠️ ${removedCoupon} removed - Cart total below minimum purchase requirement`
          );
          setCouponCode("");
          setCouponApplied(false);
          setTimeout(() => setCouponMessage(""), 5000);
        }

        if (result?.couponRecalculated && !result?.couponRemoved) {
          setCouponMessage("✅ Coupon discount updated");
          setTimeout(() => setCouponMessage(""), 2000);
        }
      } catch (err) {
        setCouponMessage("❌ Failed to update cart");
        setTimeout(() => setCouponMessage(""), 3000);
      }
    }
  };

  const handleComboQuantityChange = async (comboId, newQty) => {
    if (newQty > 0) {
      const comboItems = comboGroups[comboId]?.items || [];

      try {
        for (const item of comboItems) {
          await update(item._id, newQty);
        }

        setCouponMessage("✅ Combo quantity updated");
        setTimeout(() => setCouponMessage(""), 2000);
      } catch (err) {
        setCouponMessage("❌ Failed to update combo");
        setTimeout(() => setCouponMessage(""), 3000);
      }
    }
  };

  const handleDeleteClick = (itemId, isCombo = false) => {
    setItemToRemove(itemId);
    setIsComboRemoval(isCombo);
    setShowModal(true);
  };

  const confirmRemove = async () => {
    if (itemToRemove) {
      try {
        if (isComboRemoval) {
          const comboItems = comboGroups[itemToRemove]?.items || [];
          for (const item of comboItems) {
            await remove(item._id);
          }
        } else {
          await remove(itemToRemove);
        }
        setItemToRemove(null);
        setIsComboRemoval(false);
        setShowModal(false);
      } catch (err) {}
    }
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
        setCouponApplied(true);
        setCouponMessage(
          `✅ ${result.message} You saved ₹${result.discountAmount}`
        );

        setTimeout(() => {
          setShowCouponSidebar(false);
          setCouponCode("");
          setCouponApplied(false);
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
      setCouponCode("");
      setCouponApplied(false);
      setTimeout(() => setCouponMessage(""), 2000);
    } catch (err) {
      setCouponMessage("❌ Failed to remove coupon");
    }
  };

  return (
    <div className={styles.cartPage}>
      {couponMessage && !showCouponSidebar && (
        <div
          className={`${styles.floatingNotification} ${
            couponMessage.includes("✅") ? styles.success : styles.warning
          }`}
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: "8px",
            backgroundColor: couponMessage.includes("✅")
              ? "#10b981"
              : "#f59e0b",
            color: "white",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {couponMessage}
        </div>
      )}

      <div className={styles.cartContainer}>
        <div className={styles.cartItemsSection}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <img
                src="/Empty.jpg"
                alt="Empty Cart"
                className={styles.emptyImg}
              />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <>
              {Object.values(comboGroups).map((combo) => (
                <div key={combo.comboId} className={styles.comboCard}>
                  <div className={styles.comboHeader}>
                    <div className={styles.comboBadge}>
                      🎁 COMBO DEAL - PICK ANY {combo.comboItemCount}
                    </div>
                    <span className={styles.comboPrice}>
                      ₹{combo.comboTotalPrice} ({combo.comboItemCount} items)
                    </span>
                  </div>

                  <div className={styles.comboItemsGrid}>
                    {combo.items.map((item) => (
                      <div key={item._id} className={styles.comboItem}>
                        <img
                          src={
                            item.product?.variants?.[0]?.images?.[0]?.url ||
                            "/placeholder.png"
                          }
                          alt={item.product?.title}
                          className={styles.comboItemImage}
                        />
                        <div className={styles.comboItemInfo}>
                          <h4>{item.product?.title}</h4>
                          <p>Color: {item.variant?.color}</p>
                          <p>Size: {item.variant?.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.comboActions}>
                    <Select
                      options={comboQuantityOptions}
                      value={comboQuantityOptions.find(
                        (q) => q.value === combo.quantity
                      )}
                      onChange={(selected) =>
                        handleComboQuantityChange(
                          combo.comboId,
                          selected.value
                        )
                      }
                      className={styles.comboQtySelect}
                      styles={customSelectStyles}
                      isSearchable={false}
                    />

                    <button
                      className={styles.removeCombo}
                      onClick={() => handleDeleteClick(combo.comboId, true)}
                    >
                      <FaTrash /> Remove Combo
                    </button>
                  </div>

                  <div className={styles.comboTotal}>
                    Total: ₹{combo.comboTotalPrice * combo.quantity}
                  </div>
                </div>
              ))}

              {regularItems.map((item) => (
                <div key={item._id} className={styles.cartCard}>
                  <img
                    src={
                      item.product?.variants?.[0]?.images?.[0]?.url ||
                      "/placeholder.png"
                    }
                    alt={item.product?.title}
                    className={styles.cartItemImg}
                  />

                  <div className={styles.cartItemInfo}>
                    <h3>{item.product?.title}</h3>
                    <p className={styles.category}>
                      {item.category?.name || "Casual Shirts"}
                    </p>
                    <p className={styles.price}>
                      ₹{item.price}{" "}
                      <span className={styles.mrp}>
                        ₹{item.mrp || item.price}
                      </span>{" "}
                      <span className={styles.off}>
                        (
                        {Math.round(
                          (((item.mrp || item.price) - item.price) /
                            (item.mrp || item.price)) *
                            100
                        )}
                        % Off)
                      </span>
                    </p>
                    <p className={styles.save}>
                      You Save ₹{(item.mrp || item.price) - item.price}
                    </p>
                    <p>
                      Color: <strong>{item.variant?.color}</strong> &nbsp;|
                      &nbsp; Size: <strong>{item.variant?.size}</strong>
                    </p>

                    <Select
                      options={regularQuantityOptions}
                      value={regularQuantityOptions.find(
                        (q) => q.value === item.quantity
                      )}
                      onChange={(selected) =>
                        handleQuantityChange(item._id, selected.value)
                      }
                      className={styles.qtySelect}
                      styles={customSelectStyles}
                      isSearchable={false}
                    />
                  </div>

                  <div className={styles.cartActions}>
                    <button onClick={() => handleDeleteClick(item._id, false)}>
                      <FaTrash /> Delete
                    </button>
                    <button className={styles.wishlistBtn}>
                      Move To Wishlist
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.cartSummary}>
            <button
              className={styles.viewAllCoupons}
              onClick={() => setShowCouponSidebar(true)}
            >
              🎫 View All Coupons And Rewards →
            </button>

            {cart?.coupon && (
              <div className={styles.rewardsApplied}>
                <p>🎁 Coupon Applied: {cart.coupon.code}</p>
                <p className={styles.savingText}>
                  You are saving ₹{cart.coupon.discountAmount} with this order
                </p>
                <button
                  className={styles.removeBtn}
                  onClick={handleRemoveCoupon}
                >
                  Remove
                </button>
              </div>
            )}

            <h2>Price Details ({items.length} Items)</h2>

            <div className={styles.summaryRow}>
              <span>Total MRP (Incl. of Taxes)</span>
              <span>₹{totals.totalMrp}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Discount</span>
              <span className={styles.green}>- ₹{totals.totalDiscount}</span>
            </div>

            {totals.couponDiscount > 0 && (
              <div className={styles.summaryRow}>
                <span>Coupon Discount</span>
                <span className={styles.green}>
                  - ₹{totals.couponDiscount}
                </span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>
                {totals.shipping === 0 ? (
                  <span className={styles.green}>Free</span>
                ) : (
                  `₹${totals.shipping}`
                )}
              </span>
            </div>

            <div className={styles.totalRow}>
              <strong>Total Amount</strong>
              <strong>₹{totals.totalAmount}</strong>
            </div>

            <button
              className={styles.placeOrderBtn}
              onClick={() => navigate("/checkout")}
            >
              Place Order
            </button>
          </div>
        )}
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
              Cart Total: ₹{totals.totalSellingPrice}
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
                const isExpired = new Date(coupon.expireAt) < new Date();
                const isActive = coupon.active && !isExpired;

                const cartValue = totals.totalSellingPrice;
                const meetsMinPurchase =
                  !coupon.minPurchase || cartValue >= coupon.minPurchase;

                const cartCategoryIds = items.map(
                  (item) => item.product?.category?._id?.toString()
                );

                const couponCategoryIds = (coupon.categories || []).map((c) =>
                  typeof c === "string" ? c : c._id?.toString()
                );

                let isApplicableCategory = true;
                if (couponCategoryIds.length > 0) {
                  isApplicableCategory = couponCategoryIds.some((catId) =>
                    cartCategoryIds.includes(catId)
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
                if (!isActive) {
                  disabledReason = "Expired or inactive";
                } else if (!meetsMinPurchase) {
                  const amountNeeded = coupon.minPurchase - cartValue;
                  disabledReason = `Add ₹${Math.round(
                    amountNeeded
                  )} more to avail`;
                } else if (!isApplicableCategory || !isApplicableProduct) {
                  disabledReason = "Not applicable to items in your cart";
                }

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
                          {couponCategoryIds.length
                            ? `Valid on: ${couponCategoryIds
                                .map(
                                  (id) =>
                                    categoryMap[id] || "Category"
                                )
                                .join(", ")}`
                            : "All products"}
                        </p>

                        {!isValidCoupon && disabledReason && (
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
                      <button className={styles.applyOfferBtn} disabled>
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

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>
              {isComboRemoval ? "Remove Entire Combo?" : "Remove Item?"}
            </h3>
            <p>
              {isComboRemoval
                ? "Are you sure you want to remove this entire combo from your cart?"
                : "Are you sure you want to remove this product? You can move it to your Wishlist & buy later."}
            </p>
            <div className={styles.modalButtons}>
              <button onClick={confirmRemove} className={styles.yesBtn}>
                YES
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={styles.noBtn}
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-center align-items-center mt-5 gap-1">
        <img src="/lock.png" alt="" />
        <img src="/rupay.png" alt="" />
        <img src="/paytm.png" alt="" />
        <img src="/visa.png" alt="" />
        <img src="/maestro.png" alt="" />
        <img src="/card.png" alt="" />
        <img src="/net.png" alt="" />
        <img src="/upi.png" alt="" />
      </div>
    </div>
  );
};

export default Cart;