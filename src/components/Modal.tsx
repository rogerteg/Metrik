import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        ref={modalRef}
      >
        <header className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button 
            type="button"
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Fechar"
          >
            ×
          </button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
