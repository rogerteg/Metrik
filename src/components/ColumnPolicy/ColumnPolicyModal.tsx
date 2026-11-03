import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ColumnPolicy.css';

export interface ColumnPolicyModalProps {
  isOpen: boolean;
  columnId: string;
  columnTitle: string;
  initialEntryCriteria?: string;
  initialExitCriteria?: string;
  onSave: (columnId: string, data: { entryCriteria: string; exitCriteria: string }) => void;
  onClose: () => void;
}

export const ColumnPolicyModal: React.FC<ColumnPolicyModalProps> = ({
  isOpen,
  columnId,
  columnTitle,
  initialEntryCriteria = '',
  initialExitCriteria = '',
  onSave,
  onClose,
}) => {
  const [entryCriteria, setEntryCriteria] = useState(initialEntryCriteria);
  const [exitCriteria, setExitCriteria] = useState(initialExitCriteria);

  useEffect(() => {
    setEntryCriteria(initialEntryCriteria);
    setExitCriteria(initialExitCriteria);
  }, [initialEntryCriteria, initialExitCriteria, isOpen]);

  const isDirty =
    entryCriteria.trim() !== initialEntryCriteria.trim() ||
    exitCriteria.trim() !== initialExitCriteria.trim();

  const handleAttemptClose = useCallback(() => {
    if (isDirty) {
      if (
        window.confirm(
          'Existem alterações não salvas nas políticas desta coluna. Deseja realmente descartar as alterações?',
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleSave = useCallback(() => {
    onSave(columnId, {
      entryCriteria: entryCriteria.trim(),
      exitCriteria: exitCriteria.trim(),
    });
    onClose();
  }, [columnId, entryCriteria, exitCriteria, onSave, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleAttemptClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleAttemptClose, handleSave]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="col-policy-modal-backdrop"
      onClick={handleAttemptClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="col-policy-modal-title"
    >
      <div className="col-policy-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="col-policy-modal-header">
          <div className="flex-align">
            <span className="col-policy-icon">📋</span>
            <div>
              <h3 id="col-policy-modal-title" className="col-policy-modal-title">
                Políticas da Coluna
              </h3>
              <p className="col-policy-modal-subtitle">Etapa: {columnTitle}</p>
            </div>
          </div>
          <button
            type="button"
            className="col-policy-close-btn"
            onClick={handleAttemptClose}
            aria-label="Fechar editor de políticas"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="col-policy-modal-body">
            <div className="col-policy-field">
              <label className="flow-label" htmlFor="entry-criteria">
                📥 Critérios de Entrada (Definition of Ready)
              </label>
              <p className="field-hint">
                O que o cartão deve possuir antes de ser puxado para esta etapa?
              </p>
              <textarea
                id="entry-criteria"
                className="flow-textarea"
                rows={4}
                placeholder="Ex: Escopo refinado, critérios de aceitação aprovados e dependências liberadas."
                value={entryCriteria}
                onChange={(e) => setEntryCriteria(e.target.value)}
              />
            </div>

            <div className="col-policy-field">
              <label className="flow-label" htmlFor="exit-criteria">
                📤 Critérios de Saída (Definition of Done da Etapa)
              </label>
              <p className="field-hint">
                O que deve estar concluído antes de passar o item para a próxima etapa?
              </p>
              <textarea
                id="exit-criteria"
                className="flow-textarea"
                rows={4}
                placeholder="Ex: Testes unitários com sucesso, documentação atualizada e revisão de pares."
                value={exitCriteria}
                onChange={(e) => setExitCriteria(e.target.value)}
              />
            </div>
          </div>

          <div className="col-policy-modal-footer">
            <button type="button" className="flow-btn-secondary" onClick={handleAttemptClose}>
              Cancelar
            </button>
            <button type="submit" className="flow-btn-primary">
              Salvar Políticas
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
