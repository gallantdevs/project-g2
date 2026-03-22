import React, { createContext, useContext, useEffect, useState } from "react";
import {
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  completeOnboarding as apiCompleteOnboarding,
  getProfile as apiGetProfile,
  updateProfile as apiUpdateProfile,
} from "../Services/authService.js";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "./GlobalContext.jsx";
import { toast, Bounce } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
  const storedToken = sessionStorage.getItem("token");

  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(storedToken);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshApp } = useGlobal();

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      try {
        const data = await apiGetProfile(token);
        if (data?.user) {
          setUser(data.user);
          sessionStorage.setItem("user", JSON.stringify(data.user));
          // toast.success("👋 Welcome back!", {
          //   position: "top-center",
          //   transition: Bounce,
          //   theme: "light",
          // });
        }
      } catch (e) {
        console.error("Profile load failed", e);
        toast.error("❌ Session expired, please login again", {
          position: "top-center",
          transition: Bounce,
        });
        logout();
      }
    };
    run();
  }, [token]);

  // ✅ Send OTP
  const sendOtp = async (mobile) => {
    setLoading(true);
    try {
      const res = await apiSendOtp(mobile);
      if (res?.success) {
        toast.success("📩 OTP sent successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } else {
        toast.warn("⚠️ Failed to send OTP", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return res;
    } catch (err) {
      toast.error("❌ Error sending OTP", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP (Login)
  const verifyOtp = async (mobile, otp) => {
    setLoading(true);
    try {
      const data = await apiVerifyOtp(mobile, otp);
      if (data.token) {
        sessionStorage.setItem("token", data.token);
        setToken(data.token);
      }
      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }

      if (data?.success) {
        toast.success("✅ Login successful!", {
          position: "top-center",
          transition: Bounce,
        });
      } else {
        toast.warn("⚠️ Invalid OTP", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return data;
    } catch (err) {
      toast.error("❌ OTP verification failed", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Complete onboarding
  const completeOnboarding = async (mobile, fullName, email) => {
    setLoading(true);
    try {
      const data = await apiCompleteOnboarding(mobile, fullName, email);
      if (data.token) {
        sessionStorage.setItem("token", data.token);
        setToken(data.token);
      }
      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      window.dispatchEvent(new Event("cart-refresh"));
      refreshApp();
      toast.success("🎉 Onboarding completed successfully!", {
        position: "top-center",
        transition: Bounce,
      });
      return data;
    } catch (err) {
      toast.error("❌ Onboarding failed", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update profile
  const saveProfile = async (payload) => {
    if (!token) {
      toast.warn("⛔ No token found, please login again", {
        position: "top-center",
        transition: Bounce,
      });
      throw new Error("No token");
    }

    setLoading(true);
    try {
      const data = await apiUpdateProfile(token, payload);
      if (data?.user) {
        setUser(data.user);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        toast.success("✅ Profile updated successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      return data;
    } catch (err) {
      toast.error("❌ Failed to update profile", {
        position: "top-center",
        transition: Bounce,
      });
      throw err;
    } finally {
      setLoading(false);
      refreshApp();
    }
  };

  // ✅ Logout
  const logout = () => {
    console.log("🔴 Logging out...");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/", { replace: true });

    toast.info("👋 Logged out successfully!", {
      position: "top-center",
      transition: Bounce,
    });

    setTimeout(() => {
      refreshApp();
      console.log("🏠 Redirected and app refreshed");
    }, 300);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sendOtp,
        verifyOtp,
        completeOnboarding,
        saveProfile,
        logout,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
