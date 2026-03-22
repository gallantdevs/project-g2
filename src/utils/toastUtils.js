import { toast, Bounce } from "react-toastify";

const baseConfig = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

export const showSuccess = (msg) => toast.success(msg, baseConfig);
export const showError = (msg) => toast.error(msg, baseConfig);
export const showInfo = (msg) => toast.info(msg, baseConfig);
export const showWarn = (msg) => toast.warn(msg, baseConfig);
export const showToast = (msg) => toast(msg, baseConfig);
