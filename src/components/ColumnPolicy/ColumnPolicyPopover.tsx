import React from 'react';
import { ColumnPolicy } from '../../types/columnPolicy';
import './ColumnPolicy.css';

export interface ColumnPolicyPopoverProps {
  isOpen: boolean;
  columnTitle: string;
  policy: ColumnPolicy;
  onClose: () => void;
  onEdit: () => void;
  isReadOnly?: boolean;
}

export const ColumnPolicyPopover: React.FC<ColumnPolicyPopoverProps> = ({
  isOpen,
  columnTitle,
  policy,
  onClose,
  onEdit,
  isReadOnly = false,
}) => {
  if (!isOpen) return null;

  const hasEntry = Boolean(policy.entryCriteria && policy.entryCriteria.trim().length > 0);
  const hasExit = Boolean(policy.exitCriteria && policy.exitCriteria.trim().length > 0);
  const hasAnyPolicy = hasEntry || hasExit;

  return (
    <div className="col-policy-popover" role="dialog" aria-label={`Políticas da coluna ${columnTitle}`}>
      <div className="col-policy-header">
        <div className="col-policy-title-group">
          <span className="col-policy-icon">📋</span>
          <div>
            <h4 className="col-policy-title">Políticas da Coluna</h4>
            <span className="col-policy-subtitle">{columnTitle}</span>
          </div>
        </div>
        <button
          type="button"
          className="col-policy-close-btn"
          onClick={onClose}
          aria-label="Fechar popover de políticas"
        >
          ✕
        </button>
      </div>

      <div className="col-policy-body">
        {!hasAnyPolicy ? (
          <div className="col-policy-empty">
            <p>Nenhuma política explícita configurada para esta etapa.</p>
            {!isReadOnly && (
              <p className="col-policy-empty-sub">
                Defina acordos de trabalho (DoR e DoD) para alinhar o time.
              </p>
            )}
          </div>
        ) : (
          <>
            {hasEntry && (
              <div className="col-policy-section">
                <span className="col-policy-label is-entry">
                  📥 Critérios de Entrada (DoR)
                </span>
                <div className="col-policy-text">{policy.entryCriteria}</div>
              </div>
            )}

            {hasExit && (
              <div className="col-policy-section">
                <span className="col-policy-label is-exit">
                  📤 Critérios de Saída (DoD)
                </span>
                <div className="col-policy-text">{policy.exitCriteria}</div>
              </div>
            )}
          </>
        )}
      </div>

      {!isReadOnly && (
        <div className="col-policy-footer">
          <button
            type="button"
            className="col-policy-edit-btn"
            onClick={onEdit}
            aria-label="Editar Políticas"
          >
            ✏️ Editar Políticas
          </button>
        </div>
      )}
    </div>
  );
};
