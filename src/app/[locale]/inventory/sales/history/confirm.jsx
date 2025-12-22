import React from 'react';

/**
 * A professional confirmation modal with a specific requirement:
 * Clicking the overlay (backdrop) also triggers the onCancel/onQuit action.
 *
 * @param {boolean} isOpen - Controls the visibility of the modal.
 * @param {string} title - The main title/question for the user.
 * @param {string} message - A brief explanation of the action being confirmed.
 * @param {function} onConfirm - Function to execute when the 'Confirm' button is clicked.
 * @param {function} onCancel - Function to execute when 'Cancel' is clicked OR the overlay is clicked.
 * @param {string} confirmButtonText - Text for the confirmation button (default: 'Confirm Action').
 * @param {string} cancelButtonText - Text for the cancellation button (default: 'Quit Action').
 */
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = 'Confirm Action',
  cancelButtonText = 'Quit Action',
}) => {
  if (!isOpen) return null;

  // The overlay has a 'blur' effect (bruh) and triggers onCancel when clicked
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
      onClick={onCancel} // Crucial: This implements the "click overlay to quit" requirement
    >
      {/* Modal content container: We add onClick(e => e.stopPropagation()) 
        to prevent clicks on the content from bubbling up and closing the modal.
      */}
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-2xl transform transition-all"
        onClick={e => e.stopPropagation()} 
      >
        <div className="p-6">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {/* Cancel/Quit Button */}
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {cancelButtonText}
            </button>

            {/* Confirm Button (Orange-400) */}
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
