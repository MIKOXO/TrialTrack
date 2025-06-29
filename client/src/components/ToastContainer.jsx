import React from "react";
import Toast from "./Toast";

const ToastContainer = ({ toasts, onRemoveToast, position = "top-right" }) => {
  if (!toasts || toasts.length === 0) return null;

  const getContainerStyles = () => {
    const baseStyles = "fixed z-[60] pointer-events-none";

    const positionStyles = {
      "top-right": "top-4 right-10",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-center": "top-4 left-1/2 transform -translate-x-1/2",
      "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
      "admin-top-right": "top-24 right-14",
      "admin-top-left": "top-24 left-6 md:left-72",
      "sidebar-layout-top-right": "top-24 right-6",
      "sidebar-layout-top-left": "top-24 left-6 md:left-72",
    };

    return `${baseStyles} ${positionStyles[position]}`;
  };

  return (
    <div className={getContainerStyles()}>
      <div className="space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            duration={toast.duration}
            position="relative" // Override position for container items
            onClose={() => onRemoveToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
