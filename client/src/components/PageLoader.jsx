import React from "react";
import Spinner from "./Spinner";

const PageLoader = ({
  message = "Loading...",
  size = "lg",
  color = "tertiary",
  fullScreen = false,
  overlay = false,
  className = "",
  showMessage = true,
  variant = "default",
}) => {
  // Different loading variants
  const variants = {
    default: {
      container: "flex flex-col items-center justify-center",
      spinner: { size, color },
      message: "text-gray-600 mt-4 text-lg font-medium",
    },
    minimal: {
      container: "flex items-center justify-center",
      spinner: { size: "md", color },
      message: "text-gray-500 ml-3 text-sm",
    },
    card: {
      container:
        "flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8",
      spinner: { size, color },
      message: "text-gray-700 mt-4 text-base font-medium",
    },
    inline: {
      container: "flex items-center",
      spinner: { size: "sm", color },
      message: "text-gray-600 ml-2 text-sm",
    },
  };

  const currentVariant = variants[variant] || variants.default;

  // Base container classes
  let containerClasses = currentVariant.container;

  if (fullScreen) {
    containerClasses += " fixed inset-0 z-50";
    if (overlay) {
      containerClasses += " bg-white bg-opacity-90 backdrop-blur-sm";
    } else {
      containerClasses += " bg-white";
    }
  } else {
    containerClasses += " py-12";
  }

  // Add custom className
  if (className) {
    containerClasses += ` ${className}`;
  }

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        {/* Animated container for the spinner */}
        <div className="relative">
          <Spinner
            size={currentVariant.spinner.size}
            color={currentVariant.spinner.color}
            className="drop-shadow-sm"
          />

          {/* Pulse effect behind spinner */}
          <div
            className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
              currentVariant.spinner.color === "tertiary"
                ? "bg-tertiary"
                : currentVariant.spinner.color === "primary"
                ? "bg-primary"
                : currentVariant.spinner.color === "blue"
                ? "bg-blue-600"
                : currentVariant.spinner.color === "green"
                ? "bg-green-600"
                : "bg-gray-600"
            }`}
            style={{ animationDuration: "2s" }}
          />
        </div>

        {/* Loading message */}
        {showMessage && message && (
          <p className={currentVariant.message}>{message}</p>
        )}
      </div>
    </div>
  );
};

// Specialized loading components for common use cases
export const CardLoader = ({ message = "Loading...", ...props }) => (
  <PageLoader variant="card" message={message} {...props} />
);

export const InlineLoader = ({ message = "Loading...", ...props }) => (
  <PageLoader
    variant="inline"
    message={message}
    showMessage={true}
    {...props}
  />
);

export const MinimalLoader = ({ message = "Loading...", ...props }) => (
  <PageLoader variant="minimal" message={message} {...props} />
);

export const FullScreenLoader = ({ message = "Loading...", ...props }) => (
  <PageLoader fullScreen={true} overlay={true} message={message} {...props} />
);

// Layout-specific loaders
export const ClientPageLoader = ({ message = "Loading...", ...props }) => (
  <div className="px-7 py-4">
    <PageLoader
      variant="default"
      message={message}
      color="tertiary"
      size="xl"
      {...props}
    />
  </div>
);

export const AdminPageLoader = ({ message = "Loading...", ...props }) => (
  <div className="px-6 py-8">
    <PageLoader
      variant="default"
      message={message}
      color="tertiary"
      size="xl"
      {...props}
    />
  </div>
);

export const JudgePageLoader = ({ message = "Loading...", ...props }) => (
  <div className="px-6 py-8">
    <PageLoader
      variant="default"
      message={message}
      color="tertiary"
      size="xl"
      {...props}
    />
  </div>
);

export default PageLoader;
