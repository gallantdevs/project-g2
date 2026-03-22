import React from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import LoginRegister from "./pages/LoginRegister.jsx";
import Footer from "./components/Footer/Footer.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Products from "./pages/Products.jsx";

// Admin
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import ManageProducts from "./pages/Admin/ManageProducts.jsx";
import CategoryManage from "./pages/Admin/CategoryManage.jsx";
import PosterManage from "./pages/Admin/PosterManage.jsx";
import Profile from "./pages/Profile.jsx";
import Cart from "./pages/Cart.jsx";
import SectionManage from "./pages/Admin/SectionManage.jsx";
import ComboManager from "./pages/Admin/ComboManager.jsx";
import ComboDetails from "./pages/ComboDetails.jsx";
import ComboList from "./pages/ComboList.jsx";
import CouponManager from "./pages/Admin/CouponManager.jsx";
import UserManage from "./pages/Admin/UserManage.jsx";
import ManageOrders from "./pages/Admin/ManageOrders.jsx";
import Checkout from "./pages/Checkout.jsx";
import Sitemap from "./pages/Sitemap.jsx";

// ✅ Toastify Imports
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import About from "./pages/About.jsx";
import ReturnPolicy from "./pages/ReturnPolicy.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import FAQ from "./pages/FAQ.jsx";
import TermCondition from "./pages/TermCondition.jsx";
import Collabration from "./pages/Collabration.jsx";
import Carrer from "./pages/Carrer.jsx";

const App = () => {
  const navigate = useNavigate();

  return (
    <div className="appWrapper">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      
      <LoginRegister />
      <Navbar />

      {/* ✅ ToastContainer (Global Notification UI) */}

      <div className="mainContent">
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/main/:categoryName" element={<Products />} />
          <Route
            path="/products/:categoryType/:categoryName"
            element={<Products />}
          />
          <Route path="/products/subcategory/:subSlug" element={<Products />} />
          <Route path="/products/tag/:tagName" element={<Products />} />
          <Route
            path="/products/general/:categorySlug"
            element={<Products />}
          />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/combo-products" element={<ComboList />} />
          <Route path="/combo/:slug" element={<ComboDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/return" element={<ReturnPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/FAQ" element={<FAQ />} />
          <Route path="/termcondition" element={<TermCondition />} />
          <Route path="/collabration" element={<Collabration />} />
          <Route path="/Carrer" element={<Carrer />} />
          <Route path="/sitemap" element={<Sitemap />} />

          {/* 🛠️ Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="categories" element={<CategoryManage />} />
            <Route path="posters" element={<PosterManage />} />
            <Route path="section" element={<SectionManage />} />
            <Route path="combo" element={<ComboManager />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="coupon" element={<CouponManager />} />
            <Route path="users" element={<UserManage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;
