import React, { useEffect, useState, useContext } from "react";
import styles from "./ManageOrder.module.css";
import { useOrder } from "../../Context/OrderContext.jsx";
import { AuthContext } from "../../Context/AuthContext.jsx";

const getProductImage = (product, color) => {
  if (!product || !product.variants) {
    return "/placeholder-image.png";
  }
  const variant = product.variants.find((v) => v.color === color);
  return variant?.images?.[0]?.url || "/placeholder-image.png";
};

const groupCartItems = (items = []) => {
  const groups = [];
  const comboMap = new Map();

  for (const it of items) {
    const hasComboMeta =
      (it.isCombo && (it.comboId || it.comboSlug)) ||
      it.comboId ||
      it.comboSlug;

    if (hasComboMeta) {
      const key = it.comboId || `slug:${it.comboSlug || "combo"}`;
      if (!comboMap.has(key)) {
        comboMap.set(key, {
          type: "combo",
          key,
          comboId: it.comboId || null,
          comboSlug: it.comboSlug || "Combo",
          items: [],
        });
      }
      comboMap.get(key).items.push(it);
    } else {
      groups.push({ type: "regular", item: it });
    }
  }

  for (const g of comboMap.values()) groups.push(g);
  return groups;
};

const getComboTotal = (comboGroup) =>
  comboGroup.items.reduce(
    (s, x) => s + Number(x.price || 0) * (x.quantity || 1),
    0
  );

export default function ManageOrder() {
  const { user, token } = useContext(AuthContext);
  const {
    orders,
    fetchAllOrders,
    updateStatus,
    removeOrder,
    loading,
    dispatchOrder,
    updateReturnStatus,
    markReturnReceived,
    processRefund,
  } = useOrder();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    orderStatus: "",
    paymentStatus: "",
  });

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateStatus(selectedOrder._id, statusForm);
      handleCloseModal();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order permanently?")) return;
    try {
      await removeOrder(id);
    } catch (err) {
      alert("Failed to delete order: " + err.message);
    }
  };

  const handleDispatch = async (orderId) => {
    if (typeof dispatchOrder !== "function") {
      alert("Dispatch functionality is not yet integrated in the context.");
      return;
    }
    if (!confirm("Confirm to register and dispatch this order?")) return;
    try {
      const res = await dispatchOrder(orderId, token);
      await fetchAllOrders();
      alert(`✅ Order successfully dispatched! AWB: ${res.tracking.awb}`);
    } catch (err) {
      alert("❌ Dispatch Failed: " + err.message);
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "subadmin";

  const handleReturnStatus = async (orderId, status) => {
    if (!confirm(`Are you sure you want to mark this return as ${status}?`))
      return;
    try {
      const res = await updateReturnStatus(orderId, status);
      if (res.success) {
        alert(`✅ Return marked as ${status} successfully!`);
        await fetchAllOrders();
      } else {
        alert("❌ Failed to update return status");
      }
    } catch (err) {
      console.error("Error updating return status:", err);
      alert("❌ Error: " + err.message);
    }
  };

  const handleReturnReceived = async (orderId) => {
    if (!confirm("Mark this return as received?")) return;
    try {
      const res = await markReturnReceived(orderId);
      if (res.success) {
        alert("✅ Return marked as received!");
        await fetchAllOrders();
      }
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleRefund = async (orderId) => {
    if (!confirm("Process refund via Razorpay?")) return;
    try {
      const res = await processRefund(orderId);
      if (res.success) {
        alert("✅ Refund processed successfully!");
        await fetchAllOrders();
      }
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headRow}>
        <h2 className={styles.heading}>Manage Orders</h2>
      </div>

      {loading && <p className={styles.loadingText}>Loading orders...</p>}

      <div className={styles.listWrap}>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.orderId}>
                    ID: {order._id.slice(-8)}
                  </span>
                  <span className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className={styles.orderUser}>
                  <p>
                    <strong>User:</strong>{" "}
                    {order.shippingAddress?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {order.shippingAddress?.mobile}
                  </p>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.itemList}>
                  <h4 className={styles.columnTitle}>Items</h4>
                  {groupCartItems(order.cartItems).map((row, idx) => {
                    if (row.type === "regular") {
                      const item = row.item;
                      const imgUrl = getProductImage(item.product, item.color);
                      return (
                        <div key={`reg-${idx}`} className={styles.item}>
                          <img
                            src={imgUrl}
                            alt={item.product?.title || "product"}
                            className={styles.itemImage}
                          />
                          <div className={styles.itemDetails}>
                            <span className={styles.itemTitle}>
                              {item.product?.title || "Product"}
                            </span>
                            <span className={styles.itemVariant}>
                              {item.color} / {item.size}
                            </span>
                            <span className={styles.itemQty}>
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <span className={styles.itemPrice}>
                            ₹{Number(item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      );
                    }

                    const combo = row;
                    const comboTotal = getComboTotal(combo);

                    const comboQty = combo.items[0]?.quantity || 1;

                    return (
                      <div key={`combo-${idx}`} className={styles.comboBlock}>
                        <div
                          className={styles.item}
                          style={{ borderBottom: "none" }}
                        >
                          <div className={styles.itemDetails}>
                            <span className={styles.itemTitle}>
                              {combo.comboSlug || "Combo"}{" "}
                              {comboQty > 1 ? `(x${comboQty})` : ""}
                            </span>
                            <span className={styles.itemVariant}>
                              Includes {combo.items.length} items
                            </span>
                          </div>
                          <span className={styles.itemPrice}>
                            ₹{comboTotal}
                          </span>
                        </div>

                        {combo.items.map((ci, cidx) => {
                          const imgUrl = getProductImage(ci.product, ci.color);
                          return (
                            <div
                              key={`combo-${idx}-${cidx}`}
                              className={styles.item}
                              style={{ opacity: 0.9 }}
                            >
                              <img
                                src={imgUrl}
                                alt={ci.product?.title || "product"}
                                className={styles.itemImage}
                              />
                              <div className={styles.itemDetails}>
                                <span className={styles.itemTitle}>
                                  {ci.product?.title || "Product"}
                                </span>
                                <span className={styles.itemVariant}>
                                  {ci.color} / {ci.size}
                                </span>
                                <span className={styles.itemQty}>
                                  Qty: {ci.quantity}
                                </span>
                              </div>
                              <span
                                className={styles.itemPrice}
                                style={{ fontSize: 12 }}
                              >
                                Included
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                <div className={styles.cardSummary}>
                  <h4 className={styles.columnTitle}>Summary & Status</h4>
                  <div className={styles.summaryItem}>
                    <strong>Total:</strong>
                    <span>₹{order.finalAmount}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Payment:</strong>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`payment-${order.paymentStatus?.toLowerCase()}`]
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Status:</strong>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`order-${order.orderStatus?.toLowerCase()}`]
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Return:</strong>
                    <div className={styles.returnValue}>
                      {order.returnRequest?.requested ? (
                        <>
                          <span
                            className={`${styles.returnBadge} ${
                              styles[`return-${order.returnRequest.status}`]
                            }`}
                          >
                            {order.returnRequest.status}
                          </span>
                          {order.returnRequest.reason && (
                            <small className={styles.returnReason}>
                              {order.returnRequest.reason}
                            </small>
                          )}
                          {order.returnRequest.status === "pending" && (
                            <div className={styles.returnActions}>
                              <button
                                className={`${styles.btn} ${styles.btnApprove}`}
                                onClick={() =>
                                  handleReturnStatus(order._id, "approved")
                                }
                              >
                                Approve
                              </button>
                              <button
                                className={`${styles.btn} ${styles.btnReject}`}
                                onClick={() =>
                                  handleReturnStatus(order._id, "rejected")
                                }
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {order.returnRequest.status === "approved" && (
                            <div className={styles.returnActions}>
                              <button
                                className={`${styles.btn} ${styles.btnReceive}`}
                                onClick={() => handleReturnReceived(order._id)}
                              >
                                Mark Received
                              </button>
                            </div>
                          )}
                          {order.returnRequest.status === "received" && (
                            <div className={styles.returnActions}>
                              <button
                                className={`${styles.btn} ${styles.btnRefund}`}
                                onClick={() => handleRefund(order._id)}
                              >
                                Process Refund
                              </button>
                            </div>
                          )}
                          {order.returnRequest.status === "completed" && (
                            <div className={styles.returnComplete}>
                              ✅ Refund Completed
                              {order.refundTransactionId && (
                                <span className={styles.returnTxn}>
                                  Txn ID: {order.refundTransactionId}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: "var(--text-light)" }}>—</span>
                      )}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className={styles.cardActions}>
                    <h4 className={styles.columnTitle}>Actions</h4>
                    {order.orderStatus === "processing" &&
                      order.paymentStatus !== "failed" && (
                        <button
                          className={`${styles.btn} ${styles.btnDispatch}`}
                          onClick={() => handleDispatch(order._id)}
                        >
                          Dispatch Order
                        </button>
                      )}
                    {order.orderStatus === "shipped" && (
                      <button
                        className={`${styles.btn} ${styles.btnTrack}`}
                        onClick={() =>
                          alert(`AWB: ${order.awbNumber || "N/A"}`)
                        }
                      >
                        Track / Label
                      </button>
                    )}
                    <button
                      className={`${styles.btn} ${styles.btnUpdate}`}
                      onClick={() => handleOpenModal(order)}
                    >
                      Update Status
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnDelete}`}
                      onClick={() => handleDelete(order._id)}
                    >
                      Delete Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.loadingText}>No orders found.</p>
        )}
      </div>

      {openModal && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Update Order Status</h3>
              <button className={styles.btnClose} onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={handleUpdate}>
                <label>
                  Order Status
                  <select
                    value={statusForm.orderStatus}
                    onChange={(e) =>
                      setStatusForm((prev) => ({
                        ...prev,
                        orderStatus: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <label>
                  Payment Status
                  <select
                    value={statusForm.paymentStatus}
                    onChange={(e) =>
                      setStatusForm((prev) => ({
                        ...prev,
                        paymentStatus: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </label>
                <h4>Order Summary</h4>
                <div className={styles.row}>
                  <input
                    type="text"
                    className={styles.input}
                    readOnly
                    value={`Items: ${selectedOrder.cartItems?.length || 0}`}
                  />
                  <input
                    type="text"
                    className={styles.input}
                    readOnly
                    value={`Amount: ₹${selectedOrder.finalAmount}`}
                  />
                  <input
                    type="text"
                    className={styles.input}
                    readOnly
                    value={`Payment: ${selectedOrder.paymentMethod}`}
                  />
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnCancel}`}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnSave}`}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
