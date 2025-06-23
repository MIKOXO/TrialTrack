import React from "react";

const Spinner = ({
  size = "sm",
  color = "white",
  className = "",
  thickness = "2",
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
    "2xl": "w-12 h-12",
    "3xl": "w-16 h-16",
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    primary: "border-primary border-t-transparent",
    tertiary: "border-tertiary border-t-transparent",
    gray: "border-gray-600 border-t-transparent",
    blue: "border-blue-600 border-t-transparent",
    green: "border-green-600 border-t-transparent",
    indigo: "border-indigo-600 border-t-transparent",
  };

  const thicknessClasses = {
    1: "border",
    2: "border-2",
    3: "border-4",
    4: "border-8",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} ${thicknessClasses[thickness]} rounded-full animate-spin transition-all duration-300 ease-in-out ${className}`}
      role="status"
      aria-label="Loading"
      style={{
        animationDuration: "0.8s",
      }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
