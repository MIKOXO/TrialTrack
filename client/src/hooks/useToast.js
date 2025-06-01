import { useState, useCallback } from "react";

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 4000) => {
      const id = Date.now() + Math.random();
      const newToast = {
        id,
        message,
        type,
        duration,
        isVisible: true,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration + 300); // Add extra time for animation
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message, duration) => {
      return showToast(message, "success", duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message, duration) => {
      return showToast(message, "error", duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message, duration) => {
      return showToast(message, "warning", duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message, duration) => {
      return showToast(message, "info", duration);
    },
    [showToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  };
};

export default useToast;
