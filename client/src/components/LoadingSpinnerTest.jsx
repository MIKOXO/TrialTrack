import React, { useState } from "react";
import Spinner from "./Spinner";
import PageLoader, { 
  CardLoader, 
  InlineLoader, 
  MinimalLoader, 
  FullScreenLoader, 
  ClientPageLoader 
} from "./PageLoader";
import LoadingButton from "./LoadingButton";
import LoadingOverlay, { 
  FormLoadingOverlay, 
  CardLoadingOverlay, 
  DarkLoadingOverlay 
} from "./LoadingOverlay";

const LoadingSpinnerTest = () => {
  const [loading, setLoading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const handleTestLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleTestOverlay = () => {
    setOverlayVisible(true);
    setTimeout(() => setOverlayVisible(false), 3000);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Loading Spinner Test Page
      </h1>

      {/* Basic Spinners */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Basic Spinners</h2>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <Spinner size="xs" color="tertiary" />
          <Spinner size="sm" color="primary" />
          <Spinner size="md" color="blue" />
          <Spinner size="lg" color="green" />
          <Spinner size="xl" color="gray" />
          <Spinner size="2xl" color="tertiary" thickness="3" />
        </div>
      </section>

      {/* Page Loaders */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Page Loaders</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-2">Default Page Loader</h3>
            <PageLoader message="Loading data..." />
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-2">Card Loader</h3>
            <CardLoader message="Loading content..." />
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-2">Inline Loader</h3>
            <InlineLoader message="Processing..." />
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-2">Minimal Loader</h3>
            <MinimalLoader message="Loading..." />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-2">Client Page Loader</h3>
          <ClientPageLoader message="Loading your dashboard..." />
        </div>
      </section>

      {/* Loading Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Loading Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButton
            loading={loading}
            loadingText="Submitting..."
            onClick={handleTestLoading}
            className="bg-tertiary text-white px-4 py-2 rounded-lg"
          >
            Test Loading Button
          </LoadingButton>
          
          <LoadingButton
            loading={false}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Normal Button
          </LoadingButton>
          
          <LoadingButton
            loading={true}
            loadingText="Processing..."
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Always Loading
          </LoadingButton>
        </div>
      </section>

      {/* Loading Overlays */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Loading Overlays</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormLoadingOverlay isVisible={overlayVisible}>
            <div className="bg-white border rounded-lg p-6 h-32">
              <h3 className="font-medium mb-2">Form with Overlay</h3>
              <p>This content will be overlaid when loading.</p>
              <button
                onClick={handleTestOverlay}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
              >
                Test Form Overlay
              </button>
            </div>
          </FormLoadingOverlay>
          
          <CardLoadingOverlay isVisible={overlayVisible}>
            <div className="bg-white border rounded-lg p-6 h-32">
              <h3 className="font-medium mb-2">Card with Overlay</h3>
              <p>This card will show a light overlay when loading.</p>
            </div>
          </CardLoadingOverlay>
        </div>
        
        <DarkLoadingOverlay isVisible={overlayVisible}>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-medium mb-2">Dark Overlay Example</h3>
            <p>This content will have a dark overlay when loading.</p>
            <button
              onClick={handleTestOverlay}
              className="mt-2 px-3 py-1 bg-gray-600 text-white rounded"
            >
              Test Dark Overlay
            </button>
          </div>
        </DarkLoadingOverlay>
      </section>

      {/* Full Screen Loader Test */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Full Screen Loader</h2>
        <button
          onClick={() => {
            // Simulate full screen loading
            const overlay = document.createElement('div');
            overlay.innerHTML = `
              <div class="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 border-tertiary border-t-transparent border-2 rounded-full animate-spin drop-shadow-sm"></div>
                  <div class="absolute inset-0 rounded-full animate-ping opacity-20 bg-tertiary" style="animation-duration: 2s"></div>
                  <p class="text-gray-600 mt-4 text-lg font-medium">Loading application...</p>
                </div>
              </div>
            `;
            document.body.appendChild(overlay);
            setTimeout(() => document.body.removeChild(overlay), 3000);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Test Full Screen Loader
        </button>
      </section>

      {/* Implementation Summary */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Implementation Summary</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 mb-3">Enhanced Loading Components</h3>
          <ul className="text-blue-700 text-sm space-y-2">
            <li>✅ Enhanced Spinner component with multiple sizes, colors, and thickness options</li>
            <li>✅ PageLoader with variants (default, minimal, card, inline)</li>
            <li>✅ LoadingButton with consistent spinner integration</li>
            <li>✅ LoadingOverlay with different backdrop styles</li>
            <li>✅ ClientPageLoader for consistent client page loading</li>
            <li>✅ Updated all client pages with modern loading states</li>
            <li>✅ Consistent animations and accessibility features</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default LoadingSpinnerTest;
