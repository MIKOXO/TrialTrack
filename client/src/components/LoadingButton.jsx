import React from "react";
import Spinner from "./Spinner";

const LoadingButton = ({
  children,
  loading = false,
  loadingText = "Loading...",
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) => {
  const isDisabled = loading || disabled;

  const baseClasses =
    "relative flex items-center justify-center px-5 py-3 rounded-lg text-lg font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

  const defaultClasses =
    "bg-tertiary text-primary shadow-400 hover:shadow-300 focus:ring-tertiary";

  const disabledClasses =
    "opacity-60 cursor-not-allowed transform-none shadow-200";

  const combinedClasses = `${baseClasses} ${className || defaultClasses} ${
    isDisabled ? disabledClasses : ""
  }`;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {loading && (
        <Spinner size="sm" color="white" className="animate-spin mr-2" />
      )}
      {loading ? loadingText : children}
    </button>
  );
};

export default LoadingButton;
