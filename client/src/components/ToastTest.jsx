import React from "react";
import useToast from "../hooks/useToast";
import ToastContainer from "./ToastContainer";

const ToastTest = () => {
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } =
    useToast();

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Toast Notification Test</h2>

      <div className="space-x-4 mb-8">
        <button
          onClick={() => showSuccess("Hearing successfully scheduled!")}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Test Success Toast
        </button>

        <button
          onClick={() =>
            showError("Failed to schedule hearing. Please try again.")
          }
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Test Error Toast
        </button>

        <button
          onClick={() => showWarning("Please fill in all required fields")}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Test Warning Toast
        </button>

        <button
          onClick={() => showInfo("Information message")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Test Info Toast
        </button>

        <button
          onClick={() =>
            showSuccess(
              'Hearing successfully scheduled for "Sample Case" on 12/25/2024 at 10:00 AM in Courtroom A',
              6000
            )
          }
          className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900"
        >
          Test Long Success Message
        </button>
      </div>

      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
        position="top-right"
      />
    </div>
  );
};

export default ToastTest;
