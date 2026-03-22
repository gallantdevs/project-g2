import React, { useContext, useEffect, useMemo } from "react";
import styles from "./Dashboard.module.css";
import { ProductContext } from "../../Context/ProductContext.jsx";
import { useOrder } from "../../Context/OrderContext.jsx";
import { ComboContext } from "../../Context/ComboContext.jsx";
import { AuthContext } from "../../Context/AuthContext.jsx";
import { AdminContext } from "../../Context/AdminContext.jsx";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
};

export default function Dashboard() {
  const { products } = useContext(ProductContext);
  const { combos } = useContext(ComboContext);
  const { user } = useContext(AuthContext);
  const { users, fetchUsers } = useContext(AdminContext);

  const { orders, fetchAllOrders } = useOrder();

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "subadmin")) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const {
    totalEarned,
    shippingPending,
    ordersDelivered,
    returnOrdersCount,
    totalRefunded,
  } = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalEarned: 0,
        shippingPending: 0,
        ordersDelivered: 0,
        returnOrdersCount: 0,
        totalRefunded: 0,
      };
    }

    const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered");
    const earned = deliveredOrders.reduce((acc, o) => acc + o.finalAmount, 0);

    const pending = orders.filter((o) => o.orderStatus === "processing").length;

    const deliveredCount = deliveredOrders.length;

    const returns = orders.filter(
      (o) => o.returnRequest?.requested === true
    ).length;

    const refunded = orders
      .filter(
        (o) =>
          o.returnRequest?.status === "completed" ||
          o.returnRequest?.refundStatus === "completed"
      )
      .reduce((acc, o) => acc + (o.refundAmount || 0), 0);

    return {
      totalEarned: earned,
      shippingPending: pending,
      ordersDelivered: deliveredCount,
      returnOrdersCount: returns,
      totalRefunded: refunded,
    };
  }, [orders]);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.notice}>
        Welcome back, {user?.fullName || "Admin"}! Here's your business summary:
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.icon}>💰</div>
          <h3>Total Amount Earned</h3>
          <p>{formatCurrency(totalEarned)}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🚚</div>
          <h3>Shipping Pending</h3>
          <p>{shippingPending}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>✅</div>
          <h3>Orders Delivered</h3>
          <p>{ordersDelivered}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>💸</div>
          <h3>Total Amount Refunded</h3>
          <p>{formatCurrency(totalRefunded)}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>↩️</div>
          <h3>Return Requests</h3>
          <p>{returnOrdersCount}</p>
        </div>

        {/* --- Purane Cards (Counts) --- */}
        <div className={styles.card}>
          <div className={styles.icon}>📦</div>
          <h3>Total Products</h3>
          <p>{products?.length || 0}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🧾</div>
          <h3>Total Orders</h3>
          <p>{orders?.length || 0}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>👥</div>
          <h3>Total Users</h3>
          <p>{users?.length || 0}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>🎁</div>
          <h3>Total Combos</h3>
          <p>{combos?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
