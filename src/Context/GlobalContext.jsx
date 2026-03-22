import React, { createContext, useContext, useCallback } from "react";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalContext = createContext();

// ✅ Custom Hook
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};

export const GlobalProvider = ({ children }) => {
  const refreshApp = useCallback(() => {
    console.log("🔁 Global Refresh Triggered");

    toast.info("🔄 Session expired or update detected — refreshing app...", {
      position: "top-center",
      autoClose: 3000,
      transition: Bounce,
      theme: "light",
    });

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, []);

  return (
    <GlobalContext.Provider value={{ refreshApp }}>
      {children}
    </GlobalContext.Provider>
  );
};
