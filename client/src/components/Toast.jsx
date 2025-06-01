import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const Toast = ({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 4000,
  position = "top-right",
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300); // Wait for animation to complete
  };

  const getToastStyles = () => {
    const baseStyles =
      "fixed z-50 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto transition-all duration-300 transform";

    const positionStyles = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-center": "top-4 left-1/2 transform -translate-x-1/2",
      "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
    };

    const typeStyles = {
      success: "bg-green-50 border border-green-200",
      error: "bg-red-50 border border-red-200",
      warning: "bg-yellow-50 border border-yellow-200",
      info: "bg-blue-50 border border-blue-200",
    };

    const animationStyles = show
      ? "opacity-100 translate-y-0 scale-100"
      : "opacity-0 translate-y-2 scale-95";

    return `${baseStyles} ${positionStyles[position]} ${typeStyles[type]} ${animationStyles}`;
  };

  const getIcon = () => {
    const iconStyles = "w-5 h-5 flex-shrink-0";

    switch (type) {
      case "success":
        return <FaCheckCircle className={`${iconStyles} text-green-500`} />;
      case "error":
        return (
          <FaExclamationTriangle className={`${iconStyles} text-red-500`} />
        );
      case "warning":
        return (
          <FaExclamationTriangle className={`${iconStyles} text-yellow-500`} />
        );
      case "info":
        return <FaInfoCircle className={`${iconStyles} text-blue-500`} />;
      default:
        return <FaCheckCircle className={`${iconStyles} text-green-500`} />;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-green-800";
    }
  };

  if (!show && !isVisible) return null;

  return (
    <div className={getToastStyles()}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === "success"
                  ? "text-green-400 hover:text-green-500 focus:ring-green-500"
                  : type === "error"
                  ? "text-red-400 hover:text-red-500 focus:ring-red-500"
                  : type === "warning"
                  ? "text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500"
                  : "text-blue-400 hover:text-blue-500 focus:ring-blue-500"
              }`}
            >
              <span className="sr-only">Close</span>
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
