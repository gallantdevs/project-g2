import React, { useContext, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthContext.jsx";
import styles from "./Sidebar.module.css";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import {
  FaHome,
  FaBox,
  FaUsers,
  FaTags,
  FaClipboardList,
  FaGift,
  FaLayerGroup,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { ImSection } from "react-icons/im";

export default function AdminSidebar({
  isCollapsed,
  toggleCollapse,
  isMobileOpen,
  closeMobile,
}) {
  const { user } = useContext(AuthContext);

  const allMenuItems = [
    { to: "/admin", label: "Dashboard", icon: <FaHome /> },
    { to: "/admin/products", label: "Products", icon: <FaBox /> },
    { to: "/admin/categories", label: "Categories", icon: <FaLayerGroup /> },
    {
      to: "/admin/posters",
      label: "Posters",
      icon: <FaClipboardList />,
      roles: ["admin"],
    },
    {
      to: "/admin/section",
      label: "Section",
      icon: <ImSection />,
      roles: ["admin"],
    },
    { to: "/admin/orders", label: "Orders", icon: <FaFileInvoiceDollar /> },
    {
      to: "/admin/users",
      label: "Users",
      icon: <FaUsers />,
      roles: ["admin", "subadmin"],
    },
    { to: "/admin/combo", label: "Combos", icon: <FaGift /> },
    { to: "/admin/coupon", label: "Coupons", icon: <FaTags /> },
  ];

  const visibleItems = useMemo(() => {
    if (!user) return [];
    const userRole = user ? user.role : "admin";
    return allMenuItems.filter(
      (item) => !item.roles || item.roles.includes(userRole)
    );
  }, [user]);

  return (
    <aside
      className={`${styles.wrapper} ${isCollapsed ? styles.collapsed : ""} ${
        isMobileOpen ? styles.mobileOpen : ""
      }`}
    >
      <div className={styles.topSection}>
        {!isCollapsed && <div className={styles.brand}>Admin</div>}
        <button
          className={`${styles.collapseBtn} ${styles.desktopOnly}`}
          onClick={toggleCollapse}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
        <button
          className={`${styles.closeBtn} ${styles.mobileOnly}`}
          onClick={closeMobile}
          aria-label="Close sidebar"
        >
          <FaTimes />
        </button>
      </div>

      <nav className={styles.nav}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
            title={isCollapsed ? item.label : ""}
            onClick={() => window.innerWidth < 960 && closeMobile()}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}