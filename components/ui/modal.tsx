// components/ui/modal.tsx
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxSize?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxSize = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`bg-white p-6 rounded-lg shadow-lg w-full relative ${maxSize}`}>
        {title && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <hr className="border-t-2 border-gray-300 my-2 " />
          </div>
        )}
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-3xl"
        >
          &times; {/* Icono de cerrar */}
        </button>
      </div>
    </div>
  );
};

export default Modal;
