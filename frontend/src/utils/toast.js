import { toast } from "react-toastify";

const defaultConfig = {
  position: "bottom-right",
  autoClose: 1000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showToast = {
  success: (message) => {
    toast.success(message, defaultConfig);
  },
  error: (message) => {
    toast.error(message, defaultConfig);
  },
  info: (message) => {
    toast.info(message, defaultConfig);
  },
  warning: (message) => {
    toast.warning(message, defaultConfig);
  },
  loading: (message) => {
    return toast.loading(message, defaultConfig);
  },
  update: (toastId, updates) => {
    toast.update(toastId, updates);
  },
};
