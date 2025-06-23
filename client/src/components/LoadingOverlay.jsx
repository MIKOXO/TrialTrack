import React from "react";
import Spinner from "./Spinner";

const LoadingOverlay = ({ 
  isVisible = false,
  message = "Processing...",
  size = "lg",
  color = "white",
  backdrop = "dark",
  className = "",
  children
}) => {
  if (!isVisible) return children || null;

  const backdropClasses = {
    dark: "bg-black bg-opacity-50",
    light: "bg-white bg-opacity-80",
    blur: "bg-white bg-opacity-70 backdrop-blur-sm",
    transparent: "bg-transparent"
  };

  return (
    <div className="relative">
      {children}
      
      {/* Overlay */}
      <div 
        className={`absolute inset-0 z-40 flex items-center justify-center ${backdropClasses[backdrop]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label="Loading"
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner with enhanced styling */}
          <div className="relative">
            <Spinner 
              size={size} 
              color={color}
              className="drop-shadow-lg"
            />
            
            {/* Glow effect for dark backgrounds */}
            {backdrop === 'dark' && (
              <div 
                className="absolute inset-0 rounded-full animate-pulse opacity-30 bg-white"
                style={{ animationDuration: "1.5s" }}
              />
            )}
          </div>
          
          {/* Loading message */}
          {message && (
            <div className={`text-center ${
              backdrop === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>
              <p className="text-lg font-medium">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized overlay components
export const FormLoadingOverlay = ({ isVisible, message = "Submitting...", children }) => (
  <LoadingOverlay
    isVisible={isVisible}
    message={message}
    backdrop="blur"
    color="tertiary"
    size="lg"
  >
    {children}
  </LoadingOverlay>
);

export const CardLoadingOverlay = ({ isVisible, message = "Loading...", children }) => (
  <LoadingOverlay
    isVisible={isVisible}
    message={message}
    backdrop="light"
    color="tertiary"
    size="md"
  >
    {children}
  </LoadingOverlay>
);

export const DarkLoadingOverlay = ({ isVisible, message = "Processing...", children }) => (
  <LoadingOverlay
    isVisible={isVisible}
    message={message}
    backdrop="dark"
    color="white"
    size="lg"
  >
    {children}
  </LoadingOverlay>
);

export default LoadingOverlay;
