import React from 'react';
import Button from './Button';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-teal-card rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all border border-teal-light/50">
        <div className="p-6">
          <h3 className="text-lg font-bold text-teal-dark mb-2">{title}</h3>
          <p className="text-sm text-teal-dark/80">{message}</p>
        </div>
        <div className="bg-teal-light/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-teal-light">
          <Button variant="secondary" onClick={onClose} className="px-4 py-2 bg-white text-sm">
            Cancel
          </Button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-red-600 text-white rounded-[6px] hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
