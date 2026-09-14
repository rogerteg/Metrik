import React, { useEffect } from 'react';

export interface ToastNotificationProps {
  message: string | null;
  onClose: () => void;
  durationMs?: number;
}

/**
 * Componente acessível e leve de notificação Toast (Feature 025).
 * Notifica suavemente sobre regras de fluxo e impedimentos sem travar o navegador.
 */
export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onClose,
  durationMs = 4000,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [message, onClose, durationMs]);

  if (!message) return null;

  return (
    <div
      className="metrik-toast-container"
      role="alert"
      aria-live="assertive"
      data-testid="metrik-toast"
    >
      <div className="metrik-toast-content">
        <span className="metrik-toast-icon" aria-hidden="true">⛔</span>
        <span className="metrik-toast-message">{message}</span>
        <button
          type="button"
          className="metrik-toast-close"
          onClick={onClose}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );
};
