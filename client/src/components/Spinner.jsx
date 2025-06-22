import React from "react";

const Spinner = ({ size = "sm", color = "white" }) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    primary: "border-primary border-t-transparent", 
    tertiary: "border-tertiary border-t-transparent",
    gray: "border-gray-600 border-t-transparent"
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
