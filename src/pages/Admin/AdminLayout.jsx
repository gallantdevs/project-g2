import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/Admin/Sidebar/Sidebar";
import styles from "./AdminLayout.module.css";
import { FaBars, FaTimes } from "react-icons/fa";
import { io } from "socket.io-client"; 
import { toast, Bounce } from "react-toastify"; 

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; 
const socket = io(SOCKET_URL);

const NewOrderToast = ({ order }) => (
  <div>
    <strong style={{ fontSize: '16px' }}>🎉 New Order Received!</strong>
    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.4 }}>
      ID: {order._id} <br />
      Amount: <b>₹{order.finalAmount.toFixed(2)}</b>
    </p>
  </div>
);

export default function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960 && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.classList.add(styles.noScroll);
    } else {
      document.body.classList.remove(styles.noScroll);
    }
    return () => document.body.classList.remove(styles.noScroll);
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    socket.connect();
    // console.log("Connecting to Socket.io");

    socket.on("connect", () => {
      console.log("Socket.io Connected successfully ID:", socket.id);
    });

    socket.on("new_order_received", (data) => {
      console.log("New Order reveived please check it:", data);
      toast.success(<NewOrderToast order={data.order} />, {
        position: "top-right",
        transition: Bounce,
      });
    });
    
    return () => {
      console.log("Socket.io se disconnect kar rahe hain...");
      socket.disconnect();
      socket.off("new_order_received");
    };
  }, []); 

  return (
    <div className={styles.layout}>
      <button
        className={styles.hamburgerButton}
        onClick={toggleMobileSidebar}
        aria-label="Toggle menu"
      >
        {isMobileSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {isMobileSidebarOpen && (
        <div className={styles.overlay} onClick={toggleMobileSidebar}></div>
      )}

      <AdminSidebar
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        isMobileOpen={isMobileSidebarOpen} 
        closeMobile={() => setIsMobileSidebarOpen(false)}
      />

      <main
        className={`${styles.main} ${
          isCollapsed ? styles.sidebarCollapsed : ""
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}