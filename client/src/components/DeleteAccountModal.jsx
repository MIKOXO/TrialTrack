import { useState } from "react";
import { FaExclamationTriangle, FaTimes, FaTrash } from "react-icons/fa";
import LoadingButton from "./LoadingButton";

const DeleteAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirmTextChange = (e) => {
    const value = e.target.value;
    setConfirmText(value);
    setIsConfirmed(value === "DELETE");
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmText("");
    setIsConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="font-Lexend fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 text-lg md:text-xl mr-2 flex-shrink-0" />
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              Delete Account
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4 md:mb-6">
          <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3 md:mb-4">
            <p className="text-red-800 text-xs md:text-sm font-medium">
              ⚠️ Warning: All your cases, documents, and personal information
              will be permanently lost.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to
              confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={handleConfirmTextChange}
              placeholder="Type DELETE to confirm"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
          <button
            onClick={handleClose}
            className="w-full md:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm md:text-base order-2 md:order-1"
            disabled={loading}
          >
            Cancel
          </button>
          <LoadingButton
            onClick={handleConfirm}
            loading={loading}
            loadingText="Deleting..."
            disabled={!isConfirmed}
            className={`w-full md:w-auto px-4 py-2 text-white rounded-md transition-colors text-sm md:text-base font-medium order-1 md:order-2 ${
              isConfirmed && !loading
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <FaTrash className="mr-2" />
            Delete Account
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
