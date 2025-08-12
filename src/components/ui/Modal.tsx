import React from "react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={clsx(
          "bg-white rounded-lg shadow-xl max-w-md w-full mx-4",
          className
        )}
      >
        {children}
      </div>
      <button aria-label="Close modal" onClick={onClose} className="sr-only">
        Close
      </button>
    </div>
  );
};
