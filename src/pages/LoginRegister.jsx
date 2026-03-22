// LoginRegister.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import styles from "./LoginRegister.module.css";
import { AuthContext } from "../Context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.modalContent}>{children}</div>
      </div>
    </div>
  );
};

const LoginRegister = () => {
  const { sendOtp, verifyOtp, completeOnboarding, user, logout } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [needOnboarding, setNeedOnboarding] = useState(false);
  const [onboarding, setOnboarding] = useState({ fullName: "", email: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const [hideStrip, setHideStrip] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  const stripRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          const delta = y - lastYRef.current;
          setScrolled(y > 4);
          if (delta > 6 && y > 80) setHideStrip(true);
          else if (delta < -6 || y < 20) setHideStrip(false);
          lastYRef.current = y;
          tickingRef.current = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const setOffsets = () => {
      const h = stripRef.current
        ? stripRef.current.getBoundingClientRect().height
        : 0;
      document.documentElement.style.setProperty("--topstrip-height", `${h}px`);
      if (!hideStrip) document.body.classList.add("topstrip-visible");
      else document.body.classList.remove("topstrip-visible");
    };

    setOffsets();

    window.addEventListener("resize", setOffsets);
    let ro = null;
    if (stripRef.current && "ResizeObserver" in window) {
      ro = new ResizeObserver(setOffsets);
      ro.observe(stripRef.current);
    }

    return () => {
      window.removeEventListener("resize", setOffsets);
      if (ro && stripRef.current) ro.unobserve(stripRef.current);
      document.body.classList.remove("topstrip-visible");
      document.documentElement.style.removeProperty("--topstrip-height");
    };
  }, [hideStrip]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) return alert("Mobile number must be 10 digits");
    await sendOtp(mobile);
    setStep(2);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const res = await verifyOtp(mobile, otp);
      if (res.needOnboarding) {
        setNeedOnboarding(true);
        setStep(3);
      } else {
        setIsOpen(false);
        if (res.user?.role === "admin" || res.user?.role === "subadmin")
          navigate("/admin");
        else navigate("/profile");
      }
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      try {
        const parsed = JSON.parse(err.message);
        message = parsed.message || message;
      } catch {
        if (err.message?.toLowerCase().includes("wrong"))
          message = "Entered OTP is wrong";
      }
      setErrorMessage(message);
    }
  };

  const handleOnboarding = async (e) => {
    e.preventDefault();
    const data = await completeOnboarding(
      mobile,
      onboarding.fullName,
      onboarding.email
    );
    setIsOpen(false);
    if (data.user?.role === "admin" || data.user?.role === "subadmin")
      navigate("/admin");
    else navigate("/profile");
  };

  return (
    <>
      <div
        ref={stripRef}
        className={[
          styles.LoginRegisterContainer,
          hideStrip ? styles.hide : "",
          scrolled ? styles.scrolled : "",
        ].join(" ")}
      >
        <p>Free Shipping Sitewide on Every Order, Don't Miss Out!!</p>

        {!user ? (
          <button className={styles.loginButton} onClick={() => setIsOpen(true)}>
            LOG IN / SIGNUP
          </button>
        ) : (
          <div className={styles.accountWrapper}>
            <div className={styles.accountDropdown}>
              <button
                className={styles.loginButton}
                onClick={() =>
                  user.role === "admin" || user.role === "subadmin"
                    ? navigate("/admin")
                    : navigate("/profile")
                }
              >
                MY ACCOUNT
              </button>
              <div className={styles.dropdownMenu}>
                <div className={styles.userInfo}>
                  <p>Hello {user.fullName || "User"}</p>
                  <span>+91 {user.mobile}</span>
                </div>
                <ul>
                  <li onClick={() => navigate("/myaccount/orders")}>ORDER</li>
                  <li onClick={() => navigate("/myaccount/address")}>ADDRESS</li>
                  <li onClick={() => navigate("/myaccount/profile")}>PROFILE</li>
                  <li onClick={() => navigate("/myaccount/wishlist")}>WISHLIST</li>
                  <li onClick={() => navigate("/myaccount/coupons")}>COUPONS</li>
                </ul>
              </div>
            </div>
            <button className={styles.loginButton} onClick={logout}>
              LOGOUT
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className={styles.header}>
          <img src="/login-sign-up.jpg" alt="login" className={styles.loginImg} />
          <h2 className={styles.title}>Login or Signup</h2>
          <p className={styles.subtitle}>Get Exciting Offers & Track Order</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.formGroup}>
              <div className={styles.phoneInputWrapper}>
                <div className={styles.countryCode}>
                  <span className={styles.flag}>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  className={styles.phoneInput}
                  value={mobile}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 10) setMobile(v);
                  }}
                  placeholder="Phone Number *"
                  required
                />
              </div>
            </div>
            <button className={styles.submitButton}>Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.input}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP *"
                  required
                />
              </div>
              {errorMessage && <div className={styles.errorPopup}>{errorMessage}</div>}
            </div>
            <button className={styles.submitButton}>Verify OTP</button>
          </form>
        )}

        {step === 3 && needOnboarding && (
          <form onSubmit={handleOnboarding} className={styles.form}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.input}
                  value={onboarding.fullName}
                  onChange={(e) =>
                    setOnboarding((s) => ({ ...s, fullName: e.target.value }))
                  }
                  placeholder="Full Name *"
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  className={styles.input}
                  value={onboarding.email}
                  onChange={(e) =>
                    setOnboarding((s) => ({ ...s, email: e.target.value }))
                  }
                  placeholder="Email Address *"
                  required
                />
              </div>
            </div>
            <button className={styles.submitButton}>Complete Onboarding</button>
          </form>
        )}
      </Modal>
    </>
  );
};

export default LoginRegister;
