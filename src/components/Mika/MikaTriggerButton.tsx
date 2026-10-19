/**
 * MikaTriggerButton - Botão global de ativação do copiloto Mika AI (Feature 048)
 * Localizado no cabeçalho da aplicação para acesso instantâneo à gaveta retrátil.
 * Conforme especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-001)
 */

import React from 'react';

export interface MikaTriggerButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  hasAlerts?: boolean;
}

export const MikaTriggerButton: React.FC<MikaTriggerButtonProps> = ({
  onClick,
  isOpen = false,
  hasAlerts = false,
}) => {
  return (
    <button
      type="button"
      className="mika-trigger-btn"
      onClick={onClick}
      aria-label="Abrir copiloto Mika AI"
      aria-expanded={isOpen}
      title="Mika AI Flow Copilot (Painel de Inteligência de Fluxo)"
    >
      <span
        className="mika-avatar-badge"
        style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}
      >
        M
      </span>
      <span>Mika AI</span>
      {hasAlerts && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            display: 'inline-block',
          }}
          title="Alertas de fluxo pendentes"
        />
      )}
    </button>
  );
};
