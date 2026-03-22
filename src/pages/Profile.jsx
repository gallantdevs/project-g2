import React, { useContext, useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { AuthContext } from "../Context/AuthContext.jsx";
import { CouponContext } from "../Context/CouponContext.jsx";
import { useOrder } from "../Context/OrderContext.jsx";
import { WishListContext } from "../Context/WishListContext.jsx";
import { useTracking } from "../Context/TrackingContext.jsx";
import ShipmentDrawer from "../components/ShipmentDrawer.jsx";

// Helper function to find the correct product image
const getProductImage = (product, color) => {
  if (!product || !product.variants) return "/default-product.jpg";
  const variant = product.variants.find((v) => v.color === color);
  if (variant && variant.images && variant.images.length > 0)
    return variant.images[0].url;
  if (product.variants.length > 0 && product.variants[0].images?.length > 0)
    return product.variants[0].images[0].url;
  return "/default-product.jpg";
};

const Profile = () => {
  const { user, saveProfile, logout } = useContext(AuthContext);
  const { coupons } = useContext(CouponContext);
  const { wishlist, refreshWishlist, removeWishlistItem, updateWishlistNote } =
    useContext(WishListContext);

  const {
    orders,
    loading,
    error: orderError,
    fetchUserOrders,
    handleDownloadInvoice,
    requestReturn,
  } = useOrder();

  const {
    openDrawerForOrder,
    closeDrawer,
    drawerOpen,
    drawerMeta,
    trackingData,
    trackingLoading,
    trackingError,
  } = useTracking();

  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [visibleDetailsId, setVisibleDetailsId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Return Request States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (activeTab === "orders" && !ordersLoaded) {
      fetchUserOrders()
        .then(() => setOrdersLoaded(true))
        .catch(() => setOrdersLoaded(true));
    }
    if (activeTab !== "orders") setOrdersLoaded(false);
  }, [activeTab, ordersLoaded, fetchUserOrders]);

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(id);
    setTimeout(() => setCopiedCoupon(null), 5000);
  };

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    gender: user?.gender || "",
    dob: user?.dob ? new Date(user.dob).toISOString().slice(0, 10) : "",
    whatsappUpdates: !!user?.whatsappUpdates,
  });

  const onChange = (k) => (e) =>
    setForm((s) => ({
      ...s,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        gender: form.gender,
        dob: form.dob || null,
        whatsappUpdates: form.whatsappUpdates,
      };
      const res = await saveProfile(payload);
      alert(res?.message || "Profile updated");
    } catch (err) {
      alert("Update failed");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(numericAmount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleDetails = (orderId) => {
    setVisibleDetailsId((prevId) => (prevId === orderId ? null : orderId));
  };

  const openReturnModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowReturnModal(true);
    setReturnReason("");
    setCustomReason("");
  };

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setSelectedOrderId(null);
    setReturnReason("");
    setCustomReason("");
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrderId) return;
    const finalReason =
      returnReason === "Other" ? customReason.trim() : returnReason;
    if (!finalReason) {
      alert("⚠️ Please select or enter a reason for return.");
      return;
    }
    try {
      const res = await requestReturn(selectedOrderId, finalReason);
      if (res.success) {
        alert("✅ Return request submitted successfully!");
        closeReturnModal();
        await fetchUserOrders();
      }
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setNewNote(item.note || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setNewNote("");
  };

  const handleSaveNote = async () => {
    if (!selectedItem?._id) return;
    await updateWishlistNote(selectedItem._id, newNote);
    await refreshWishlist();
    setShowModal(false);
  };

  return (
    <div className={styles.accountContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {(user?.fullName || "U").slice(0, 1).toUpperCase()}
          </div>
          <h3>{user?.fullName || "User"}</h3>
          <p>{user?.email}</p>
          <p>+91 {user?.mobile}</p>
        </div>

        <ul className={styles.menu}>
          <li
            onClick={() => setActiveTab("profile")}
            className={`${styles.menuItem} ${
              activeTab === "profile" ? styles.active : ""
            }`}
          >
            👤 My Profile <span className={styles.arrowIcon}>&gt;</span>
          </li>
          <li
            onClick={() => setActiveTab("orders")}
            className={`${styles.menuItem} ${
              activeTab === "orders" ? styles.active : ""
            }`}
          >
            🛒 My Orders <span className={styles.arrowIcon}>&gt;</span>
          </li>
          <li
            onClick={() => setActiveTab("address")}
            className={`${styles.menuItem} ${
              activeTab === "address" ? styles.active : ""
            }`}
          >
            📍 My Address <span className={styles.arrowIcon}>&gt;</span>
          </li>
          <li
            onClick={() => setActiveTab("wishlist")}
            className={`${styles.menuItem} ${
              activeTab === "wishlist" ? styles.active : ""
            }`}
          >
            💛 Wishlist <span className={styles.arrowIcon}>&gt;</span>
          </li>
          <li
            onClick={() => setActiveTab("wallet")}
            className={`${styles.menuItem} ${
              activeTab === "wallet" ? styles.active : ""
            }`}
          >
            💳 Kairoz Wallet <span className={styles.arrowIcon}>&gt;</span>
          </li>
          <li
            onClick={() => setActiveTab("rewards")}
            className={`${styles.menuItem} ${
              activeTab === "rewards" ? styles.active : ""
            }`}
          >
            🎁 Kairoz Rewards <span className={styles.arrowIcon}>&gt;</span>
          </li>
          <li
            onClick={() => setActiveTab("coupons")}
            className={`${styles.menuItem} ${
              activeTab === "coupons" ? styles.active : ""
            }`}
          >
            🎟 Coupons <span className={styles.arrowIcon}>&gt;</span>
          </li>
          <li
            onClick={() => setActiveTab("contact")}
            className={`${styles.menuItem} ${
              activeTab === "contact" ? styles.active : ""
            }`}
          >
            📞 Contact Us <span className={styles.arrowIcon}>&gt;</span>
          </li>
          <li onClick={logout} className={styles.logout}>
            🚪 Logout
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <main className={styles.content}>
        {/* Profile */}
        {activeTab === "profile" && (
          <div>
            <h2>My Profile</h2>
            <form className={styles.form} onSubmit={onSubmit}>
              <label>Full Name*</label>
              <input value={form.fullName} onChange={onChange("fullName")} />
              <label>Email*</label>
              <input
                type="email"
                value={form.email}
                onChange={onChange("email")}
              />
              <label>Mobile*</label>
              <input value={form.mobile} disabled />
              <label>Gender*</label>
              <select
                className={styles.selectBox}
                value={form.gender}
                onChange={onChange("gender")}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <label>Date of birth*</label>
              <input type="date" value={form.dob} onChange={onChange("dob")} />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.whatsappUpdates}
                  onChange={onChange("whatsappUpdates")}
                />
                I want to receive order updates on WhatsApp
              </label>
              <button className={styles.saveButton} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className={styles.ordersContainer}>
            <h2>My Orders</h2>
            {loading && <p>Loading orders...</p>}
            {orderError && <p className={styles.error}>Error: {orderError}</p>}
            {!loading && ordersLoaded && (!orders || orders.length === 0) && (
              <div className={styles.emptyOrders}>
                <img
                  src="/emptyorders.png"
                  alt="No Orders Yet"
                  className={styles.emptyOrdersImage}
                />
                <h3>No Order Placed Yet</h3>
                <p>You have not placed an order yet.</p>
                <button className={styles.exploreButton}>
                  Explore products
                </button>
              </div>
            )}
            {!loading && orders && orders.length > 0 && (
              <div className={styles.orderList}>
                {orders.map((order) => (
                  <div key={order._id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <span className={styles.orderId}>
                        Order ID: {String(order._id).toUpperCase()}
                      </span>
                      <span className={styles.orderDate}>
                        Date: {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className={styles.orderDetails}>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className={styles.statusBadge}>
                          {order.orderStatus}
                        </span>
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {formatCurrency(order.finalAmount || order.totalAmount)}
                      </p>
                      <p>
                        <strong>Payment:</strong>{" "}
                        <span
                          className={
                            order.paymentStatus === "Paid"
                              ? styles.paidStatus
                              : styles.pendingStatus
                          }
                        >
                          {order.paymentStatus}
                        </span>
                      </p>
                    </div>
                    <div className={styles.orderActions}>
                      <button
                        className={styles.invoiceButton}
                        onClick={() => handleDownloadInvoice(order._id)}
                      >
                        Invoice
                      </button>
                      <button
                        className={styles.viewDetailsButton}
                        onClick={() => toggleDetails(order._id)}
                      >
                        Details
                      </button>
                      <button
                        className={styles.viewTrackingBtn}
                        onClick={() => openDrawerForOrder(order)}
                      >
                        Track
                      </button>
                      {order.orderStatus === "delivered" &&
                        !order.returnRequest?.requested && (
                          <button
                            className={styles.returnButton}
                            onClick={() => openReturnModal(order._id)}
                          >
                            🔁 Request Return
                          </button>
                        )}
                      {order.returnRequest?.requested && (
                        <span className={styles.returnStatus}>
                          Return: {order.returnRequest.status}
                        </span>
                      )}
                    </div>
                    {visibleDetailsId === order._id && order.cartItems && (
                      <div className={styles.itemDetails}>
                        {order.cartItems.map((item, index) => (
                          <div key={index} className={styles.itemRow}>
                            <img
                              src={getProductImage(item.product, item.color)}
                              alt="item"
                              className={styles.itemImage}
                            />
                            <div className={styles.itemInfo}>
                              <p className={styles.itemName}>
                                {item.product?.title}
                              </p>
                              <p className={styles.itemVariant}>
                                {item.color} / {item.size}
                              </p>
                              <p className={styles.itemQty}>
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <span className={styles.itemPrice}>
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Address */}
        {activeTab === "address" && (
          <div className={styles.addressContainer}>
            <h2>My Address</h2>
            <div className={styles.emptyAddress}>
              <img
                src="/emptyaddress.png"
                alt="Empty"
                className={styles.emptyAddressImage}
              />
              <h3>My Address</h3>
              <p>Add your address for smooth delivery.</p>
              <button className={styles.addAddressButton}>
                Add new address
              </button>
            </div>
          </div>
        )}

        {/* Wishlist */}
        {activeTab === "wishlist" && (
          <div className={styles.wishlistContainer}>
            <h2>My Wishlist ({wishlist?.length || 0})</h2>
            <div className={styles.wishlistGrid}>
              {wishlist?.map((item) => (
                <div key={item._id} className={styles.wishlistCard}>
                  <img
                    src={
                      item.productId?.variants?.[0]?.images?.[0]?.url ||
                      "/default-product.jpg"
                    }
                    className={styles.wishlistImage}
                    alt="wish"
                  />
                  <div className={styles.wishlistInfo}>
                    <h4>{item.productId?.title}</h4>
                    <p className={styles.wishlistPrice}>
                      ₹{item.productId?.discountPrice || item.productId?.price}
                    </p>
                    <div className={styles.wishlistButtons}>
                      <button
                        className={styles.updateBtn}
                        onClick={() => handleOpenModal(item)}
                      >
                        📝 Note
                      </button>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeWishlistItem(item._id)}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupons */}
        {activeTab === "coupons" && (
          <div className={styles.couponTabContainer}>
            <h2>Coupons</h2>
            <div className={styles.couponFlexGrid}>
              {coupons?.map((coupon) => (
                <div key={coupon._id} className={styles.newCouponCard}>
                  <div className={styles.newCouponLeft}>
                    <span>{coupon.code}</span>
                  </div>
                  <div className={styles.newCouponRight}>
                    <div className={styles.couponTopRow}>
                      <div className={styles.couponMainInfo}>
                        <h4>{coupon.code}</h4>
                        <p className={styles.saveText}>
                          Save{" "}
                          {coupon.discountType === "percentage"
                            ? `${coupon.discount}%`
                            : `₹${coupon.discount}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(coupon._id, coupon.code)}
                        className={styles.newCopyBtn}
                      >
                        {copiedCoupon === coupon._id ? "COPIED" : "COPY"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {activeTab === "contact" && (
          <div className={styles.contactContainer}>
            <h2>Contact Us</h2>
            <div className={styles.contactBody}>
              <div className={styles.contactInfoSection}>
                <h3>Reach Us Out</h3>
                <p>
                  Email Support:{" "}
                  <a href="mailto:support@beyoung.in">support@beyoung.in</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS SECTION --- */}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.returnModal}>
            <h3>Request Return</h3>
            <p className={styles.modalSubText}>
              Please select a reason for returning this order.
            </p>
            <select
              className={styles.reasonSelect}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            >
              <option value="">-- Select Reason --</option>
              <option value="Size issue">Size Issue</option>
              <option value="Defective product">Defective Product</option>
              <option value="Wrong item received">Wrong Item Received</option>
              <option value="Quality not as expected">Quality Not Good</option>
              <option value="Other">Other (Write below)</option>
            </select>

            {returnReason === "Other" && (
              <textarea
                className={styles.reasonTextarea}
                placeholder="Describe your reason here..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.submitReturnBtn}
                onClick={handleSubmitReturn}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <button className={styles.cancelBtn} onClick={closeReturnModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Wishlist Note Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Update Note</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className={styles.modalTextarea}
              placeholder="Write something..."
            />
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={handleSaveNote}>
                💾 Save
              </button>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ShipmentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        awb={trackingData?.awb}
        timeline={trackingData?.timeline}
        loading={trackingLoading}
        error={trackingError}
        meta={drawerMeta}
      />
    </div>
  );
};

export default Profile;
